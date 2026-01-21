'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

type Plan = 'pro' | 'business';
type Interval = 'monthly' | 'yearly';

interface PlanInfo {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

const PLANS: Record<Plan, PlanInfo> = {
  pro: {
    name: 'Pro',
    description: 'For professionals and small businesses',
    monthlyPrice: 9,
    yearlyPrice: 90,
    features: [
      '50 dynamic QR codes',
      '10,000 scans/month',
      'Full scan analytics',
      'Custom logo upload',
      'SVG downloads',
      'Password protection',
      'Expiration & scheduling',
      'Custom patterns & shapes',
      'Gradient colors',
      'Decorative frames',
    ],
  },
  business: {
    name: 'Business',
    description: 'For teams and enterprises',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Unlimited dynamic QR codes',
      'Unlimited scans',
      'REST API access',
      'Bulk CSV generation',
      'Webhook integrations',
      'Team members',
    ],
  },
};

const stripeElementOptions = {
  style: {
    base: {
      color: '#fafafa',
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      fontSize: '16px',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#ef4444',
    },
  },
};

function CheckoutForm({
  plan,
  interval,
  setInterval,
  planInfo
}: {
  plan: Plan;
  interval: Interval;
  setInterval: (interval: Interval) => void;
  planInfo: PlanInfo;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  });

  const price = interval === 'monthly' ? planInfo.monthlyPrice : planInfo.yearlyPrice;
  const isFormComplete = cardComplete.cardNumber && cardComplete.cardExpiry && cardComplete.cardCvc;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      // Step 1: Create SetupIntent to collect payment method
      const setupResponse = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval }),
      });

      const setupData = await setupResponse.json();

      if (!setupResponse.ok) {
        if (setupResponse.status === 401) {
          router.push(`/login?redirect=${encodeURIComponent(`/checkout/${plan}?interval=${interval}`)}`);
          return;
        }
        throw new Error(setupData.error || 'Failed to initialize payment');
      }

      // Step 2: Confirm the SetupIntent with the card element
      const cardNumberElement = elements.getElement(CardNumberElement);

      if (!cardNumberElement) {
        throw new Error('Card element not found');
      }

      const { error: setupError, setupIntent } = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
          },
        }
      );

      if (setupError) {
        if (setupError.type === 'card_error' || setupError.type === 'validation_error') {
          setCardError(setupError.message || 'Card setup failed');
        } else {
          setCardError('An unexpected error occurred. Please try again.');
        }
        setProcessing(false);
        return;
      }

      if (setupIntent?.status !== 'succeeded') {
        setCardError('Card verification failed. Please try again.');
        setProcessing(false);
        return;
      }

      // Step 3: Create the subscription with the collected payment method
      const finalizeResponse = await fetch('/api/stripe/finalize-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupIntentId: setupData.setupIntentId,
          paymentMethodId: setupIntent.payment_method,
        }),
      });

      const finalizeData = await finalizeResponse.json();

      if (!finalizeResponse.ok) {
        throw new Error(finalizeData.error || 'Failed to create subscription');
      }

      // Step 4: Subscription created - redirect to success page
      if (finalizeData.status === 'active' || finalizeData.status === 'trialing') {
        router.push('/subscription/success');
      } else {
        // Handle other statuses (incomplete, past_due, etc.)
        setCardError(`Subscription status: ${finalizeData.status}. Please contact support.`);
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setCardError(error instanceof Error ? error.message : 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/QRWolf_Logo_Icon.png"
              alt="QRWolf"
              width={32}
              height={32}
              className="logo-glow"
            />
            <span className="text-xl font-bold gradient-text">QRWolf</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back Link */}
        <Link
          href="/plans"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to plans
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary */}
          <Card className="p-6 glass h-fit order-2 lg:order-1">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            {/* Plan name and badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{planInfo.name}</span>
              {plan === 'pro' && (
                <Badge className="bg-primary/20 text-primary">Most Popular</Badge>
              )}
              {plan === 'business' && (
                <Badge className="bg-cyan-500/20 text-cyan-400">Best Value</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-6">{planInfo.description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">${price}</span>
              <span className="text-muted-foreground">/{interval === 'monthly' ? 'mo' : 'yr'}</span>
            </div>

            {interval === 'yearly' && (
              <div className="bg-green-500/10 text-green-400 text-sm px-3 py-2 rounded-lg mb-6">
                You save ${planInfo.monthlyPrice * 12 - planInfo.yearlyPrice} per year with annual billing
              </div>
            )}

            {/* Billing Period Toggle */}
            <div className="mb-6">
              <Label className="text-sm text-muted-foreground mb-2 block">Billing Period</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInterval('monthly')}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                    interval === 'monthly'
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setInterval('yearly')}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                    interval === 'yearly'
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  Yearly
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    interval === 'yearly'
                      ? "bg-green-500/30 text-green-300"
                      : "bg-green-500/20 text-green-400"
                  )}>
                    -17%
                  </span>
                </button>
              </div>
            </div>

            {/* Features list */}
            <div className="border-t border-border/50 pt-6">
              <h3 className="text-sm font-medium mb-3">What&apos;s included:</h3>
              <ul className="space-y-2">
                {planInfo.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Right Column - Payment Form */}
          <Card className="p-6 glass order-1 lg:order-2">
            <h2 className="text-lg font-semibold mb-6">Payment Details</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Card Number */}
              <div>
                <Label htmlFor="cardNumber" className="mb-2 block">Card Number</Label>
                <div className="stripe-element-wrapper">
                  <CardNumberElement
                    id="cardNumber"
                    options={{
                      ...stripeElementOptions,
                      showIcon: true,
                    }}
                    onChange={(e) => {
                      setCardComplete(prev => ({ ...prev, cardNumber: e.complete }));
                      if (e.error) setCardError(e.error.message);
                      else if (cardError) setCardError(null);
                    }}
                  />
                </div>
              </div>

              {/* Expiry and CVC side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardExpiry" className="mb-2 block">Expiration</Label>
                  <div className="stripe-element-wrapper">
                    <CardExpiryElement
                      id="cardExpiry"
                      options={stripeElementOptions}
                      onChange={(e) => {
                        setCardComplete(prev => ({ ...prev, cardExpiry: e.complete }));
                        if (e.error) setCardError(e.error.message);
                        else if (cardError) setCardError(null);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cardCvc" className="mb-2 block">CVC</Label>
                  <div className="stripe-element-wrapper">
                    <CardCvcElement
                      id="cardCvc"
                      options={stripeElementOptions}
                      onChange={(e) => {
                        setCardComplete(prev => ({ ...prev, cardCvc: e.complete }));
                        if (e.error) setCardError(e.error.message);
                        else if (cardError) setCardError(null);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Error display */}
              {cardError && (
                <div className="text-sm text-red-400 bg-red-500/10 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{cardError}</span>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-12 text-base glow"
                disabled={processing || !stripe || !isFormComplete}
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Subscribe for $${price}/${interval === 'monthly' ? 'mo' : 'yr'}`
                )}
              </Button>

              {/* Secure payment note */}
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <LockIcon className="w-3.5 h-3.5" />
                  Secured by Stripe. We never store your card details.
                </p>
                <p className="text-xs text-muted-foreground">
                  Cancel anytime. No hidden fees.
                </p>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const plan = params.plan as Plan;
  const initialInterval = (searchParams.get('interval') as Interval) || 'monthly';
  const [interval, setInterval] = useState<Interval>(initialInterval);

  // Validate plan
  if (!plan || !['pro', 'business'].includes(plan)) {
    router.push('/plans');
    return null;
  }

  const planInfo = PLANS[plan];

  return (
    <Elements
      stripe={getStripe()}
      options={{
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#14b8a6',
            colorBackground: '#1e293b',
            colorText: '#fafafa',
            colorDanger: '#ef4444',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            borderRadius: '0.5rem',
          },
        },
      }}
    >
      <CheckoutForm
        plan={plan}
        interval={interval}
        setInterval={setInterval}
        planInfo={planInfo}
      />
    </Elements>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
