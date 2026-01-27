import { NextResponse } from 'next/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, plan, interval } = await request.json();

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
    let selectedPriceId = priceId;
    if (!selectedPriceId && plan && interval) {
      if (plan === 'pro') {
        selectedPriceId = interval === 'yearly'
          ? STRIPE_PRICES.pro_yearly
          : STRIPE_PRICES.pro_monthly;
      } else if (plan === 'business') {
        selectedPriceId = interval === 'yearly'
          ? STRIPE_PRICES.business_yearly
          : STRIPE_PRICES.business_monthly;
      }
    }

    if (!selectedPriceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Check if user is eligible for trial (Pro plan, hasn't used trial before)
    let trialDays: number | undefined;
    if (plan === 'pro') {
      const { data: trialCheck } = await supabase
        .from('profiles')
        .select('trial_used')
        .eq('id', user.id)
        .single();

      if (!trialCheck?.trial_used) {
        trialDays = 7; // 7-day free trial for first-time Pro subscribers
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      ...(trialDays && {
        subscription_data: {
          trial_period_days: trialDays,
          metadata: {
            supabase_user_id: user.id,
            plan,
          },
        },
      }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com'}/subscription/success${trialDays ? '?trial=true' : ''}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com'}/#pricing`,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
