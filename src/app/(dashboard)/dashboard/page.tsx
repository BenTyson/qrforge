import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SCAN_LIMITS } from '@/lib/stripe/config';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch real stats from database
  const [qrCodesResult, scansResult, recentScansResult, profileResult] = await Promise.all([
    // Total QR codes and dynamic count
    supabase
      .from('qr_codes')
      .select('id, type, scan_count')
      .eq('user_id', user.id),
    // Scans this month
    supabase
      .from('scans')
      .select('id, qr_code_id, scanned_at')
      .gte('scanned_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    // Recent activity (last 10 scans)
    supabase
      .from('scans')
      .select(`
        id,
        scanned_at,
        device_type,
        country,
        qr_codes!inner(id, name, user_id)
      `)
      .eq('qr_codes.user_id', user.id)
      .order('scanned_at', { ascending: false })
      .limit(10),
    // User profile for scan limits
    supabase
      .from('profiles')
      .select('subscription_tier, monthly_scan_count, scan_count_reset_at')
      .eq('id', user.id)
      .single(),
  ]);

  // Get profile data for scan usage
  const profile = profileResult.data;
  const tier = (profile?.subscription_tier || 'free') as keyof typeof SCAN_LIMITS;
  const scanLimit = SCAN_LIMITS[tier];
  const monthlyScanCount = profile?.monthly_scan_count || 0;

  // Check if we need to reset (new month)
  const resetAt = profile?.scan_count_reset_at ? new Date(profile.scan_count_reset_at) : new Date(0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const effectiveScanCount = resetAt < monthStart ? 0 : monthlyScanCount;

  const qrCodes = qrCodesResult.data || [];
  const userQRCodeIds = qrCodes.map(qr => qr.id);

  // Filter scans to only include user's QR codes
  const scansThisMonth = (scansResult.data || []).filter(
    scan => userQRCodeIds.includes(scan.qr_code_id)
  );

  const stats = {
    totalQRCodes: qrCodes.length,
    dynamicQRCodes: qrCodes.filter(qr => qr.type === 'dynamic').length,
    totalScans: qrCodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0),
    scansThisMonth: scansThisMonth.length,
  };

  // For now, just show the current month count - would need another query for last month comparison

  const recentActivity = (recentScansResult.data || []).map(scan => ({
    id: scan.id,
    qrName: (scan.qr_codes as unknown as { name: string } | null)?.name || 'Unknown',
    scannedAt: scan.scanned_at,
    deviceType: scan.device_type,
    country: scan.country,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your QR codes
        </p>
      </div>

      {/* Stats Grid - More visual variety */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Primary stat - larger and highlighted */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
              <QRIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-bold text-primary">{stats.totalQRCodes}</div>
          <p className="text-sm text-muted-foreground mt-1">Total QR Codes</p>
        </div>

        {/* Secondary stats */}
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500">
              <DynamicIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-full font-medium">
              Pro
            </span>
          </div>
          <div className="text-2xl font-bold">{stats.dynamicQRCodes}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Dynamic QR Codes</p>
        </div>

        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mb-3">
            <ScanIcon className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Total Scans</p>
        </div>

        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 mb-3">
            <TrendingIcon className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">{stats.scansThisMonth.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Scans This Month</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Left Column - Quick Actions & Usage */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Actions - Horizontal cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/qr-codes" className="group">
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <ListIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">My QR Codes</p>
                    <p className="text-xs text-muted-foreground">View & manage</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/analytics" className="group">
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                    <ChartIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Analytics</p>
                    <p className="text-xs text-muted-foreground">Track performance</p>
                  </div>
                </div>
              </div>
            </Link>

            {tier !== 'business' ? (
              <Link href="/settings" className="group">
                <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <SparkleIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary">Upgrade</p>
                      <p className="text-xs text-muted-foreground">
                        {tier === 'free' ? 'Unlock Pro' : 'Go Business'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <Link href="/settings" className="group">
                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                      <SettingsIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Settings</p>
                      <p className="text-xs text-muted-foreground">Manage account</p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Scan Usage - Redesigned */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                  <ZapIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Monthly Usage</h2>
                  <p className="text-xs text-muted-foreground capitalize">{tier} Plan</p>
                </div>
              </div>
              {scanLimit !== -1 ? (
                <div className="text-right">
                  <p className="text-2xl font-bold">{effectiveScanCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">of {scanLimit.toLocaleString()} scans</p>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">Unlimited</p>
                  <p className="text-xs text-muted-foreground">scans/month</p>
                </div>
              )}
            </div>

            {scanLimit !== -1 && (
              <>
                <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      effectiveScanCount >= scanLimit
                        ? 'bg-gradient-to-r from-red-500 to-red-400'
                        : effectiveScanCount >= scanLimit * 0.8
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : 'bg-gradient-to-r from-primary to-cyan-500'
                    }`}
                    style={{ width: `${Math.min((effectiveScanCount / scanLimit) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">
                    {effectiveScanCount >= scanLimit ? (
                      <span className="text-red-400 font-medium">Limit reached</span>
                    ) : effectiveScanCount >= scanLimit * 0.8 ? (
                      <span className="text-amber-400">Approaching limit</span>
                    ) : (
                      `${Math.round((effectiveScanCount / scanLimit) * 100)}% used`
                    )}
                  </p>
                  {tier === 'free' && (
                    <Link href="/settings" className="text-xs text-primary hover:underline font-medium">
                      Upgrade for more
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Activity</h2>
            {recentActivity.length > 0 && (
              <Link href="/analytics" className="text-xs text-primary hover:underline">
                View all
              </Link>
            )}
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <ClockIcon className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="font-medium text-muted-foreground">No scans yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Activity will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.slice(0, 6).map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors -mx-2"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <ScanIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.qrName}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.country || 'Unknown'}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(activity.scannedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Getting Started */}
      {stats.totalQRCodes === 0 && (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Get started in 3 steps</h2>
            <p className="text-muted-foreground">Create your first QR code in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-1">Create</h3>
              <p className="text-sm text-muted-foreground">
                Generate a QR code for URLs, WiFi, contacts, and more
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-1">Customize</h3>
              <p className="text-sm text-muted-foreground">
                Add your brand colors and logo
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-1">Track</h3>
              <p className="text-sm text-muted-foreground">
                Monitor scans with real-time analytics
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/qr-codes/new">
              <Button size="lg" className="gap-2">
                <PlusIcon className="w-5 h-5" />
                Create Your First QR Code
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


function QRIcon({ className }: { className?: string } = {}) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function DynamicIcon({ className }: { className?: string } = {}) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function TrendingIcon({ className }: { className?: string } = {}) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string } = {}) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ScanIcon({ className }: { className?: string } = {}) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}


function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string } = {}) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string } = {}) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
