import Stripe from 'stripe';

// Initialize Stripe with error handling for missing keys
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey || stripeSecretKey === 'sk_test_...') {
  console.warn('⚠️  Stripe Secret Key not configured. Payment features will be disabled.');
}

export const stripe = stripeSecretKey && stripeSecretKey !== 'sk_test_...' 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

// Pricing configuration
export const pricingTiers = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 39,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
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
    highlights: [
      '1 project',
      '2 monitors',
      '50 tracked queries',
      '2 competitors',
      'Weekly updates',
      'Email support',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH || process.env.STRIPE_PRICE_GROWTH || 'price_growth_placeholder',
    popular: true,
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
    highlights: [
      '2 projects',
      '5 monitors',
      '150 tracked queries',
      '5 competitors',
      'Weekly updates',
      '3 team seats',
      'API access',
      'Priority support',
    ],
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    price: 149,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE || process.env.STRIPE_PRICE_SCALE || 'price_scale_placeholder',
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
    highlights: [
      '5 projects',
      '15 monitors',
      '350 tracked queries',
      '10 competitors',
      'Daily updates',
      '10 team seats',
      'Custom queries',
      'White label option',
      'API access',
      'Priority support',
    ],
  },
} as const;

export type PricingTier = keyof typeof pricingTiers;

// Helper functions
export function getPricingTier(priceId: string): PricingTier | null {
  const entry = Object.entries(pricingTiers).find(
    ([_, tier]) => tier.priceId === priceId
  );
  return entry ? (entry[0] as PricingTier) : null;
}

export function canUseStripe(): boolean {
  return stripe !== null;
}