import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_PRICES } from '@/lib/stripe/config';
import { createClient } from '@supabase/supabase-js';
import { sendSubscriptionConfirmEmail, sendPaymentFailedEmail, sendTrialEndingSoonEmail } from '@/lib/email';
import type Stripe from 'stripe';

// Use service role key for webhook (no auth context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Check if event has already been processed (idempotency)
async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .single();

  return !!data;
}

// Mark event as processed
async function markEventProcessed(eventId: string, eventType: string): Promise<void> {
  await supabaseAdmin
    .from('webhook_events')
    .insert({ event_id: eventId, event_type: eventType });
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Check for duplicate event (idempotency)
  const alreadyProcessed = await isEventProcessed(event.id);
  if (alreadyProcessed) {
    console.log(`Webhook event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'invoice.payment_succeeded': {
        // Cast to access properties that may not be in the type definition
        const invoiceData = event.data.object as unknown as {
          subscription?: string;
          customer?: string;
          billing_reason?: string;
        };
        // Only handle subscription creation invoices (for custom checkout flow)
        if (invoiceData.subscription && invoiceData.billing_reason === 'subscription_create') {
          await handleSubscriptionPaymentSucceeded(
            invoiceData.subscription,
            invoiceData.customer!
          );
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        // Stripe sends this 3 days before trial ends
        const subscription = event.data.object as Stripe.Subscription;
        await handleTrialWillEnd(subscription);
        break;
      }
    }

    // Mark event as processed after successful handling
    await markEventProcessed(event.id, event.type);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Return 500 so Stripe will retry the webhook
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  const plan = session.metadata?.plan as 'pro' | 'business';

  if (!userId || !plan) {
    console.error('Missing metadata in checkout session:', {
      sessionId: session.id,
      metadata: session.metadata,
    });
    throw new Error('Missing required metadata in checkout session');
  }

  const customerId = session.customer;
  if (!customerId || typeof customerId !== 'string') {
    console.error('Missing customer ID in checkout session:', session.id);
    throw new Error('Missing customer ID in checkout session');
  }

  // Get user profile for email and referral info
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name, referred_by, subscription_tier')
    .eq('id', userId)
    .single();

  // Check if this is their first upgrade (referral credit eligibility)
  const wasFreeTier = profile?.subscription_tier === 'free';

  // Check if this subscription has a trial
  let subscriptionStatus = 'active';
  let isTrialing = false;
  let trialEndDate: string | null = null;
  if (session.subscription) {
    try {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      if (sub.status === 'trialing') {
        subscriptionStatus = 'trialing';
        isTrialing = true;
        // Store the trial end date for display purposes
        if (sub.trial_end) {
          trialEndDate = new Date(sub.trial_end * 1000).toISOString();
        }
      }
    } catch {
      // Use default status if retrieval fails
    }
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: plan,
      subscription_status: subscriptionStatus,
      stripe_customer_id: customerId,
      // Mark trial as used and store end date if they started with a trial
      ...(isTrialing && { trial_used: true, trial_ends_at: trialEndDate }),
    })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }

  console.log(`Subscription activated for user ${userId}: ${plan}`);

  // Credit referrer if this is user's first upgrade from free tier
  if (wasFreeTier && profile?.referred_by) {
    await creditReferrerForUpgrade(userId, profile.referred_by);
  }

  // Send subscription confirmation email (non-blocking)
  if (profile?.email) {
    let billingCycle: 'monthly' | 'yearly' = 'monthly';
    let nextBillingDate = 'Next month';

    if (session.subscription) {
      try {
        const subResponse = await stripe.subscriptions.retrieve(session.subscription as string);
        // Access subscription data with dynamic typing for Stripe v20+ compatibility
        const sub = subResponse as unknown as Record<string, unknown>;
        const items = sub.items as { data: Array<{ price?: { recurring?: { interval?: string } } }> };
        billingCycle = items?.data?.[0]?.price?.recurring?.interval === 'year'
          ? 'yearly'
          : 'monthly';
        const periodEnd = sub.current_period_end as number | undefined;
        if (periodEnd) {
          nextBillingDate = new Date(periodEnd * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        }
      } catch {
        // Use defaults if subscription retrieval fails
      }
    }

    const amount = session.amount_total
      ? `$${(session.amount_total / 100).toFixed(2)}`
      : plan === 'pro' ? '$9/month' : '$29/month';

    sendSubscriptionConfirmEmail(
      profile.email,
      profile.full_name,
      plan,
      billingCycle,
      amount,
      nextBillingDate
    ).then((result) => {
      if (!result.success) {
        console.error('Failed to send subscription email:', result.error);
      }
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  if (!customerId) {
    throw new Error('Missing customer ID in subscription');
  }

  // Find user by customer ID
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profileError || !profile) {
    console.error('No profile found for customer:', customerId);
    throw new Error(`No profile found for customer: ${customerId}`);
  }

  // Determine plan from price ID by matching against configured prices
  const priceId = subscription.items.data[0]?.price?.id;
  let tier: 'free' | 'pro' | 'business' = 'free';

  if (priceId) {
    if (priceId === STRIPE_PRICES.pro_monthly || priceId === STRIPE_PRICES.pro_yearly) {
      tier = 'pro';
    } else if (priceId === STRIPE_PRICES.business_monthly || priceId === STRIPE_PRICES.business_yearly) {
      tier = 'business';
    }
  }

  // Map Stripe status to our status
  let status = 'active';
  if (subscription.status === 'trialing') status = 'trialing';
  if (subscription.status === 'past_due') status = 'past_due';
  if (subscription.status === 'canceled') status = 'canceled';
  if (subscription.status === 'unpaid') status = 'unpaid';

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: status,
    })
    .eq('id', profile.id);

  if (error) {
    console.error('Failed to update subscription:', error);
    throw error;
  }

  console.log(`Subscription updated for user ${profile.id}: ${tier} (${status})`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  if (!customerId) {
    throw new Error('Missing customer ID in subscription');
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profileError || !profile) {
    console.error('No profile found for customer:', customerId);
    throw new Error(`No profile found for customer: ${customerId}`);
  }

  // Downgrade to free
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
    })
    .eq('id', profile.id);

  if (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }

  console.log(`Subscription canceled for user ${profile.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  if (!customerId) {
    throw new Error('Missing customer ID in invoice');
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, subscription_tier')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    // Don't throw for payment failed - user might not exist yet
    console.warn('No profile found for customer:', customerId);
    return;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', profile.id);

  if (error) {
    console.error('Failed to update payment status:', error);
    throw error;
  }

  console.log(`Payment failed for user ${profile.id}`);

  // Send payment failed email (non-blocking)
  if (profile.email && profile.subscription_tier !== 'free') {
    const plan = profile.subscription_tier as 'pro' | 'business';
    const amount = invoice.amount_due
      ? `$${(invoice.amount_due / 100).toFixed(2)}`
      : plan === 'pro' ? '$9' : '$29';

    // Next retry date is typically 3 days after failure
    const retryDate = invoice.next_payment_attempt
      ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : undefined;

    sendPaymentFailedEmail(
      profile.email,
      profile.full_name,
      plan,
      amount,
      retryDate
    ).then((result) => {
      if (!result.success) {
        console.error('Failed to send payment failed email:', result.error);
      }
    });
  }
}

async function handleSubscriptionPaymentSucceeded(subscriptionId: string, customerId: string) {
  if (!subscriptionId || !customerId) {
    throw new Error('Missing subscription or customer ID');
  }

  // Fetch subscription to get metadata (contains plan and user ID)
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.supabase_user_id;
  const plan = subscription.metadata?.plan as 'pro' | 'business';

  if (!userId || !plan) {
    console.error('Missing metadata in subscription:', {
      subscriptionId,
      metadata: subscription.metadata,
    });
    throw new Error('Missing required metadata in subscription');
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: plan,
      subscription_status: 'active',
      stripe_customer_id: customerId,
    })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }

  console.log(`Subscription activated via payment for user ${userId}: ${plan}`);
}

/**
 * Credit the referrer when a referred user upgrades to a paid plan
 * Awards $5 credit (500 cents)
 */
async function creditReferrerForUpgrade(refereeId: string, referrerId: string) {
  const REFERRAL_CREDIT_AMOUNT = 500; // $5 in cents

  try {
    // Find the referral record
    const { data: referral, error: fetchError } = await supabaseAdmin
      .from('referrals')
      .select('id, status')
      .eq('referee_id', refereeId)
      .eq('referrer_id', referrerId)
      .single();

    if (fetchError || !referral) {
      console.log(`No referral record found for referee ${refereeId}`);
      return;
    }

    // Only credit if not already credited
    if (referral.status === 'credited') {
      console.log(`Referral ${referral.id} already credited`);
      return;
    }

    // Get current referrer credits
    const { data: referrerProfile } = await supabaseAdmin
      .from('profiles')
      .select('referral_credits')
      .eq('id', referrerId)
      .single();

    const currentCredits = referrerProfile?.referral_credits || 0;

    // Update referrer credits
    const { error: creditError } = await supabaseAdmin
      .from('profiles')
      .update({ referral_credits: currentCredits + REFERRAL_CREDIT_AMOUNT })
      .eq('id', referrerId);

    if (creditError) {
      console.error('Failed to credit referrer:', creditError);
      return;
    }

    // Update referral status to credited
    await supabaseAdmin
      .from('referrals')
      .update({
        status: 'credited',
        converted_at: new Date().toISOString(),
        credited_at: new Date().toISOString(),
      })
      .eq('id', referral.id);

    console.log(`Credited referrer ${referrerId} with $5 for referee ${refereeId} upgrade`);
  } catch (error) {
    console.error('Error crediting referrer:', error);
  }
}

/**
 * Handle trial ending notification from Stripe (sent 3 days before trial ends)
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  if (!customerId) {
    throw new Error('Missing customer ID in subscription');
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.warn('No profile found for customer:', customerId);
    return;
  }

  // Calculate days remaining
  const trialEnd = subscription.trial_end;
  const daysRemaining = trialEnd
    ? Math.ceil((trialEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
    : 3;

  // Send trial ending email
  if (profile.email) {
    const result = await sendTrialEndingSoonEmail(
      profile.email,
      profile.full_name,
      daysRemaining
    );

    if (!result.success) {
      console.error('Failed to send trial ending email:', result.error);
    } else {
      console.log(`Trial ending email sent to ${profile.email}, ${daysRemaining} days remaining`);
    }
  }
}
