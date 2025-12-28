import { createAdminClient } from '@/lib/admin/auth';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';

// Pricing from plans.ts
const PRICING = {
  pro: { monthly: 9, yearly: 90 },
  business: { monthly: 29, yearly: 290 },
};

export default async function AdminSubscriptionsPage() {
  const supabase = createAdminClient();

  // Fetch subscription data
  const [
    { data: profiles },
    { count: activeCount },
    { count: pastDueCount },
    { count: canceledCount },
  ] = await Promise.all([
    supabase.from('profiles').select('id, email, subscription_tier, subscription_status, stripe_customer_id, created_at, updated_at'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active').neq('subscription_tier', 'free'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'past_due'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'canceled'),
  ]);

  // Calculate tier counts
  const tierCounts = {
    free: 0,
    pro: 0,
    business: 0,
  };

  profiles?.forEach((p: { subscription_tier: string }) => {
    const tier = p.subscription_tier as keyof typeof tierCounts;
    if (tier in tierCounts) {
      tierCounts[tier]++;
    } else {
      tierCounts.free++;
    }
  });

  // Calculate estimated monthly revenue (assuming monthly billing for simplicity)
  // In production, you'd query Stripe for actual billing intervals
  const estimatedMonthlyRevenue =
    (tierCounts.pro * PRICING.pro.monthly) +
    (tierCounts.business * PRICING.business.monthly);

  const payingUsers = tierCounts.pro + tierCounts.business;
  const totalUsers = tierCounts.free + tierCounts.pro + tierCounts.business;

  // Get recent subscription changes (users with updated subscription)
  const recentChanges = profiles
    ?.filter((p: { subscription_tier: string }) => p.subscription_tier !== 'free')
    .sort((a: { updated_at: string }, b: { updated_at: string }) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Revenue and subscription tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Paying Users"
          value={payingUsers}
          icon={UsersIcon}
          color="primary"
          subtitle={`${totalUsers > 0 ? Math.round(payingUsers / totalUsers * 100) : 0}% of total`}
        />
        <AdminStatsCard
          title="Pro Subscribers"
          value={tierCounts.pro}
          icon={StarIcon}
          color="purple"
        />
        <AdminStatsCard
          title="Business Subscribers"
          value={tierCounts.business}
          icon={BuildingIcon}
          color="amber"
        />
        <AdminStatsCard
          title="Est. Monthly Revenue"
          value={`$${estimatedMonthlyRevenue.toLocaleString()}`}
          icon={DollarIcon}
          color="emerald"
          subtitle="Based on monthly rates"
        />
      </div>

      {/* Subscription Status & Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-primary" />
            Tier Distribution
          </h2>
          <div className="space-y-4">
            {[
              { tier: 'Free', count: tierCounts.free, color: 'from-zinc-500 to-zinc-400' },
              { tier: 'Pro', count: tierCounts.pro, color: 'from-primary to-cyan-400' },
              { tier: 'Business', count: tierCounts.business, color: 'from-amber-500 to-amber-400' },
            ].map(({ tier, count, color }) => (
              <div key={tier}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{tier}</span>
                  <span className="text-muted-foreground">{count} users ({totalUsers > 0 ? Math.round(count / totalUsers * 100) : 0}%)</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${color} rounded-full`}
                    style={{ width: `${totalUsers > 0 ? (count / totalUsers * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <StatusIcon className="w-5 h-5 text-emerald-500" />
            Subscription Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-medium">Active</span>
              </div>
              <span className="text-2xl font-bold text-emerald-400">{activeCount || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-medium">Past Due</span>
              </div>
              <span className="text-2xl font-bold text-amber-400">{pastDueCount || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-medium">Canceled</span>
              </div>
              <span className="text-2xl font-bold text-red-400">{canceledCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarIcon className="w-5 h-5 text-emerald-500" />
          Revenue Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-secondary/30">
            <p className="text-sm text-muted-foreground mb-1">Pro Monthly ($9/mo)</p>
            <p className="text-2xl font-bold">${tierCounts.pro * PRICING.pro.monthly}/mo</p>
            <p className="text-xs text-muted-foreground mt-1">{tierCounts.pro} subscribers</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30">
            <p className="text-sm text-muted-foreground mb-1">Business Monthly ($29/mo)</p>
            <p className="text-2xl font-bold">${tierCounts.business * PRICING.business.monthly}/mo</p>
            <p className="text-xs text-muted-foreground mt-1">{tierCounts.business} subscribers</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/20">
            <p className="text-sm text-muted-foreground mb-1">Total Monthly</p>
            <p className="text-2xl font-bold text-emerald-400">${estimatedMonthlyRevenue}/mo</p>
            <p className="text-xs text-muted-foreground mt-1">${estimatedMonthlyRevenue * 12}/yr annualized</p>
          </div>
        </div>
      </div>

      {/* Recent Paid Users */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">Recent Paid Subscribers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stripe Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {recentChanges && recentChanges.length > 0 ? (
                recentChanges.map((user: {
                  id: string;
                  email: string;
                  subscription_tier: string;
                  subscription_status: string;
                  stripe_customer_id: string | null;
                  updated_at: string;
                }) => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        user.subscription_tier === 'business' ? 'bg-amber-500/20 text-amber-400' :
                        user.subscription_tier === 'pro' ? 'bg-primary/20 text-primary' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {user.subscription_tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        user.subscription_status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        user.subscription_status === 'past_due' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {user.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                      {user.stripe_customer_id ? user.stripe_customer_id.slice(0, 18) + '...' : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No paid subscribers yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Icons
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function PieIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function StatusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
