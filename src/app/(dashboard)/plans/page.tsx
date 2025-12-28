'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

type Tier = 'free' | 'pro' | 'business';
type Interval = 'monthly' | 'yearly';

interface PlanInfo {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  limitations: string[];
}

const PLANS: Record<Tier, PlanInfo> = {
  free: {
    name: 'Free',
    description: 'Perfect for trying out QRWolf',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Unlimited static QR codes',
      '100 scans/month',
      'Custom colors',
      'PNG downloads',
      'Basic support',
    ],
    limitations: [
      'No dynamic QR codes',
      'No analytics',
      'No custom logos',
      'No SVG downloads',
    ],
  },
  pro: {
    name: 'Pro',
    description: 'For professionals and small businesses',
    monthlyPrice: 9,
    yearlyPrice: 90,
    popular: true,
    features: [
      'Everything in Free, plus:',
      '50 dynamic QR codes',
      '10,000 scans/month',
      'Full scan analytics',
      'Custom logo upload',
      'SVG downloads',
      'Password protection',
      'Expiration & scheduling',
      'Branded landing pages',
      'Priority support',
    ],
    limitations: [],
  },
  business: {
    name: 'Business',
    description: 'For teams and enterprises',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Everything in Pro, plus:',
      'Unlimited dynamic QR codes',
      'Unlimited scans',
      'REST API access',
      'Bulk CSV generation',
      'Webhook integrations',
      'Dedicated support',
    ],
    limitations: [],
  },
};

export default function PlansPage() {
  const router = useRouter();
  const [interval, setInterval] = useState<Interval>('monthly');
  const [currentTier, setCurrentTier] = useState<Tier>('free');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentTier = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (profile?.subscription_tier) {
          setCurrentTier(profile.subscription_tier as Tier);
        }
      }
      setLoading(false);
    };

    fetchCurrentTier();
  }, []);

  const handleSelectPlan = async (plan: Tier) => {
    if (plan === 'free' || plan === currentTier) return;

    setCheckoutLoading(plan);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutLoading(null);
    }
  };

  const getButtonText = (plan: Tier) => {
    if (checkoutLoading === plan) return 'Loading...';
    if (plan === currentTier) return 'Current Plan';
    if (plan === 'free') return 'Free Forever';

    const tierOrder = { free: 0, pro: 1, business: 2 };
    if (tierOrder[plan] < tierOrder[currentTier]) return 'Downgrade';
    return 'Upgrade';
  };

  const getButtonVariant = (plan: Tier) => {
    if (plan === currentTier) return 'outline' as const;
    if (plan === 'pro' && currentTier === 'free') return 'default' as const;
    return 'outline' as const;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the plan that best fits your needs
        </p>
      </div>

      {/* Current Plan Badge */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full">
          <span className="text-sm text-muted-foreground">Current plan:</span>
          <Badge className={
            currentTier === 'business' ? 'bg-cyan-500/20 text-cyan-400' :
            currentTier === 'pro' ? 'bg-primary/20 text-primary' :
            'bg-zinc-500/20 text-zinc-400'
          }>
            {PLANS[currentTier].name}
          </Badge>
        </div>
      </div>

      {/* Billing Interval Toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <button
          onClick={() => setInterval('monthly')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            interval === 'monthly'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval('yearly')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            interval === 'yearly'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          Yearly
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            interval === 'yearly'
              ? 'bg-green-500/30 text-green-300'
              : 'bg-green-500/20 text-green-400'
          }`}>
            Save 17%
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.entries(PLANS) as [Tier, PlanInfo][]).map(([key, plan]) => {
          const isCurrentPlan = key === currentTier;
          const price = interval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

          return (
            <Card
              key={key}
              className={`p-6 relative overflow-hidden transition-all ${
                isCurrentPlan
                  ? 'border-primary ring-2 ring-primary/20'
                  : plan.popular
                    ? 'border-primary/50'
                    : 'border-border/50'
              } ${plan.popular ? 'glass' : 'bg-card/50'}`}
            >
              {/* Popular Badge */}
              {plan.popular && !isCurrentPlan && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                  Most Popular
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                  Current Plan
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${price}</span>
                  {key !== 'free' && (
                    <span className="text-muted-foreground">
                      /{interval === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>
                {key !== 'free' && interval === 'yearly' && (
                  <p className="text-sm text-green-400 mt-1">
                    ${plan.monthlyPrice * 12 - plan.yearlyPrice} saved per year
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XIcon className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full ${plan.popular && !isCurrentPlan ? 'glow' : ''}`}
                variant={getButtonVariant(key)}
                disabled={isCurrentPlan || key === 'free' || checkoutLoading !== null}
                onClick={() => handleSelectPlan(key)}
              >
                {getButtonText(key)}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* FAQ Link */}
      <div className="text-center mt-10">
        <p className="text-sm text-muted-foreground">
          Have questions?{' '}
          <a href="/#faq" className="text-primary hover:underline">
            Check our FAQ
          </a>
          {' '}or{' '}
          <a href="/contact" className="text-primary hover:underline">
            contact us
          </a>
        </p>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
