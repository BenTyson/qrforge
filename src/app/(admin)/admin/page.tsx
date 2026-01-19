import { createAdminClient } from '@/lib/admin/auth';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import Link from 'next/link';

// Pricing from plans.ts
const PRICING = {
  pro: { monthly: 9, yearly: 90 },
  business: { monthly: 29, yearly: 290 },
};

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();

  // Get start of today and 7 days ago
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all metrics in parallel
  const [
    { count: totalUsers },
    { count: totalQRCodes },
    { count: totalScans },
    { count: scansToday },
    { count: paidUsers },
    { count: newUsersThisWeek },
    { data: recentUsers },
    { data: recentScans },
    { count: proUsers },
    { count: businessUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('qr_codes').select('*', { count: 'exact', head: true }),
    supabase.from('scans').select('*', { count: 'exact', head: true }),
    supabase.from('scans').select('*', { count: 'exact', head: true }).gte('scanned_at', todayStart),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('subscription_tier', 'free'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase.from('profiles').select('id, email, full_name, subscription_tier, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('scans').select(`
      id,
      scanned_at,
      country,
      device_type,
      qr_codes!inner(name, user_id, profiles!inner(email))
    `).order('scanned_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'pro'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'business'),
  ]);

  // Calculate revenue (assuming monthly billing - in production you'd query Stripe for actual intervals)
  const monthlyRevenue = ((proUsers || 0) * PRICING.pro.monthly) + ((businessUsers || 0) * PRICING.business.monthly);
  const yearlyProjection = monthlyRevenue * 12;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Site-wide overview and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminStatsCard
          title="Total Users"
          value={totalUsers || 0}
          icon={UsersIcon}
          color="primary"
        />
        <AdminStatsCard
          title="Total QR Codes"
          value={totalQRCodes || 0}
          icon={QRIcon}
          color="cyan"
        />
        <AdminStatsCard
          title="Total Scans"
          value={totalScans || 0}
          icon={ScanIcon}
          color="emerald"
        />
        <AdminStatsCard
          title="Scans Today"
          value={scansToday || 0}
          icon={TrendingIcon}
          color="purple"
        />
        <AdminStatsCard
          title="Paid Users"
          value={paidUsers || 0}
          icon={CreditCardIcon}
          color="amber"
        />
        <AdminStatsCard
          title="New Users (7d)"
          value={newUsersThisWeek || 0}
          icon={UserPlusIcon}
          color="violet"
        />
      </div>

      {/* Financials Section */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <DollarIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Financials</h2>
              <p className="text-sm text-muted-foreground">Revenue overview based on active subscriptions</p>
            </div>
          </div>
          <Link href="/admin/subscriptions" className="text-sm text-primary hover:underline">
            View details
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Monthly Revenue */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/20">
            <p className="text-sm text-muted-foreground mb-1">Monthly Revenue</p>
            <p className="text-3xl font-bold text-emerald-400">${monthlyRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Current MRR</p>
          </div>

          {/* Yearly Projection */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Yearly Projection</p>
            <p className="text-3xl font-bold text-primary">${yearlyProjection.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">ARR at current rate</p>
          </div>

          {/* Pro Revenue */}
          <div className="p-4 rounded-xl bg-secondary/30">
            <p className="text-sm text-muted-foreground mb-1">Pro Revenue</p>
            <p className="text-2xl font-bold">${((proUsers || 0) * PRICING.pro.monthly).toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            <p className="text-xs text-muted-foreground mt-1">{proUsers || 0} subscribers × ${PRICING.pro.monthly}</p>
          </div>

          {/* Business Revenue */}
          <div className="p-4 rounded-xl bg-secondary/30">
            <p className="text-sm text-muted-foreground mb-1">Business Revenue</p>
            <p className="text-2xl font-bold">${((businessUsers || 0) * PRICING.business.monthly).toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            <p className="text-xs text-muted-foreground mt-1">{businessUsers || 0} subscribers × ${PRICING.business.monthly}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Signups</h2>
            <Link href="/admin/users" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.full_name || 'No name'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.subscription_tier === 'business' ? 'bg-amber-500/20 text-amber-400' :
                      user.subscription_tier === 'pro' ? 'bg-primary/20 text-primary' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {user.subscription_tier || 'free'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(new Date(user.created_at))}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No users yet</p>
            )}
          </div>
        </div>

        {/* Recent Scans */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Scans</h2>
            <Link href="/admin/analytics" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentScans && recentScans.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              recentScans.map((scan: any) => (
                <div key={scan.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{scan.qr_codes?.name || 'Unnamed QR'}</p>
                    <p className="text-xs text-muted-foreground">
                      {scan.qr_codes?.profiles?.email || 'Unknown user'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {scan.country || 'Unknown'} - {scan.device_type || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(new Date(scan.scanned_at))}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No scans yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLinkCard href="/admin/users" label="Manage Users" icon={UsersIcon} />
        <QuickLinkCard href="/admin/qr-codes" label="View QR Codes" icon={QRIcon} />
        <QuickLinkCard href="/admin/analytics" label="Analytics" icon={ChartIcon} />
        <QuickLinkCard href="/admin/subscriptions" label="Subscriptions" icon={CreditCardIcon} />
      </div>
    </div>
  );
}

function QuickLinkCard({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border/50 bg-card/50 backdrop-blur p-4 hover:border-primary/50 hover:bg-card/80 transition-all group"
    >
      <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
      <p className="text-sm font-medium">{label}</p>
    </Link>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
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

function QRIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="14" width="3" height="3" />
      <rect x="14" y="18" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
    </svg>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
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
