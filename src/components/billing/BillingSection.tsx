'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStripePortal } from '@/hooks/useStripe';

interface BillingSectionProps {
  tier: 'free' | 'pro' | 'business';
  status: string | null;
  staticCount: number;
  dynamicCount: number;
  monthlyScanCount: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  interval: 'month' | 'year' | null;
}

const TIER_INFO = {
  free: {
    name: 'Free',
    dynamicLimit: 0,
    scanLimit: 100,
    color: 'bg-zinc-500/20 text-zinc-400',
  },
  pro: {
    name: 'Pro',
    dynamicLimit: 50,
    scanLimit: 10000,
    color: 'bg-primary/20 text-primary',
  },
  business: {
    name: 'Business',
    dynamicLimit: Infinity,
    scanLimit: Infinity,
    color: 'bg-cyan-500/20 text-cyan-400',
  },
};

export function BillingSection({
  tier,
  status,
  staticCount,
  dynamicCount,
  monthlyScanCount,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  interval,
}: BillingSectionProps) {
  const { openPortal, loading: portalLoading } = useStripePortal();

  const tierInfo = TIER_INFO[tier];
  const isPaid = tier !== 'free';

  // Format renewal date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="p-6 glass mb-6">
      <h2 className="text-lg font-semibold mb-4">Subscription</h2>

      {/* Current Plan */}
      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg mb-4">
        <div className="flex items-center gap-3">
          <Badge className={tierInfo.color}>
            {tierInfo.name}
          </Badge>
          <div>
            <p className="font-medium">{tierInfo.name} Plan</p>
            <p className="text-sm text-muted-foreground">
              {tier === 'free' && 'Basic features with static QR codes'}
              {tier === 'pro' && '50 dynamic QR codes with analytics & custom styling'}
              {tier === 'business' && 'Unlimited dynamic QR codes + API access'}
            </p>
          </div>
        </div>

        {isPaid ? (
          <Button
            variant="outline"
            onClick={openPortal}
            disabled={portalLoading}
          >
            {portalLoading ? 'Loading...' : 'Manage Subscription'}
          </Button>
        ) : (
          <Button asChild>
            <Link href="/plans">View Plans</Link>
          </Button>
        )}
      </div>

      {/* Subscription details for paid plans */}
      {isPaid && (
        <div className="mb-4 p-3 bg-secondary/20 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge className={
              status === 'active' ? 'bg-green-500/20 text-green-400' :
              status === 'past_due' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }>
              {status === 'active' && 'Active'}
              {status === 'past_due' && 'Past Due'}
              {status === 'canceled' && 'Canceled'}
              {status === 'unpaid' && 'Unpaid'}
            </Badge>
          </div>

          {interval && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Billing</span>
              <span className="text-sm font-medium">
                {interval === 'month' ? 'Monthly' : 'Yearly'}
              </span>
            </div>
          )}

          {currentPeriodEnd && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {cancelAtPeriodEnd ? 'Access until' : 'Renews on'}
              </span>
              <span className="text-sm font-medium">
                {formatDate(currentPeriodEnd)}
              </span>
            </div>
          )}

          {cancelAtPeriodEnd && (
            <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-400">
              Your subscription is set to cancel. You&apos;ll retain access until the end of your billing period.
            </div>
          )}
        </div>
      )}

      {/* Usage */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium mb-3">Current Usage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-secondary/20 rounded-lg">
            <p className="text-2xl font-bold">{staticCount}</p>
            <p className="text-sm text-muted-foreground">Static QR Codes</p>
            <p className="text-xs text-muted-foreground mt-1">Unlimited</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg">
            <p className="text-2xl font-bold">
              {dynamicCount}
              <span className="text-lg text-muted-foreground">
                /{tierInfo.dynamicLimit === Infinity ? '∞' : tierInfo.dynamicLimit}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">Dynamic QR Codes</p>
            {tier === 'free' && (
              <p className="text-xs text-primary mt-1">Upgrade to unlock</p>
            )}
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg">
            <p className="text-2xl font-bold">
              {monthlyScanCount.toLocaleString()}
              <span className="text-lg text-muted-foreground">
                /{tierInfo.scanLimit === Infinity ? '∞' : tierInfo.scanLimit.toLocaleString()}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">Scans This Month</p>
            {monthlyScanCount >= tierInfo.scanLimit && tierInfo.scanLimit !== Infinity && (
              <p className="text-xs text-red-400 mt-1">Limit reached</p>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade prompts for free/pro users */}
      {tier === 'free' && (
        <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-medium mb-2">Unlock Dynamic QR Codes</p>
          <p className="text-xs text-muted-foreground mb-3">
            Create QR codes that can be edited after printing. Track scans with analytics.
          </p>
          <Button size="sm" asChild>
            <Link href="/plans">Compare Plans</Link>
          </Button>
        </div>
      )}

      {tier === 'pro' && (
        <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
          <p className="text-sm font-medium mb-2">Need More?</p>
          <p className="text-xs text-muted-foreground mb-3">
            Upgrade to Business for unlimited dynamic QR codes, API access, and more.
          </p>
          <Button size="sm" asChild>
            <Link href="/plans">View Plans</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
