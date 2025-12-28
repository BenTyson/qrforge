import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BillingSection } from '@/components/billing';
import { APIKeysSection } from '@/components/APIKeysSection';
// Teams feature removed for launch - database ready for future implementation

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get profile with subscription info and scan count
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, stripe_customer_id, monthly_scan_count, scan_count_reset_at')
    .eq('id', user?.id)
    .single();

  // Fetch subscription details from Stripe if user has a customer ID
  let subscriptionDetails: {
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    interval: 'month' | 'year' | null;
  } = {
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    interval: null,
  };

  if (profile?.stripe_customer_id) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'all',
        limit: 1,
      });

      const activeSub = subscriptions.data[0];
      if (activeSub) {
        // In Stripe API 2025+, current_period_end is on subscription items
        const firstItem = activeSub.items.data[0];
        subscriptionDetails = {
          currentPeriodEnd: firstItem?.current_period_end
            ? new Date(firstItem.current_period_end * 1000)
            : null,
          cancelAtPeriodEnd: activeSub.cancel_at_period_end,
          interval: firstItem?.price.recurring?.interval as 'month' | 'year' | null,
        };
      }
    } catch (error) {
      console.error('Failed to fetch subscription details:', error);
    }
  }

  // Get QR code counts
  const { count: staticCount } = await supabase
    .from('qr_codes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)
    .eq('type', 'static');

  const { count: dynamicCount } = await supabase
    .from('qr_codes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)
    .eq('type', 'dynamic');

  const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business';
  const status = profile?.subscription_status || null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="p-6 glass mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="mt-1 bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>
        </div>
      </Card>

      {/* Billing Section */}
      <BillingSection
        tier={tier}
        status={status}
        staticCount={staticCount || 0}
        dynamicCount={dynamicCount || 0}
        monthlyScanCount={profile?.monthly_scan_count || 0}
        currentPeriodEnd={subscriptionDetails.currentPeriodEnd?.toISOString() || null}
        cancelAtPeriodEnd={subscriptionDetails.cancelAtPeriodEnd}
        interval={subscriptionDetails.interval}
      />

      {/* API Keys Section */}
      <APIKeysSection tier={tier} />

      {/* Danger Zone */}
      <Card className="p-6 glass border-red-500/20">
        <h2 className="text-lg font-semibold mb-4 text-red-500">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <Button variant="outline" className="text-red-500 border-red-500/50 hover:bg-red-500/10">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
