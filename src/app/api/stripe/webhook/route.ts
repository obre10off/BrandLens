import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { subscriptions, organizations, trials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = session.client_reference_id;
  if (!organizationId) {
    console.error('No organization ID in checkout session');
    return;
  }

  // Get the subscription
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Get price details
  const priceId = subscription.items.data[0].price.id;
  let plan: 'starter' | 'growth' | 'scale' = 'starter';

  if (priceId === process.env.STRIPE_PRICE_GROWTH) {
    plan = 'growth';
  } else if (priceId === process.env.STRIPE_PRICE_SCALE) {
    plan = 'scale';
  }

  // Create or update subscription record
  const [existingSubscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, organizationId));

  if (existingSubscription) {
    await db
      .update(subscriptions)
      .set({
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: priceId,
        plan,
        status: subscription.status as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existingSubscription.id));
  } else {
    await db.insert(subscriptions).values({
      organizationId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: priceId,
      plan,
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }

  // End any active trial
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId));

  if (org && org.trialId) {
    await db
      .update(trials)
      .set({
        status: 'converted',
        convertedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(trials.id, org.trialId));
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) {
    console.error('No organization ID in subscription metadata');
    return;
  }

  // Get price details
  const priceId = subscription.items.data[0].price.id;
  let plan: 'starter' | 'growth' | 'scale' = 'starter';

  if (priceId === process.env.STRIPE_PRICE_GROWTH) {
    plan = 'growth';
  } else if (priceId === process.env.STRIPE_PRICE_SCALE) {
    plan = 'scale';
  }

  // Update subscription record
  await db
    .update(subscriptions)
    .set({
      stripePriceId: priceId,
      plan,
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Mark subscription as canceled
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    return;
  }

  // Update subscription status to active if it was past_due
  await db
    .update(subscriptions)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(
      eq(subscriptions.stripeSubscriptionId, invoice.subscription as string)
    );
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    return;
  }

  // Update subscription status
  await db
    .update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(
      eq(subscriptions.stripeSubscriptionId, invoice.subscription as string)
    );

  // TODO: Send email notification about failed payment
}
