import { createAdminClient } from '@/lib/admin/auth';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AdminExportButton } from '@/components/admin/AdminExportButton';

export default async function AdminAnalyticsPage() {
  const supabase = createAdminClient();

  // Get time boundaries
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all metrics in parallel
  const [
    { count: totalScans },
    { count: scansToday },
    { count: scansThisWeek },
    { count: scansThisMonth },
    { data: deviceData },
    { data: browserData },
    { data: countryData },
    { data: recentScans },
  ] = await Promise.all([
    supabase.from('scans').select('*', { count: 'exact', head: true }),
    supabase.from('scans').select('*', { count: 'exact', head: true }).gte('scanned_at', todayStart),
    supabase.from('scans').select('*', { count: 'exact', head: true }).gte('scanned_at', weekAgo),
    supabase.from('scans').select('*', { count: 'exact', head: true }).gte('scanned_at', monthAgo),
    supabase.from('scans').select('device_type').not('device_type', 'is', null),
    supabase.from('scans').select('browser').not('browser', 'is', null),
    supabase.from('scans').select('country').not('country', 'is', null),
    supabase.from('scans').select(`
      id,
      scanned_at,
      country,
      city,
      device_type,
      browser,
      qr_codes!inner(name, profiles!inner(email))
    `).order('scanned_at', { ascending: false }).limit(20),
  ]);

  // Aggregate device data
  const deviceCounts: Record<string, number> = {};
  deviceData?.forEach((d: { device_type: string }) => {
    const device = d.device_type || 'Unknown';
    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
  });
  const sortedDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);
  const totalDeviceScans = sortedDevices.reduce((sum, [, count]) => sum + count, 0);

  // Aggregate browser data
  const browserCounts: Record<string, number> = {};
  browserData?.forEach((b: { browser: string }) => {
    const browser = b.browser || 'Unknown';
    browserCounts[browser] = (browserCounts[browser] || 0) + 1;
  });
  const sortedBrowsers = Object.entries(browserCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalBrowserScans = sortedBrowsers.reduce((sum, [, count]) => sum + count, 0);

  // Aggregate country data
  const countryCounts: Record<string, number> = {};
  countryData?.forEach((c: { country: string }) => {
    const country = c.country || 'Unknown';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const totalCountryScans = sortedCountries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Site-wide scan analytics and insights</p>
        </div>
        <AdminExportButton type="scans" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Scans"
          value={totalScans || 0}
          icon={ScanIcon}
          color="primary"
        />
        <AdminStatsCard
          title="Scans Today"
          value={scansToday || 0}
          icon={CalendarIcon}
          color="emerald"
        />
        <AdminStatsCard
          title="This Week"
          value={scansThisWeek || 0}
          icon={TrendingIcon}
          color="purple"
        />
        <AdminStatsCard
          title="This Month"
          value={scansThisMonth || 0}
          icon={ChartIcon}
          color="cyan"
        />
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DeviceIcon className="w-5 h-5 text-cyan-500" />
            Devices
          </h2>
          <div className="space-y-3">
            {sortedDevices.length > 0 ? (
              sortedDevices.map(([device, count]) => (
                <div key={device}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{device}</span>
                    <span className="text-muted-foreground">{count} ({totalDeviceScans > 0 ? Math.round(count / totalDeviceScans * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                      style={{ width: `${totalDeviceScans > 0 ? (count / totalDeviceScans * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GlobeIcon className="w-5 h-5 text-violet-500" />
            Browsers
          </h2>
          <div className="space-y-3">
            {sortedBrowsers.length > 0 ? (
              sortedBrowsers.map(([browser, count]) => (
                <div key={browser}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{browser}</span>
                    <span className="text-muted-foreground">{count} ({totalBrowserScans > 0 ? Math.round(count / totalBrowserScans * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full"
                      style={{ width: `${totalBrowserScans > 0 ? (count / totalBrowserScans * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-emerald-500" />
            Top Countries
          </h2>
          <div className="space-y-3">
            {sortedCountries.length > 0 ? (
              sortedCountries.map(([country, count]) => (
                <div key={country}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{country}</span>
                    <span className="text-muted-foreground">{count} ({totalCountryScans > 0 ? Math.round(count / totalCountryScans * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      style={{ width: `${totalCountryScans > 0 ? (count / totalCountryScans * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">Recent Scans</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">QR Code</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Device</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Browser</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {recentScans && recentScans.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recentScans.map((scan: any) => (
                  <tr key={scan.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{scan.qr_codes?.name || 'Unnamed'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{scan.qr_codes?.profiles?.email || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {scan.city && scan.country ? `${scan.city}, ${scan.country}` : scan.country || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">{scan.device_type || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm">{scan.browser || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatTimeAgo(new Date(scan.scanned_at))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No scans yet
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

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
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

function DeviceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
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

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
