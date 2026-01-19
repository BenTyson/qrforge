import { createAdminClient } from '@/lib/admin/auth';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AdminExportButton } from '@/components/admin/AdminExportButton';
import Link from 'next/link';

const ITEMS_PER_PAGE = 20;

export default async function AdminQRCodesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; content_type?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const typeFilter = params.type || 'all';
  const contentTypeFilter = params.content_type || 'all';
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const supabase = createAdminClient();

  // Build query
  let qrQuery = supabase
    .from('qr_codes')
    .select(`
      id,
      name,
      type,
      content_type,
      scan_count,
      created_at,
      expires_at,
      user_id,
      profiles!inner(email)
    `, { count: 'exact' });

  if (typeFilter !== 'all') {
    qrQuery = qrQuery.eq('type', typeFilter);
  }

  if (contentTypeFilter !== 'all') {
    qrQuery = qrQuery.eq('content_type', contentTypeFilter);
  }

  const { data: qrCodes, count: totalQRCodes } = await qrQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  // Get aggregate stats
  const [
    { count: dynamicCount },
    { count: staticCount },
    { count: totalScansCount },
  ] = await Promise.all([
    supabase.from('qr_codes').select('*', { count: 'exact', head: true }).eq('type', 'dynamic'),
    supabase.from('qr_codes').select('*', { count: 'exact', head: true }).eq('type', 'static'),
    supabase.from('scans').select('*', { count: 'exact', head: true }),
  ]);

  const totalPages = Math.ceil((totalQRCodes || 0) / ITEMS_PER_PAGE);
  const now = new Date();

  const contentTypes = ['url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Codes</h1>
          <p className="text-muted-foreground mt-1">All QR codes across the platform</p>
        </div>
        <AdminExportButton type="qr-codes" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total QR Codes"
          value={(dynamicCount || 0) + (staticCount || 0)}
          icon={QRIcon}
          color="primary"
        />
        <AdminStatsCard
          title="Dynamic"
          value={dynamicCount || 0}
          icon={LinkIcon}
          color="cyan"
        />
        <AdminStatsCard
          title="Static"
          value={staticCount || 0}
          icon={LockIcon}
          color="purple"
        />
        <AdminStatsCard
          title="Total Scans"
          value={totalScansCount || 0}
          icon={ScanIcon}
          color="emerald"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground self-center">Type:</span>
          {['all', 'dynamic', 'static'].map((type) => (
            <Link
              key={type}
              href={`/admin/qr-codes?type=${type}${contentTypeFilter !== 'all' ? `&content_type=${contentTypeFilter}` : ''}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground self-center">Content:</span>
          <Link
            href={`/admin/qr-codes?content_type=all${typeFilter !== 'all' ? `&type=${typeFilter}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              contentTypeFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </Link>
          {contentTypes.map((ct) => (
            <Link
              key={ct}
              href={`/admin/qr-codes?content_type=${ct}${typeFilter !== 'all' ? `&type=${typeFilter}` : ''}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                contentTypeFilter === ct
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {ct.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      {/* QR Codes Table */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Content</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Scans</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {qrCodes && qrCodes.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                qrCodes.map((qr: any) => {
                  const isExpired = qr.expires_at && new Date(qr.expires_at) < now;
                  return (
                    <tr key={qr.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/qr-codes/${qr.id}`} className="block">
                          <p className="text-sm font-medium hover:text-primary transition-colors">{qr.name || 'Unnamed'}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/users/${qr.user_id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {qr.profiles?.email || 'Unknown'}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          qr.type === 'dynamic' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-violet-500/20 text-violet-400'
                        }`}>
                          {qr.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-secondary text-muted-foreground">
                          {qr.content_type?.toUpperCase() || 'URL'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{qr.scan_count || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isExpired ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(qr.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/qr-codes/${qr.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    No QR codes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {offset + 1} to {Math.min(offset + ITEMS_PER_PAGE, totalQRCodes || 0)} of {totalQRCodes} QR codes
            </p>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/admin/qr-codes?page=${currentPage - 1}${typeFilter !== 'all' ? `&type=${typeFilter}` : ''}${contentTypeFilter !== 'all' ? `&content_type=${contentTypeFilter}` : ''}`}
                  className="px-4 py-2 rounded-lg bg-secondary/50 text-sm hover:bg-secondary transition-colors"
                >
                  Previous
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/qr-codes?page=${currentPage + 1}${typeFilter !== 'all' ? `&type=${typeFilter}` : ''}${contentTypeFilter !== 'all' ? `&content_type=${contentTypeFilter}` : ''}`}
                  className="px-4 py-2 rounded-lg bg-secondary/50 text-sm hover:bg-secondary transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
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

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
