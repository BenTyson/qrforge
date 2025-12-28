import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Pagination constants
const SCANS_PER_PAGE = 10;
const MAX_SCANS_FOR_AGGREGATION = 10000;

interface AnalyticsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user's tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const tier = profile?.subscription_tier || 'free';
  const isPro = tier === 'pro' || tier === 'business';

  // Fetch user's QR codes with scan counts
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('id, name, scan_count')
    .eq('user_id', user.id);

  const qrCodeIds = qrCodes?.map(qr => qr.id) || [];

  // Get total scan count for pagination
  const { count: totalScansCount } = qrCodeIds.length > 0
    ? await supabase
        .from('scans')
        .select('id', { count: 'exact', head: true })
        .in('qr_code_id', qrCodeIds)
    : { count: 0 };

  // Fetch scans for aggregation (limited for performance)
  const { data: aggregationScans } = qrCodeIds.length > 0
    ? await supabase
        .from('scans')
        .select('scanned_at, ip_hash, device_type, browser, country, city')
        .in('qr_code_id', qrCodeIds)
        .order('scanned_at', { ascending: false })
        .limit(MAX_SCANS_FOR_AGGREGATION)
    : { data: [] };

  // Fetch paginated scans for recent activity table
  const offset = (currentPage - 1) * SCANS_PER_PAGE;
  const { data: paginatedScans } = qrCodeIds.length > 0
    ? await supabase
        .from('scans')
        .select('id, qr_code_id, scanned_at, device_type, browser, country, city')
        .in('qr_code_id', qrCodeIds)
        .order('scanned_at', { ascending: false })
        .range(offset, offset + SCANS_PER_PAGE - 1)
    : { data: [] };

  const allScans = aggregationScans || [];
  const totalPages = Math.ceil((totalScansCount || 0) / SCANS_PER_PAGE);

  // Calculate stats - use actual count from DB, not array length
  const totalScans = totalScansCount || 0;
  const uniqueVisitors = new Set(allScans.map(s => s.ip_hash)).size;

  // Get scans for different time periods
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const scansToday = allScans.filter(s => new Date(s.scanned_at) >= today).length;
  const scansThisWeek = allScans.filter(s => new Date(s.scanned_at) >= thisWeek).length;
  const scansThisMonth = allScans.filter(s => new Date(s.scanned_at) >= thisMonth).length;

  // Device breakdown
  const deviceBreakdown = allScans.reduce((acc, scan) => {
    const device = scan.device_type || 'Unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Browser breakdown
  const browserBreakdown = allScans.reduce((acc, scan) => {
    const browser = scan.browser || 'Unknown';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Country breakdown
  const countryBreakdown = allScans.reduce((acc, scan) => {
    const country = scan.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top QR codes
  const topQRCodes = (qrCodes || [])
    .sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0))
    .slice(0, 5);

  // Recent scans with QR code names (from paginated results)
  const qrCodeNames = new Map(qrCodes?.map(qr => [qr.id, qr.name]) || []);
  const recentScans = (paginatedScans || []).map(scan => ({
    ...scan,
    qrName: qrCodeNames.get(scan.qr_code_id) || 'Unknown',
  }));

  // Calculate top country
  const sortedCountries = Object.entries(countryBreakdown)
    .filter(([country]) => country !== 'Unknown')
    .sort((a, b) => (b[1] as number) - (a[1] as number));
  const topCountry = sortedCountries.length > 0 ? sortedCountries[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your QR code performance
          </p>
        </div>
        {!isPro && (
          <Link href="/settings">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm flex items-center gap-2">
              <SparkleIcon className="w-4 h-4" />
              Unlock Full Analytics
            </button>
          </Link>
        )}
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Primary Stat - Total Scans */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <ScanIcon className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="text-4xl font-bold text-primary">{totalScans.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground mt-1">Total Scans</p>
        </div>

        {/* Unique Visitors */}
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-5 hover:border-purple-500/30 transition-colors">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 mb-3">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">{uniqueVisitors.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Unique Visitors</p>
        </div>

        {/* Scans Today */}
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mb-3">
            <ZapIcon className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">{scansToday.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Today</p>
        </div>

        {/* Top Country */}
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-5 hover:border-amber-500/30 transition-colors">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 mb-3">
            <GlobeIcon className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold truncate">{topCountry?.[0] || '-'}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Top Location</p>
        </div>
      </div>

      {/* Time Period Stats - Horizontal bar style */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6 mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <TrendIcon className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{scansThisWeek.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{scansThisMonth.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
              <ChartIcon className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{scansThisWeek > 0 ? (scansThisWeek / 7).toFixed(1) : '0'}</p>
              <p className="text-xs text-muted-foreground">Daily average</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top QR Codes - Full Width with ranking */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Top Performing QR Codes</h3>
          <Link href="/qr-codes" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        {topQRCodes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
              <QRIcon className="w-6 h-6 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground text-sm">No QR codes yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topQRCodes.map((qr, index) => {
              const maxScans = topQRCodes[0]?.scan_count || 1;
              const percentage = ((qr.scan_count || 0) / maxScans) * 100;
              const colors = ['from-primary to-cyan-500', 'from-purple-500 to-violet-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500'];
              return (
                <div key={qr.id} className="group">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="flex-1 font-medium truncate">{qr.name}</span>
                    <span className="text-sm font-semibold">{(qr.scan_count || 0).toLocaleString()}</span>
                  </div>
                  <div className="ml-10 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colors[index]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown Grid - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Device Breakdown */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <DeviceIcon device="mobile" className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="font-semibold">Devices</h3>
          </div>
          {Object.keys(deviceBreakdown).length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(deviceBreakdown)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .map(([device, count]) => {
                  const pct = totalScans > 0 ? ((count as number) / totalScans) * 100 : 0;
                  return (
                    <div key={device}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize">{device}</span>
                        <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Browser Breakdown */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <BrowserIcon className="w-4 h-4 text-violet-500" />
            </div>
            <h3 className="font-semibold">Browsers</h3>
          </div>
          {Object.keys(browserBreakdown).length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(browserBreakdown)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 4)
                .map(([browser, count]) => {
                  const pct = totalScans > 0 ? ((count as number) / totalScans) * 100 : 0;
                  return (
                    <div key={browser}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="truncate">{browser}</span>
                        <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Country Breakdown */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <GlobeIcon className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-semibold">Locations</h3>
            {!isPro && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-auto">Pro</span>
            )}
          </div>
          {Object.keys(countryBreakdown).length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(countryBreakdown)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 4)
                .map(([country, count]) => {
                  const pct = totalScans > 0 ? ((count as number) / totalScans) * 100 : 0;
                  return (
                    <div key={country}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="truncate">{country}</span>
                        <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
        <h3 className="font-semibold mb-4">Recent Scans</h3>
        {recentScans.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <ScanIcon className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="font-medium text-muted-foreground">No scans yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Scans will appear here once your QR codes are used
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-3 font-medium">QR Code</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Device</th>
                  <th className="pb-3 font-medium">Browser</th>
                  <th className="pb-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {recentScans.map((scan, index) => (
                  <tr key={scan.id} className="group hover:bg-secondary/20 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                        <span className="font-medium">{scan.qrName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatTimeAgo(scan.scanned_at)}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/50 text-xs capitalize">
                        {scan.device_type || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{scan.browser || '-'}</td>
                    <td className="py-3 text-muted-foreground">
                      {scan.city && scan.country
                        ? `${scan.city}, ${scan.country}`
                        : scan.country || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} ({totalScans.toLocaleString()} total scans)
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={currentPage > 1 ? `/analytics?page=${currentPage - 1}` : '#'}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      currentPage > 1
                        ? 'border-border hover:bg-secondary/50 cursor-pointer'
                        : 'border-border/30 text-muted-foreground/50 cursor-not-allowed pointer-events-none'
                    }`}
                    aria-disabled={currentPage <= 1}
                  >
                    Previous
                  </Link>
                  <Link
                    href={currentPage < totalPages ? `/analytics?page=${currentPage + 1}` : '#'}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      currentPage < totalPages
                        ? 'border-border hover:bg-secondary/50 cursor-pointer'
                        : 'border-border/30 text-muted-foreground/50 cursor-not-allowed pointer-events-none'
                    }`}
                    aria-disabled={currentPage >= totalPages}
                  >
                    Next
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
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

function DeviceIcon({ device, className }: { device: string; className?: string }) {
  if (device === 'mobile') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    );
  }
  if (device === 'tablet') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function BrowserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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

function TrendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function QRIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
