import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { setupIntentId, paymentMethodId } = await request.json();

    if (!setupIntentId && !paymentMethodId) {
      return NextResponse.json({ error: 'Missing setupIntentId or paymentMethodId' }, { status: 400 });
    }

    // Get the SetupIntent to retrieve metadata and payment method
    let setupIntent: Stripe.SetupIntent | null = null;
    let pmId = paymentMethodId;

    if (setupIntentId) {
      setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
      pmId = setupIntent.payment_method as string;
    }

    if (!pmId) {
      return NextResponse.json({ error: 'No payment method found' }, { status: 400 });
    }

    // Get plan and price from setupIntent metadata or request
    const plan = setupIntent?.metadata?.plan;
    const priceId = setupIntent?.metadata?.price_id;

    if (!plan || !priceId) {
      return NextResponse.json({ error: 'Missing plan information' }, { status: 400 });
    }

    // Get customer ID from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 400 });
    }

    // Set the payment method as the default for the customer
    await stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: pmId,
      },
    });

    // Cancel any existing subscriptions (prevents double-billing on upgrade)
    try {
      const existingSubs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'active',
      });
      const trialingSubs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'trialing',
      });
      const allSubs = [...existingSubs.data, ...trialingSubs.data];
      for (const sub of allSubs) {
        await stripe.subscriptions.cancel(sub.id);
        console.log(`Cancelled old subscription ${sub.id} during upgrade`);
      }
    } catch (cancelError) {
      console.error('Failed to cancel old subscriptions:', cancelError);
      // Continue - we still want to create the new subscription
    }

    // Create the subscription with the payment method
    const subscription = await stripe.subscriptions.create({
      customer: profile.stripe_customer_id,
      items: [{ price: priceId }],
      default_payment_method: pmId,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    });

    console.log('Subscription created:', {
      id: subscription.id,
      status: subscription.status,
    });

    // If subscription is active, update the profile immediately
    if (subscription.status === 'active') {
      await supabase
        .from('profiles')
        .update({
          subscription_tier: plan,
          subscription_status: 'active',
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Finalize subscription error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
