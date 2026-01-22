import { createAdminClient } from '@/lib/admin/auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { AdminDetailSection } from '@/components/admin/AdminDetailSection';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const SCANS_PER_PAGE = 20;

export default async function AdminQRCodeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const queryParams = await searchParams;
  const currentPage = parseInt(queryParams.page || '1', 10);
  const offset = (currentPage - 1) * SCANS_PER_PAGE;

  const supabase = createAdminClient();

  // Fetch QR code with owner info
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select(`
      *,
      profiles!inner(id, email, full_name, subscription_tier)
    `)
    .eq('id', id)
    .single();

  if (error || !qrCode) {
    notFound();
  }

  // Fetch scans with pagination
  const { data: scans, count: totalScans } = await supabase
    .from('scans')
    .select('*', { count: 'exact' })
    .eq('qr_code_id', id)
    .order('scanned_at', { ascending: false })
    .range(offset, offset + SCANS_PER_PAGE - 1);

  // Fetch all scans for analytics (without pagination)
  const { data: allScans } = await supabase
    .from('scans')
    .select('*')
    .eq('qr_code_id', id)
    .order('scanned_at', { ascending: false });

  // Calculate device/browser/country breakdown
  const deviceBreakdown: Record<string, number> = {};
  const browserBreakdown: Record<string, number> = {};
  const countryBreakdown: Record<string, number> = {};

  allScans?.forEach((scan) => {
    const device = scan.device_type || 'unknown';
    const browser = scan.browser || 'Unknown';
    const country = scan.country || 'Unknown';

    deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;
    browserBreakdown[browser] = (browserBreakdown[browser] || 0) + 1;
    countryBreakdown[country] = (countryBreakdown[country] || 0) + 1;
  });

  const totalPages = Math.ceil((totalScans || 0) / SCANS_PER_PAGE);
  const now = new Date();
  const isExpired = qrCode.expires_at && new Date(qrCode.expires_at) < now;
  const owner = qrCode.profiles as { id: string; email: string; full_name: string; subscription_tier: string };

  // Parse content for display
  const contentDisplay = typeof qrCode.content === 'object'
    ? JSON.stringify(qrCode.content, null, 2)
    : String(qrCode.content);

  // Parse style for display
  const style = qrCode.style || {};

  return (
    <div className="space-y-8">
      <AdminBreadcrumb
        items={[
          { label: 'QR Codes', href: '/admin/qr-codes' },
          { label: qrCode.name || 'QR Code' },
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          {/* QR Preview placeholder */}
          <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center">
            <QRIcon className="w-16 h-16 text-gray-800" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{qrCode.name || 'Unnamed QR Code'}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  qrCode.type === 'dynamic'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-violet-500/20 text-violet-400'
                }`}
              >
                {qrCode.type}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-secondary text-muted-foreground">
                {qrCode.content_type?.toUpperCase() || 'URL'}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  isExpired
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {isExpired ? 'Expired' : 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Scans"
          value={qrCode.scan_count || 0}
          icon={ScanIcon}
          color="primary"
        />
        <AdminStatsCard
          title="Unique Countries"
          value={Object.keys(countryBreakdown).length}
          icon={GlobeIcon}
          color="cyan"
        />
        <AdminStatsCard
          title="Device Types"
          value={Object.keys(deviceBreakdown).length}
          icon={DeviceIcon}
          color="purple"
        />
        <AdminStatsCard
          title="Created"
          value={new Date(qrCode.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          icon={CalendarIcon}
          color="emerald"
        />
      </div>

      {/* Owner Info */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
        <h3 className="font-semibold text-lg mb-4">Owner</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <Link
              href={`/admin/users/${owner.id}`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {owner.email}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{owner.full_name || 'No name'}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  owner.subscription_tier === 'business'
                    ? 'bg-amber-500/20 text-amber-400'
                    : owner.subscription_tier === 'pro'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {(owner.subscription_tier || 'free').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Details */}
      <AdminDetailSection
        title="QR Code Details"
        items={[
          { label: 'QR Code ID', value: qrCode.id },
          { label: 'Name', value: qrCode.name },
          { label: 'Type', value: qrCode.type },
          { label: 'Content Type', value: qrCode.content_type?.toUpperCase() },
          {
            label: 'Short Code',
            value: qrCode.short_code ? (
              <code className="text-xs bg-secondary px-2 py-1 rounded">
                {qrCode.short_code}
              </code>
            ) : null,
          },
          {
            label: 'Redirect URL',
            value: qrCode.short_code ? (
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com'}/r/${qrCode.short_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm break-all"
              >
                /r/{qrCode.short_code}
              </a>
            ) : null,
          },
          {
            label: 'Destination URL',
            value: qrCode.destination_url ? (
              <a
                href={qrCode.destination_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm break-all"
              >
                {qrCode.destination_url}
              </a>
            ) : null,
          },
          {
            label: 'Expires',
            value: qrCode.expires_at
              ? new Date(qrCode.expires_at).toLocaleString()
              : 'Never',
          },
          {
            label: 'Password Protected',
            value: qrCode.password_hash ? 'Yes' : 'No',
          },
          {
            label: 'Created',
            value: new Date(qrCode.created_at).toLocaleString(),
          },
          {
            label: 'Last Updated',
            value: new Date(qrCode.updated_at).toLocaleString(),
          },
        ]}
      />

      {/* Content Section */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
        <h3 className="font-semibold text-lg mb-4">Content Data</h3>
        <pre className="text-sm bg-secondary/50 p-4 rounded-lg overflow-x-auto">
          {contentDisplay}
        </pre>
      </div>

      {/* Style Section */}
      {Object.keys(style).length > 0 && (
        <AdminDetailSection
          title="Style Settings"
          items={[
            {
              label: 'Foreground Color',
              value: (
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-border"
                    style={{ backgroundColor: style.foregroundColor || '#000000' }}
                  />
                  <code className="text-xs">{style.foregroundColor || '#000000'}</code>
                </div>
              ),
            },
            {
              label: 'Background Color',
              value: (
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-border"
                    style={{ backgroundColor: style.backgroundColor || '#ffffff' }}
                  />
                  <code className="text-xs">{style.backgroundColor || '#ffffff'}</code>
                </div>
              ),
            },
            {
              label: 'Error Correction',
              value: style.errorCorrectionLevel || 'M',
            },
            {
              label: 'Margin',
              value: style.margin !== undefined ? style.margin : 2,
            },
          ]}
        />
      )}

      {/* Analytics Section */}
      {allScans && allScans.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Analytics</h3>
          <AnalyticsCharts
            scans={allScans}
            deviceBreakdown={deviceBreakdown}
            browserBreakdown={browserBreakdown}
          />

          {/* Top Countries */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
            <h4 className="font-semibold mb-4">Top Countries</h4>
            <div className="space-y-2">
              {Object.entries(countryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-sm">{country}</span>
                    <span className="text-sm text-muted-foreground">{count} scans</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Scan History */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Scan History ({totalScans || 0})</h3>
        </div>

        {scans && scans.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Browser
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Referrer
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {scans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        {new Date(scan.scanned_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="capitalize">{scan.device_type || 'Unknown'}</span>
                        {scan.os && (
                          <span className="text-muted-foreground ml-1">({scan.os})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{scan.browser || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm">
                        {scan.city && scan.country
                          ? `${scan.city}, ${scan.country}`
                          : scan.country || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-xs">
                        {scan.referrer || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {offset + 1} to {Math.min(offset + SCANS_PER_PAGE, totalScans || 0)} of{' '}
                  {totalScans} scans
                </p>
                <div className="flex gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/admin/qr-codes/${id}?page=${currentPage - 1}`}
                      className="px-4 py-2 rounded-lg bg-secondary/50 text-sm hover:bg-secondary transition-colors"
                    >
                      Previous
                    </Link>
                  )}
                  {currentPage < totalPages && (
                    <Link
                      href={`/admin/qr-codes/${id}?page=${currentPage + 1}`}
                      className="px-4 py-2 rounded-lg bg-secondary/50 text-sm hover:bg-secondary transition-colors"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No scans recorded yet</div>
        )}
      </div>
    </div>
  );
}

// Icons
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

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
