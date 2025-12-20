import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch real stats from database
  const [qrCodesResult, scansResult, recentScansResult] = await Promise.all([
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
  ]);

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

  // Calculate trend (compare to last month)
  const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
  // For now, just show the current month count - would need another query for last month comparison

  const recentActivity = (recentScansResult.data || []).map(scan => ({
    id: scan.id,
    qrName: (scan.qr_codes as any)?.name || 'Unknown',
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total QR Codes"
          value={stats.totalQRCodes}
          icon={<QRIcon />}
        />
        <StatCard
          title="Dynamic QR Codes"
          value={stats.dynamicQRCodes}
          icon={<DynamicIcon />}
          badge="Pro"
        />
        <StatCard
          title="Total Scans"
          value={stats.totalScans}
          icon={<ScanIcon />}
        />
        <StatCard
          title="Scans This Month"
          value={stats.scansThisMonth}
          icon={<CalendarIcon />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 glass">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/qr-codes/new">
              <Button className="w-full h-auto py-4 flex-col gap-2">
                <PlusIcon className="w-5 h-5" />
                <span>Create QR Code</span>
              </Button>
            </Link>
            <Link href="/qr-codes">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <ListIcon className="w-5 h-5" />
                <span>View All QR Codes</span>
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <ChartIcon className="w-5 h-5" />
                <span>View Analytics</span>
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-primary/50 text-primary hover:bg-primary/10">
                <SparkleIcon className="w-5 h-5" />
                <span>Upgrade to Pro</span>
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 glass">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <ClockIcon className="w-12 h-12 mb-3 opacity-30" />
              <p>No recent activity</p>
              <p className="text-sm">Create your first QR code to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ScanIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.qrName}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.deviceType && `${activity.deviceType} • `}
                      {activity.country || 'Unknown location'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(activity.scannedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Getting Started */}
      {stats.totalQRCodes === 0 && (
        <Card className="p-6 glass">
          <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-4 p-4 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium">Create a QR code</h3>
                <p className="text-sm text-muted-foreground">
                  Generate your first QR code for a URL, WiFi, or contact card
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium">Customize the design</h3>
                <p className="text-sm text-muted-foreground">
                  Add your brand colors and logo to make it unique
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium">Track your scans</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor performance with real-time analytics
                </p>
              </div>
            </div>
          </div>
        </Card>
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

function StatCard({
  title,
  value,
  icon,
  badge,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  badge?: string;
  trend?: string;
}) {
  return (
    <Card className="p-6 glass">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          {icon}
        </div>
        {badge && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{value.toLocaleString()}</span>
          {trend && (
            <span className="text-sm text-green-500">{trend}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </Card>
  );
}

function QRIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function DynamicIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
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

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
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
