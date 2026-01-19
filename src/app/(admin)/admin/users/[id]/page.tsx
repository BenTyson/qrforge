import { createAdminClient } from '@/lib/admin/auth';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { AdminDetailSection } from '@/components/admin/AdminDetailSection';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const SCAN_LIMITS: Record<string, number> = {
  free: 100,
  pro: 10000,
  business: -1, // unlimited
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch user profile
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !user) {
    notFound();
  }

  // Fetch user's QR codes
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  // Fetch scans for user's QR codes
  const qrCodeIds = qrCodes?.map((qr) => qr.id) || [];
  const { data: scans } = qrCodeIds.length > 0
    ? await supabase
        .from('scans')
        .select('*')
        .in('qr_code_id', qrCodeIds)
        .order('scanned_at', { ascending: false })
    : { data: [] };

  // Calculate totals
  const totalScans = qrCodes?.reduce((sum, qr) => sum + (qr.scan_count || 0), 0) || 0;
  const scanLimit = SCAN_LIMITS[user.subscription_tier || 'free'];

  // Calculate device/browser breakdown
  const deviceBreakdown: Record<string, number> = {};
  const browserBreakdown: Record<string, number> = {};
  const countryBreakdown: Record<string, number> = {};

  scans?.forEach((scan) => {
    const device = scan.device_type || 'unknown';
    const browser = scan.browser || 'Unknown';
    const country = scan.country || 'Unknown';

    deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;
    browserBreakdown[browser] = (browserBreakdown[browser] || 0) + 1;
    countryBreakdown[country] = (countryBreakdown[country] || 0) + 1;
  });

  const now = new Date();

  return (
    <div className="space-y-8">
      <AdminBreadcrumb
        items={[
          { label: 'Users', href: '/admin/users' },
          { label: user.email || 'User' },
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.full_name || 'Avatar'}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.email}</h1>
            <p className="text-muted-foreground">{user.full_name || 'No name set'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  user.subscription_tier === 'business'
                    ? 'bg-amber-500/20 text-amber-400'
                    : user.subscription_tier === 'pro'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {(user.subscription_tier || 'free').toUpperCase()}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  user.subscription_status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : user.subscription_status === 'past_due'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {user.subscription_status || 'active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="QR Codes"
          value={qrCodes?.length || 0}
          icon={QRIcon}
          color="primary"
        />
        <AdminStatsCard
          title="Total Scans"
          value={totalScans}
          icon={ScanIcon}
          color="cyan"
        />
        <AdminStatsCard
          title="Monthly Scans"
          value={user.monthly_scan_count || 0}
          subtitle={scanLimit > 0 ? `of ${scanLimit.toLocaleString()} limit` : 'unlimited'}
          icon={ChartIcon}
          color="purple"
        />
        <AdminStatsCard
          title="Member Since"
          value={new Date(user.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })}
          icon={CalendarIcon}
          color="emerald"
        />
      </div>

      {/* Account Details */}
      <AdminDetailSection
        title="Account Details"
        items={[
          { label: 'User ID', value: user.id },
          { label: 'Email', value: user.email },
          { label: 'Full Name', value: user.full_name },
          {
            label: 'Stripe Customer ID',
            value: user.stripe_customer_id ? (
              <a
                href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {user.stripe_customer_id}
              </a>
            ) : null,
          },
          { label: 'Subscription Tier', value: (user.subscription_tier || 'free').toUpperCase() },
          { label: 'Subscription Status', value: user.subscription_status || 'active' },
          {
            label: 'Account Created',
            value: new Date(user.created_at).toLocaleString(),
          },
          {
            label: 'Last Updated',
            value: new Date(user.updated_at).toLocaleString(),
          },
        ]}
      />

      {/* QR Codes Section */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">QR Codes ({qrCodes?.length || 0})</h3>
        </div>

        {qrCodes && qrCodes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Scans
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {qrCodes.map((qr) => {
                  const isExpired = qr.expires_at && new Date(qr.expires_at) < now;
                  return (
                    <tr key={qr.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{qr.name || 'Unnamed'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            qr.type === 'dynamic'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-violet-500/20 text-violet-400'
                          }`}
                        >
                          {qr.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-secondary text-muted-foreground">
                          {qr.content_type?.toUpperCase() || 'URL'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{qr.scan_count || 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            isExpired
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(qr.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/qr-codes/${qr.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No QR codes created yet
          </div>
        )}
      </div>

      {/* Analytics Section */}
      {scans && scans.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Analytics</h3>
          <AnalyticsCharts
            scans={scans}
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
    </div>
  );
}

// Icons
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
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
