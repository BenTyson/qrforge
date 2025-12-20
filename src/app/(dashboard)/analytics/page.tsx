import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function AnalyticsPage() {
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

  // Fetch user's QR codes
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('id, name, scan_count')
    .eq('user_id', user.id);

  const qrCodeIds = qrCodes?.map(qr => qr.id) || [];

  // Fetch scans for user's QR codes
  const { data: scans } = qrCodeIds.length > 0
    ? await supabase
        .from('scans')
        .select('*')
        .in('qr_code_id', qrCodeIds)
        .order('scanned_at', { ascending: false })
    : { data: [] };

  const allScans = scans || [];

  // Calculate stats
  const totalScans = allScans.length;
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

  // Recent scans with QR code names
  const qrCodeNames = new Map(qrCodes?.map(qr => [qr.id, qr.name]) || []);
  const recentScans = allScans.slice(0, 10).map(scan => ({
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
          <Link href="/#pricing">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
              Upgrade for More
            </button>
          </Link>
        )}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Scans" value={totalScans} />
        <StatCard title="Unique Visitors" value={uniqueVisitors} />
        <StatCard title="Scans Today" value={scansToday} />
        <StatCard title="Top Country" value={topCountry?.[0] || '-'} isText />
      </div>

      {/* Time Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 glass">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">This Week</p>
            <TrendIcon className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2">{scansThisWeek}</p>
          <p className="text-xs text-muted-foreground mt-1">scans in the last 7 days</p>
        </Card>
        <Card className="p-6 glass">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">This Month</p>
            <CalendarIcon className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2">{scansThisMonth}</p>
          <p className="text-xs text-muted-foreground mt-1">scans this month</p>
        </Card>
        <Card className="p-6 glass">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Avg Daily</p>
            <ChartIcon className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2">
            {scansThisWeek > 0 ? (scansThisWeek / 7).toFixed(1) : '0'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">scans per day (7d avg)</p>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top QR Codes */}
        <Card className="p-6 glass">
          <h3 className="text-lg font-semibold mb-4">Top QR Codes</h3>
          {topQRCodes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No QR codes yet</p>
          ) : (
            <div className="space-y-3">
              {topQRCodes.map((qr, index) => (
                <div key={qr.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate">{qr.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {qr.scan_count || 0} scans
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Device Breakdown */}
        <Card className="p-6 glass">
          <h3 className="text-lg font-semibold mb-4">Device Types</h3>
          {Object.keys(deviceBreakdown).length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(deviceBreakdown)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .map(([device, count]) => (
                  <div key={device} className="flex items-center gap-3">
                    <DeviceIcon device={device} className="w-5 h-5 text-primary" />
                    <span className="flex-1 capitalize">{device}</span>
                    <span className="text-sm text-muted-foreground">
                      {count as number} ({totalScans > 0 ? (((count as number) / totalScans) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      {/* Two Column Layout - Browsers & Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Browser Breakdown */}
        <Card className="p-6 glass">
          <h3 className="text-lg font-semibold mb-4">Browsers</h3>
          {Object.keys(browserBreakdown).length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(browserBreakdown)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 5)
                .map(([browser, count]) => (
                  <div key={browser} className="flex items-center gap-3">
                    <BrowserIcon className="w-5 h-5 text-primary" />
                    <span className="flex-1">{browser}</span>
                    <span className="text-sm text-muted-foreground">
                      {count as number} ({totalScans > 0 ? (((count as number) / totalScans) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* Country Breakdown */}
        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Countries</h3>
            {!isPro && (
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                Pro
              </Badge>
            )}
          </div>
          {Object.keys(countryBreakdown).length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(countryBreakdown)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 5)
                .map(([country, count]) => (
                  <div key={country} className="flex items-center gap-3">
                    <GlobeIcon className="w-5 h-5 text-primary" />
                    <span className="flex-1">{country}</span>
                    <span className="text-sm text-muted-foreground">
                      {count as number} ({totalScans > 0 ? (((count as number) / totalScans) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 glass">
        <h3 className="text-lg font-semibold mb-4">Recent Scans</h3>
        {recentScans.length === 0 ? (
          <p className="text-muted-foreground text-sm">No scans yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">QR Code</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Device</th>
                  <th className="pb-3 font-medium">Browser</th>
                  <th className="pb-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="border-b border-border/50">
                    <td className="py-3 font-medium">{scan.qrName}</td>
                    <td className="py-3 text-muted-foreground">
                      {formatTimeAgo(scan.scanned_at)}
                    </td>
                    <td className="py-3 capitalize">{scan.device_type || '-'}</td>
                    <td className="py-3">{scan.browser || '-'}</td>
                    <td className="py-3">
                      {scan.city && scan.country
                        ? `${scan.city}, ${scan.country}`
                        : scan.country || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ title, value, isText }: { title: string; value: number | string; isText?: boolean }) {
  return (
    <Card className="p-6 glass">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-3xl font-bold">{isText ? value : value.toLocaleString()}</p>
    </Card>
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
