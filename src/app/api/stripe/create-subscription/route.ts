import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, STRIPE_PRICES } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, interval } = await request.json();

    // Validate plan
    if (!['pro', 'business'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Validate interval
    if (!['monthly', 'yearly'].includes(interval)) {
      return NextResponse.json({ error: 'Invalid interval' }, { status: 400 });
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Determine price ID
    let priceId: string;
    if (plan === 'pro') {
      priceId = interval === 'yearly'
        ? STRIPE_PRICES.pro_yearly
        : STRIPE_PRICES.pro_monthly;
    } else {
      priceId = interval === 'yearly'
        ? STRIPE_PRICES.business_yearly
        : STRIPE_PRICES.business_monthly;
    }

    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
    }

    // Step 1: Create a SetupIntent to collect payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        supabase_user_id: user.id,
        plan,
        price_id: priceId,
      },
    });

    console.log('SetupIntent created:', {
      id: setupIntent.id,
      status: setupIntent.status,
    });

    return NextResponse.json({
      setupIntentId: setupIntent.id,
      clientSecret: setupIntent.client_secret,
      customerId,
      priceId,
      plan,
      type: 'setup',
    });
  } catch (error) {
    console.error('Create subscription error:', error);

    // Handle specific Stripe errors
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
