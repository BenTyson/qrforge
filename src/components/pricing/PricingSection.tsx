'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PricingSectionProps {
  isAuthenticated?: boolean;
  currentTier?: string;
}

export function PricingSection({ isAuthenticated = false, currentTier = 'free' }: PricingSectionProps) {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      // Not logged in - send to signup, they can upgrade after
      router.push('/signup');
      return;
    }
    // Logged in - go to plans page
    router.push('/plans');
  };

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      router.push('/signup');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div>
      {/* Interval Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={() => setInterval('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            interval === 'monthly'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval('yearly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            interval === 'yearly'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Yearly
          <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            Save 17%
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Tier */}
        <Card className="p-8 glass">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Free</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
          </div>
          <ul className="space-y-3 mb-8">
            {['Unlimited static QR codes', '100 scans/month', 'Custom colors', 'PNG downloads'].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGetStarted}
            disabled={currentTier !== 'free'}
          >
            {currentTier === 'free' && isAuthenticated ? 'Current Plan' : 'Get Started'}
          </Button>
        </Card>

        {/* Pro Tier */}
        <Card className="p-8 glass border-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
            Popular
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">Pro</h3>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">
                7-day free trial
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">${interval === 'monthly' ? '9' : '90'}</span>
              <span className="text-muted-foreground">/{interval === 'monthly' ? 'month' : 'year'}</span>
            </div>
          </div>
          <ul className="space-y-3 mb-8">
            {[
              'Everything in Free',
              '50 dynamic QR codes',
              '10,000 scans/month',
              'Scan analytics',
              'Custom logo upload',
              'SVG downloads',
              'Password protection',
              'Expiration & scheduling',
              'Custom patterns & shapes',
              'Gradient colors',
              'Decorative frames',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            className="w-full glow"
            onClick={() => handleUpgrade()}
            disabled={currentTier === 'pro'}
          >
            {currentTier === 'pro' ? 'Current Plan' : isAuthenticated ? 'Select Plan' : 'Start Free Trial'}
          </Button>
        </Card>

        {/* Business Tier */}
        <Card className="p-8 glass">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Business</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">${interval === 'monthly' ? '29' : '290'}</span>
              <span className="text-muted-foreground">/{interval === 'monthly' ? 'month' : 'year'}</span>
            </div>
          </div>
          <ul className="space-y-3 mb-8">
            {[
              'Everything in Pro',
              'Unlimited dynamic QR codes',
              'Unlimited scans',
              'API access',
              'Bulk generation (CSV)',
              'Team members (up to 3)',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleUpgrade()}
            disabled={currentTier === 'business'}
          >
            {currentTier === 'business' ? 'Current Plan' : isAuthenticated ? 'Select Plan' : 'Get Started'}
          </Button>
        </Card>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
