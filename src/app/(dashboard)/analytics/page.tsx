import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { QRCodeFilterSelect } from '@/components/analytics/QRCodeFilterSelect';
import type { ScanData } from '@/lib/analytics/types';

// Pagination constants
const SCANS_PER_PAGE = 10;
const MAX_SCANS_FOR_AGGREGATION = 10000;

// Mock data for free users - looks enticing!
const MOCK_DATA = {
  totalScans: 2847,
  uniqueVisitors: 1923,
  scansToday: 127,
  topCountry: 'United States',
  scansThisWeek: 892,
  scansThisMonth: 2134,
  dailyAverage: 127.4,
  trends: {
    todayVsYesterday: 12,
    weekVsLastWeek: 8,
    monthVsLastMonth: 23,
  },
  topQRCodes: [
    { id: '1', name: 'Product Launch Campaign', scan_count: 847 },
    { id: '2', name: 'Restaurant Menu', scan_count: 623 },
    { id: '3', name: 'Business Card - John', scan_count: 412 },
    { id: '4', name: 'Event Registration', scan_count: 298 },
    { id: '5', name: 'WiFi Guest Access', scan_count: 156 },
  ],
  deviceBreakdown: { Mobile: 68, Desktop: 24, Tablet: 8 },
  browserBreakdown: { Chrome: 45, Safari: 32, Firefox: 12, Edge: 11 },
  countryBreakdown: { 'United States': 42, 'United Kingdom': 18, 'Germany': 14, 'Canada': 12, 'Australia': 8, 'France': 6 },
  osBreakdown: { iOS: 38, Android: 30, Windows: 18, macOS: 12, Linux: 2 },
  referrerBreakdown: { Direct: 45, 'google.com': 22, 'facebook.com': 15, 'twitter.com': 10, 'linkedin.com': 8 },
  cityBreakdown: {
    'United States': ['New York', 'Los Angeles', 'Chicago'],
    'United Kingdom': ['London', 'Manchester'],
    'Germany': ['Berlin', 'Munich'],
    'Canada': ['Toronto', 'Vancouver'],
    'Australia': ['Sydney'],
    'France': ['Paris'],
  },
  recentScans: [
    { id: '1', qrName: 'Product Launch Campaign', qr_code_id: '1', scanned_at: new Date(Date.now() - 5 * 60000).toISOString(), device_type: 'Mobile', browser: 'Safari', city: 'New York', country: 'United States' },
    { id: '2', qrName: 'Restaurant Menu', qr_code_id: '2', scanned_at: new Date(Date.now() - 12 * 60000).toISOString(), device_type: 'Mobile', browser: 'Chrome', city: 'London', country: 'United Kingdom' },
    { id: '3', qrName: 'Business Card - John', qr_code_id: '3', scanned_at: new Date(Date.now() - 23 * 60000).toISOString(), device_type: 'Desktop', browser: 'Chrome', city: 'Berlin', country: 'Germany' },
    { id: '4', qrName: 'Event Registration', qr_code_id: '4', scanned_at: new Date(Date.now() - 45 * 60000).toISOString(), device_type: 'Mobile', browser: 'Safari', city: 'Toronto', country: 'Canada' },
    { id: '5', qrName: 'WiFi Guest Access', qr_code_id: '5', scanned_at: new Date(Date.now() - 67 * 60000).toISOString(), device_type: 'Tablet', browser: 'Chrome', city: 'Sydney', country: 'Australia' },
  ],
};

interface AnalyticsPageProps {
  searchParams: Promise<{ page?: string; qr?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const selectedQRId = params.qr || null; // Session 3A: QR code filter

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

  // For free users, show mock data with blur overlay - skip DB queries for performance
  if (!isPro) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - always visible */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your QR code performance
            </p>
          </div>
        </div>

        {/* Blurred content with overlay */}
        <div className="relative">
          {/* Blur overlay */}
          <div className="absolute inset-0 z-10 backdrop-blur-md bg-background/40 rounded-3xl flex items-center justify-center">
            <div className="text-center max-w-md mx-4">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                <LockIcon className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Unlock Analytics</h2>
              <p className="text-muted-foreground mb-6">
                See exactly who&apos;s scanning your QR codes — track locations, devices, browsers, and trends in real-time.
              </p>
              <Link href="/plans">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2 mx-auto">
                  <SparkleIcon className="w-5 h-5" />
                  Upgrade to Pro
                </button>
              </Link>
              <p className="text-xs text-muted-foreground mt-4">
                Starting at $9/month • Cancel anytime
              </p>
            </div>
          </div>

          {/* Mock analytics content (blurred behind overlay) */}
          <div className="select-none pointer-events-none" aria-hidden="true">
            <AnalyticsContent
              totalScans={MOCK_DATA.totalScans}
              uniqueVisitors={MOCK_DATA.uniqueVisitors}
              scansToday={MOCK_DATA.scansToday}
              topCountry={MOCK_DATA.topCountry}
              scansThisWeek={MOCK_DATA.scansThisWeek}
              scansThisMonth={MOCK_DATA.scansThisMonth}
              trends={MOCK_DATA.trends}
              topQRCodes={MOCK_DATA.topQRCodes}
              deviceBreakdown={MOCK_DATA.deviceBreakdown}
              browserBreakdown={MOCK_DATA.browserBreakdown}
              countryBreakdown={MOCK_DATA.countryBreakdown}
              osBreakdown={MOCK_DATA.osBreakdown}
              referrerBreakdown={MOCK_DATA.referrerBreakdown}
              cityBreakdown={MOCK_DATA.cityBreakdown}
              recentScans={MOCK_DATA.recentScans}
              allScans={[]}
              totalPages={1}
              currentPage={1}
              isPro={false}
              selectedQRId={null}
              selectedQRCode={null}
              allQRCodes={[]}
            />
          </div>
        </div>
      </div>
    );
  }

  // Pro/Business users get real data
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('id, name, type, scan_count')
    .eq('user_id', user.id);

  // Session 3A: Filter to single QR code if selected
  const allQRCodes = qrCodes || [];
  let qrCodeIds = allQRCodes.map(qr => qr.id);
  let selectedQRCode: { id: string; name: string; type: string; scan_count: number } | null = null;

  if (selectedQRId) {
    const found = allQRCodes.find(qr => qr.id === selectedQRId);
    if (found) {
      selectedQRCode = found;
      qrCodeIds = [selectedQRId];
    }
  }

  // Get total scan count for pagination
  const { count: totalScansCount } = qrCodeIds.length > 0
    ? await supabase
        .from('scans')
        .select('id', { count: 'exact', head: true })
        .in('qr_code_id', qrCodeIds)
    : { count: 0 };

  // Fetch scans for aggregation (limited for performance) - expanded to include os, referrer, region
  const { data: aggregationScans } = qrCodeIds.length > 0
    ? await supabase
        .from('scans')
        .select('scanned_at, ip_hash, device_type, os, browser, country, city, region, referrer')
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

  const allScans: ScanData[] = (aggregationScans || []) as ScanData[];
  const totalPages = Math.ceil((totalScansCount || 0) / SCANS_PER_PAGE);

  // Calculate stats
  const totalScans = totalScansCount || 0;
  const uniqueVisitors = new Set(allScans.map(s => s.ip_hash)).size;

  // Get scans for different time periods
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const scansToday = allScans.filter(s => new Date(s.scanned_at) >= today).length;
  const scansYesterday = allScans.filter(s => {
    const d = new Date(s.scanned_at);
    return d >= yesterday && d < today;
  }).length;
  const scansThisWeek = allScans.filter(s => new Date(s.scanned_at) >= thisWeek).length;
  const scansLastWeek = allScans.filter(s => {
    const d = new Date(s.scanned_at);
    return d >= lastWeek && d < thisWeek;
  }).length;
  const scansThisMonth = allScans.filter(s => new Date(s.scanned_at) >= thisMonth).length;
  const scansLastMonth = allScans.filter(s => {
    const d = new Date(s.scanned_at);
    return d >= lastMonthStart && d < thisMonth;
  }).length;

  // 2B: Compute trend indicators
  const trends = {
    todayVsYesterday: scansYesterday > 0
      ? Math.round(((scansToday - scansYesterday) / scansYesterday) * 100)
      : null,
    weekVsLastWeek: scansLastWeek > 0
      ? Math.round(((scansThisWeek - scansLastWeek) / scansLastWeek) * 100)
      : null,
    monthVsLastMonth: scansLastMonth > 0
      ? Math.round(((scansThisMonth - scansLastMonth) / scansLastMonth) * 100)
      : null,
  };

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

  // 2A: OS breakdown
  const osBreakdown = allScans.reduce((acc, scan) => {
    const os = scan.os || 'Unknown';
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2A: Referrer breakdown (extract domain, group empty as "Direct")
  const referrerBreakdown = allScans.reduce((acc, scan) => {
    let source = 'Direct';
    if (scan.referrer) {
      try {
        source = new URL(scan.referrer).hostname.replace(/^www\./, '');
      } catch {
        source = scan.referrer;
      }
    }
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2A/2D: City breakdown per country
  const cityBreakdown: Record<string, string[]> = {};
  const cityCountMap: Record<string, Record<string, number>> = {};
  allScans.forEach(scan => {
    if (scan.country && scan.city) {
      if (!cityCountMap[scan.country]) cityCountMap[scan.country] = {};
      cityCountMap[scan.country][scan.city] = (cityCountMap[scan.country][scan.city] || 0) + 1;
    }
  });
  for (const [country, cities] of Object.entries(cityCountMap)) {
    cityBreakdown[country] = Object.entries(cities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city]) => city);
  }

  // Top QR codes
  const topQRCodes = (allQRCodes)
    .sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0))
    .slice(0, 5);

  // Recent scans with QR code names
  const qrCodeNames = new Map(allQRCodes.map(qr => [qr.id, qr.name]));
  const recentScans = (paginatedScans || []).map(scan => ({
    ...scan,
    qrName: qrCodeNames.get(scan.qr_code_id) || 'Unknown',
  }));

  // Calculate top country
  const sortedCountries = Object.entries(countryBreakdown)
    .filter(([country]) => country !== 'Unknown')
    .sort((a, b) => (b[1] as number) - (a[1] as number));
  const topCountry = sortedCountries.length > 0 ? sortedCountries[0][0] : null;

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
      </div>

      {/* 3A: QR Code Filter Dropdown */}
      {allQRCodes.length > 0 && (
        <QRCodeFilter
          qrCodes={allQRCodes.map(qr => ({ id: qr.id, name: qr.name }))}
          selectedQRId={selectedQRId}
        />
      )}

      {/* 3B: Single-QR header card */}
      {selectedQRCode && (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <QRIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{selectedQRCode.name}</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedQRCode.type} QR Code &middot; {(selectedQRCode.scan_count || 0).toLocaleString()} total scans
                </p>
              </div>
            </div>
            <Link
              href={`/qr-codes/${selectedQRCode.id}/edit`}
              className="text-sm text-primary hover:underline font-medium"
            >
              Edit QR Code
            </Link>
          </div>
        </div>
      )}

      <AnalyticsContent
        totalScans={totalScans}
        uniqueVisitors={uniqueVisitors}
        scansToday={scansToday}
        topCountry={topCountry}
        scansThisWeek={scansThisWeek}
        scansThisMonth={scansThisMonth}
        trends={trends}
        topQRCodes={topQRCodes}
        deviceBreakdown={deviceBreakdown}
        browserBreakdown={browserBreakdown}
        countryBreakdown={countryBreakdown}
        osBreakdown={osBreakdown}
        referrerBreakdown={referrerBreakdown}
        cityBreakdown={cityBreakdown}
        recentScans={recentScans}
        allScans={allScans}
        totalPages={totalPages}
        currentPage={currentPage}
        isPro={true}
        selectedQRId={selectedQRId}
        selectedQRCode={selectedQRCode}
        allQRCodes={allQRCodes}
      />
    </div>
  );
}

// 3A: QR Code Filter component
function QRCodeFilter({ qrCodes, selectedQRId }: { qrCodes: { id: string; name: string }[]; selectedQRId: string | null }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <label htmlFor="qr-filter" className="text-sm font-medium text-muted-foreground">
          Filter by QR Code:
        </label>
        <QRCodeFilterSelect
          options={[
            { value: '', label: 'All QR Codes' },
            ...qrCodes.map(qr => ({ value: qr.id, label: qr.name })),
          ]}
          selected={selectedQRId || ''}
        />
      </div>
    </div>
  );
}

// Extracted analytics content component for reuse
interface TrendData {
  todayVsYesterday: number | null;
  weekVsLastWeek: number | null;
  monthVsLastMonth: number | null;
}

interface AnalyticsContentProps {
  totalScans: number;
  uniqueVisitors: number;
  scansToday: number;
  topCountry: string | null;
  scansThisWeek: number;
  scansThisMonth: number;
  trends: TrendData;
  topQRCodes: Array<{ id: string; name: string; scan_count: number }>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
  referrerBreakdown: Record<string, number>;
  cityBreakdown: Record<string, string[]>;
  recentScans: Array<{
    id: string;
    qrName: string;
    qr_code_id: string;
    scanned_at: string;
    device_type: string;
    browser: string;
    city?: string;
    country?: string;
  }>;
  allScans: ScanData[];
  totalPages: number;
  currentPage: number;
  isPro: boolean;
  selectedQRId: string | null;
  selectedQRCode: { id: string; name: string; type: string; scan_count: number } | null;
  allQRCodes: Array<{ id: string; name: string; scan_count: number }>;
}

function AnalyticsContent({
  totalScans,
  uniqueVisitors,
  scansToday,
  topCountry,
  scansThisWeek,
  scansThisMonth,
  trends,
  topQRCodes,
  deviceBreakdown,
  browserBreakdown,
  countryBreakdown,
  osBreakdown,
  referrerBreakdown,
  cityBreakdown,
  recentScans,
  allScans,
  totalPages,
  currentPage,
  isPro,
  selectedQRId,
}: AnalyticsContentProps) {

  // Build pagination URL helper (preserves qr param)
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (selectedQRId) params.set('qr', selectedQRId);
    const qs = params.toString();
    return qs ? `/analytics?${qs}` : '/analytics';
  };

  return (
    <>

      {/* Hero Stats Row with 2B trend badges */}
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

        {/* Scans Today with trend */}
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
              <ZapIcon className="w-5 h-5" />
            </div>
            <TrendBadge value={trends.todayVsYesterday} />
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

      {/* Time Period Stats with trend badges */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6 mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <TrendIcon className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{scansThisWeek.toLocaleString()}</p>
                <TrendBadge value={trends.weekVsLastWeek} />
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{scansThisMonth.toLocaleString()}</p>
                <TrendBadge value={trends.monthVsLastMonth} />
              </div>
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

      {/* Charts Section */}
      {isPro && (
        <div className="mb-8">
          <AnalyticsCharts
            scans={allScans}
            deviceBreakdown={deviceBreakdown}
            browserBreakdown={browserBreakdown}
          />
        </div>
      )}

      {/* 2A: Traffic Sources */}
      {Object.keys(referrerBreakdown).length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <LinkIcon className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="font-semibold">Traffic Sources</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(referrerBreakdown)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .slice(0, 6)
              .map(([source, count]) => {
                const pct = totalScans > 0 ? ((count as number) / totalScans) * 100 : 0;
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="truncate">{source}</span>
                      <span className="text-muted-foreground ml-2">{(count as number).toLocaleString()} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Top QR Codes - hide when filtering single QR (3B) */}
      {!selectedQRId && (
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
                      {/* 2C: Clickable QR name */}
                      <Link href={`/qr-codes/${qr.id}/edit`} className="flex-1 font-medium truncate hover:text-primary transition-colors">
                        {qr.name}
                      </Link>
                      {/* 2C: Analytics link for this QR */}
                      <Link
                        href={`/analytics?qr=${qr.id}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity mr-1"
                        title="View analytics for this QR code"
                      >
                        <MiniChartIcon className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Link>
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
      )}

      {/* Breakdown Grid - 2x2 (expanded from 3-col to include OS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                .slice(0, 5)
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

        {/* 2A: OS Breakdown */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <OSIcon className="w-4 h-4 text-cyan-500" />
            </div>
            <h3 className="font-semibold">Operating Systems</h3>
          </div>
          {Object.keys(osBreakdown).length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(osBreakdown)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 5)
                .map(([os, count]) => {
                  const pct = totalScans > 0 ? ((count as number) / totalScans) * 100 : 0;
                  return (
                    <div key={os}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="truncate">{os}</span>
                        <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* 2A/2D: Enhanced Country/Location Breakdown */}
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
            <LocationBreakdown
              countryBreakdown={countryBreakdown}
              cityBreakdown={cityBreakdown}
              totalScans={totalScans}
            />
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
            {/* Mobile Card Layout */}
            <div className="sm:hidden space-y-3">
              {recentScans.map((scan, index) => (
                <div key={scan.id} className="p-4 rounded-lg bg-secondary/20 border border-border/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                      {/* 2C: Clickable QR name in recent scans */}
                      <Link
                        href={`/analytics?qr=${scan.qr_code_id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {scan.qrName}
                      </Link>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(scan.scanned_at)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="text-xs uppercase tracking-wider">Device</span>
                      <p className="capitalize">{scan.device_type || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider">Location</span>
                      <p>{scan.city && scan.country ? `${scan.city}, ${scan.country}` : scan.country || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <table className="w-full text-sm hidden sm:table">
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
                        {/* 2C: Clickable QR name */}
                        <Link
                          href={`/analytics?qr=${scan.qr_code_id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {scan.qrName}
                        </Link>
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

            {/* Pagination Controls (preserves qr param) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} ({totalScans.toLocaleString()} total scans)
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={currentPage > 1 ? buildPageUrl(currentPage - 1) : '#'}
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
                    href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : '#'}
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
    </>
  );
}

// 2D: Expandable location breakdown component
function LocationBreakdown({
  countryBreakdown,
  cityBreakdown,
  totalScans,
}: {
  countryBreakdown: Record<string, number>;
  cityBreakdown: Record<string, string[]>;
  totalScans: number;
}) {
  const sortedCountries = Object.entries(countryBreakdown)
    .sort((a, b) => (b[1] as number) - (a[1] as number));

  // Show first 6
  const visibleCountries = sortedCountries.slice(0, 6);
  const hasMore = sortedCountries.length > 6;

  return (
    <div className="space-y-3">
      {visibleCountries.map(([country, count]) => {
        const pct = totalScans > 0 ? ((count as number) / totalScans) * 100 : 0;
        const cities = cityBreakdown[country];
        return (
          <div key={country}>
            {cities && cities.length > 0 ? (
              <details className="group/loc">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="truncate flex items-center gap-1">
                      <ChevronIcon className="w-3 h-3 text-muted-foreground transition-transform group-open/loc:rotate-90" />
                      {country}
                    </span>
                    <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                  </div>
                </summary>
                <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden mb-1">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="ml-4 mt-1 space-y-0.5">
                  {cities.map(city => (
                    <p key={city} className="text-xs text-muted-foreground">{city}</p>
                  ))}
                </div>
              </details>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="truncate ml-4">{country}</span>
                  <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                </div>
              </>
            )}
          </div>
        );
      })}
      {hasMore && (
        <details className="group/all">
          <summary className="cursor-pointer text-xs text-primary hover:underline list-none">
            Show all ({sortedCountries.length} countries)
          </summary>
          <div className="mt-2 space-y-3">
            {sortedCountries.slice(6).map(([country, count]) => {
              const pct = totalScans > 0 ? ((count as number) / totalScans) * 100 : 0;
              const cities = cityBreakdown[country];
              return (
                <div key={country}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="truncate">{country}</span>
                    <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  {cities && cities.length > 0 && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {cities.map(city => (
                        <p key={city} className="text-xs text-muted-foreground">{city}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}

// 2B: Trend badge component
function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const positive = value >= 0;
  return (
    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
      positive
        ? 'bg-emerald-500/10 text-emerald-500'
        : 'bg-red-500/10 text-red-500'
    }`}>
      {positive ? (
        <ArrowUpIcon className="w-3 h-3" />
      ) : (
        <ArrowDownIcon className="w-3 h-3" />
      )}
      {positive ? '+' : ''}{value}%
    </span>
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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// 2A: OS icon
function OSIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

// 2A: Link/referrer icon
function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// 2C: Mini chart icon for analytics link on QR rows
function MiniChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

// 2D: Chevron icon for expandable sections
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
