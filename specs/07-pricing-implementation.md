# BrandLens Pricing Implementation

## Pricing Tiers

### Tier Structure
```typescript
export const pricingTiers = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 39,
    priceId: process.env.STRIPE_PRICE_STARTER,
    features: {
      projects: 1,
      monitors: 2,
      trackedQueries: 50,
      responses: 500,
      competitors: 2,
      refreshRate: 'weekly',
      models: ['gpt-4o-mini', 'claude-3-haiku'],
      seats: 1,
      support: 'email',
    },
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 79,
    priceId: process.env.STRIPE_PRICE_GROWTH,
    features: {
      projects: 2,
      monitors: 5,
      trackedQueries: 150,
      responses: 1500,
      competitors: 5,
      refreshRate: 'weekly',
      models: ['gpt-4o-mini', 'gpt-4o', 'claude-3-haiku', 'claude-3-sonnet'],
      seats: 3,
      support: 'priority',
      apiAccess: true,
    },
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    price: 149,
    priceId: process.env.STRIPE_PRICE_SCALE,
    features: {
      projects: 5,
      monitors: 15,
      trackedQueries: 350,
      responses: 4500,
      competitors: 10,
      refreshRate: 'daily',
      models: 'all',
      seats: 10,
      support: 'priority',
      apiAccess: true,
      customQueries: true,
      whiteLabel: true,
    },
  },
};
```

## Stripe Integration

### Setup
```typescript
// src/lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Product and Price setup (run once)
export async function setupStripeProducts() {
  // Create product
  const product = await stripe.products.create({
    name: 'BrandLens',
    description: 'AI Brand Monitoring for SaaS',
  });
  
  // Create prices for each tier
  const starterPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 3900, // $39.00
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    nickname: 'Starter',
  });
  
  const growthPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 7900, // $79.00
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    nickname: 'Growth',
  });
  
  const scalePrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 14900, // $149.00
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    nickname: 'Scale',
  });
  
  console.log('Stripe prices created:', {
    starter: starterPrice.id,
    growth: growthPrice.id,
    scale: scalePrice.id,
  });
}
```

### Checkout Flow
```typescript
// src/app/api/checkout/route.ts
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  const { tier, organizationId } = await request.json();
  
  // Validate tier
  const selectedTier = pricingTiers[tier];
  if (!selectedTier) {
    return new Response("Invalid tier", { status: 400 });
  }
  
  // Check for existing subscription
  const existingSubscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.organizationId, organizationId),
      eq(subscriptions.status, 'active')
    ),
  });
  
  if (existingSubscription) {
    // Handle upgrade/downgrade
    return handleSubscriptionChange(existingSubscription, selectedTier);
  }
  
  // Create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: selectedTier.priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?checkout=cancelled`,
    customer_email: session.user.email,
    metadata: {
      organizationId,
      userId: session.user.id,
      tier: tier,
    },
    subscription_data: {
      trial_period_days: 7, // 7-day free trial
      metadata: {
        organizationId,
      },
    },
    allow_promotion_codes: true,
  });
  
  return Response.json({ url: checkoutSession.url });
}
```

### Subscription Management
```typescript
// src/lib/subscription-manager.ts
export class SubscriptionManager {
  async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const { organizationId, userId, tier } = session.metadata!;
    
    // Create or update subscription record
    await db.insert(subscriptions).values({
      organizationId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      stripePriceId: session.line_items?.data[0].price?.id,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }).onConflictDoUpdate({
      target: subscriptions.organizationId,
      set: {
        stripeSubscriptionId: session.subscription as string,
        status: 'active',
        updatedAt: new Date(),
      },
    });
    
    // Send welcome email
    await sendWelcomeEmail(userId, tier);
    
    // Initialize usage tracking
    await initializeUsageTracking(organizationId);
  }
  
  async handleSubscriptionUpdate(
    subscription: Stripe.Subscription
  ) {
    const orgId = subscription.metadata.organizationId;
    
    await db
      .update(subscriptions)
      .set({
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
    
    // Update organization limits based on new plan
    await updateOrganizationLimits(orgId, subscription);
  }
  
  async handleSubscriptionDeleted(
    subscription: Stripe.Subscription
  ) {
    await db
      .update(subscriptions)
      .set({
        status: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
    
    // Deactivate organization features
    await deactivateOrganization(subscription.metadata.organizationId);
  }
}
```

## Usage Tracking & Limits

### Usage Enforcement
```typescript
export class UsageTracker {
  async checkUsageLimit(
    organizationId: string,
    resource: ResourceType
  ): Promise<boolean> {
    const subscription = await this.getActiveSubscription(organizationId);
    if (!subscription) return false;
    
    const tier = this.getTierFromPrice(subscription.stripePriceId);
    const limits = pricingTiers[tier].features;
    const usage = await this.getCurrentUsage(organizationId);
    
    switch (resource) {
      case 'queries':
        return usage.queriesUsed < limits.trackedQueries;
      case 'competitors':
        return usage.competitorsTracked < limits.competitors;
      case 'projects':
        return usage.projectCount < limits.projects;
      default:
        return false;
    }
  }
  
  async incrementUsage(
    organizationId: string,
    resource: ResourceType,
    amount: number = 1
  ) {
    const period = this.getCurrentPeriod();
    
    await db
      .insert(usageTracking)
      .values({
        organizationId,
        period,
        [resource]: amount,
      })
      .onConflictDoUpdate({
        target: [usageTracking.organizationId, usageTracking.period],
        set: {
          [resource]: sql`${usageTracking[resource]} + ${amount}`,
          updatedAt: new Date(),
        },
      });
  }
  
  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}

// Middleware to check usage
export async function checkUsageMiddleware(
  request: Request,
  resource: ResourceType
) {
  const session = await auth.api.getSession({ headers: request.headers });
  const orgId = await getOrganizationId(session.user.id);
  
  const hasCapacity = await usageTracker.checkUsageLimit(orgId, resource);
  
  if (!hasCapacity) {
    return new Response(
      JSON.stringify({
        error: 'Usage limit exceeded',
        code: 'LIMIT_EXCEEDED',
        upgrade_url: '/pricing',
      }),
      { status: 403 }
    );
  }
}
```

### Billing Portal
```typescript
// src/app/api/billing/portal/route.ts
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.ownerId, session.user.id),
    with: {
      subscription: true,
    },
  });
  
  if (!org?.subscription?.stripeCustomerId) {
    return new Response("No active subscription", { status: 404 });
  }
  
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: org.subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings`,
  });
  
  return Response.json({ url: portalSession.url });
}
```

## Trial Management

### Free Trial Implementation
```typescript
export class TrialManager {
  static TRIAL_DAYS = 7;
  static TRIAL_QUERIES = 25;
  
  async startTrial(organizationId: string) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + TrialManager.TRIAL_DAYS);
    
    await db.insert(trials).values({
      organizationId,
      status: 'active',
      startDate: new Date(),
      endDate: trialEnd,
      queriesUsed: 0,
      queriesLimit: TrialManager.TRIAL_QUERIES,
    });
    
    // Schedule trial ending reminder
    await emailQueue.add('trial-ending-reminder', {
      organizationId,
      sendAt: new Date(trialEnd.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before
    });
  }
  
  async checkTrialStatus(organizationId: string): Promise<TrialStatus> {
    const trial = await db.query.trials.findFirst({
      where: eq(trials.organizationId, organizationId),
    });
    
    if (!trial) return { status: 'no_trial' };
    
    if (new Date() > trial.endDate) {
      return { status: 'expired', daysUsed: TrialManager.TRIAL_DAYS };
    }
    
    if (trial.queriesUsed >= trial.queriesLimit) {
      return { status: 'limit_reached', queriesUsed: trial.queriesUsed };
    }
    
    const daysLeft = Math.ceil(
      (trial.endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );
    
    return {
      status: 'active',
      daysLeft,
      queriesRemaining: trial.queriesLimit - trial.queriesUsed,
    };
  }
}
```

## Pricing Page Component

```typescript
// src/components/pricing/pricing-cards.tsx
export function PricingCards() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const handleSelectPlan = async (tier: string) => {
    if (!user) {
      router.push('/signup');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, organizationId: user.organizationId }),
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {Object.entries(pricingTiers).map(([key, tier]) => (
        <PricingCard
          key={key}
          tier={tier}
          isPopular={key === 'growth'}
          onSelect={() => handleSelectPlan(key)}
          loading={loading}
        />
      ))}
    </div>
  );
}
```

## Revenue Analytics

```typescript
// src/lib/analytics/revenue.ts
export class RevenueAnalytics {
  async getMonthlyRecurringRevenue(): Promise<number> {
    const activeSubscriptions = await db.query.subscriptions.findMany({
      where: eq(subscriptions.status, 'active'),
    });
    
    let mrr = 0;
    for (const sub of activeSubscriptions) {
      const tier = this.getTierFromPriceId(sub.stripePriceId);
      mrr += pricingTiers[tier].price;
    }
    
    return mrr;
  }
  
  async getChurnRate(period: DateRange): Promise<number> {
    const startCount = await this.getActiveSubscriptionCount(period.start);
    const canceledCount = await this.getCanceledCount(period);
    
    return startCount > 0 ? (canceledCount / startCount) * 100 : 0;
  }
  
  async getCustomerLifetimeValue(): Promise<number> {
    const avgMonthlyRevenue = await this.getAverageRevenuePerUser();
    const avgLifetimeMonths = await this.getAverageCustomerLifetime();
    
    return avgMonthlyRevenue * avgLifetimeMonths;
  }
}
```