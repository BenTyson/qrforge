import { createAdminClient } from '@/lib/admin/auth';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AdminExportButton } from '@/components/admin/AdminExportButton';
import Link from 'next/link';

const ITEMS_PER_PAGE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tier?: string; search?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const tierFilter = params.tier || 'all';
  const searchQuery = params.search || '';
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const supabase = createAdminClient();

  // Build query
  let usersQuery = supabase
    .from('profiles')
    .select('id, email, full_name, subscription_tier, subscription_status, monthly_scan_count, created_at', { count: 'exact' });

  if (tierFilter !== 'all') {
    usersQuery = usersQuery.eq('subscription_tier', tierFilter);
  }

  if (searchQuery) {
    usersQuery = usersQuery.ilike('email', `%${searchQuery}%`);
  }

  const { data: users, count: totalUsers } = await usersQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  // Get tier counts
  const [
    { count: freeCount },
    { count: proCount },
    { count: businessCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'free'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'pro'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'business'),
  ]);

  // Get QR code counts for displayed users
  const userIds = users?.map(u => u.id) || [];
  const { data: qrCounts } = userIds.length > 0
    ? await supabase.from('qr_codes').select('user_id').in('user_id', userIds)
    : { data: [] };

  const qrCountMap: Record<string, number> = {};
  qrCounts?.forEach(qr => {
    qrCountMap[qr.user_id] = (qrCountMap[qr.user_id] || 0) + 1;
  });

  const totalPages = Math.ceil((totalUsers || 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">Manage all registered users</p>
        </div>
        <AdminExportButton type="users" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Users"
          value={(freeCount || 0) + (proCount || 0) + (businessCount || 0)}
          icon={UsersIcon}
          color="primary"
        />
        <AdminStatsCard
          title="Free Users"
          value={freeCount || 0}
          icon={UserIcon}
          color="cyan"
        />
        <AdminStatsCard
          title="Pro Users"
          value={proCount || 0}
          icon={StarIcon}
          color="purple"
        />
        <AdminStatsCard
          title="Business Users"
          value={businessCount || 0}
          icon={BuildingIcon}
          color="amber"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <form className="flex gap-2">
          <input
            type="text"
            name="search"
            placeholder="Search by email..."
            defaultValue={searchQuery}
            className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>
        <div className="flex gap-2">
          {['all', 'free', 'pro', 'business'].map((tier) => (
            <Link
              key={tier}
              href={`/admin/users?tier=${tier}${searchQuery ? `&search=${searchQuery}` : ''}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tierFilter === tier
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tier</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">QR Codes</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Scans</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/users/${user.id}`} className="block">
                        <p className="text-sm font-medium hover:text-primary transition-colors">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.full_name || 'No name'}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        user.subscription_tier === 'business' ? 'bg-amber-500/20 text-amber-400' :
                        user.subscription_tier === 'pro' ? 'bg-primary/20 text-primary' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {user.subscription_tier || 'free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        user.subscription_status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        user.subscription_status === 'past_due' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {user.subscription_status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{qrCountMap[user.id] || 0}</td>
                    <td className="px-6 py-4 text-sm">{user.monthly_scan_count || 0}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No users found
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
              Showing {offset + 1} to {Math.min(offset + ITEMS_PER_PAGE, totalUsers || 0)} of {totalUsers} users
            </p>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/admin/users?page=${currentPage - 1}${tierFilter !== 'all' ? `&tier=${tierFilter}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                  className="px-4 py-2 rounded-lg bg-secondary/50 text-sm hover:bg-secondary transition-colors"
                >
                  Previous
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/users?page=${currentPage + 1}${tierFilter !== 'all' ? `&tier=${tierFilter}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
