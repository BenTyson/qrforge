import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QRCodeCard } from '@/components/qr/QRCodeCard';
import { BulkBatchCard } from '@/components/qr/BulkBatchCard';

export default async function QRCodesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user profile and QR codes in parallel
  const [profileResult, qrCodesResult] = await Promise.all([
    supabase.from('profiles').select('subscription_tier').eq('id', user.id).single(),
    supabase.from('qr_codes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);

  const tier = (profileResult.data?.subscription_tier || 'free') as 'free' | 'pro' | 'business';
  const qrCodes = qrCodesResult.data;
  const error = qrCodesResult.error;

  if (error) {
    console.error('Error fetching QR codes:', error);
  }

  const totalScans = qrCodes?.reduce((sum, qr) => sum + (qr.scan_count || 0), 0) || 0;
  const dynamicCount = qrCodes?.filter(qr => qr.type === 'dynamic').length || 0;
  const staticCount = (qrCodes?.length || 0) - dynamicCount;

  // Separate individual codes from bulk batches
  const individualCodes = qrCodes?.filter(qr => !qr.bulk_batch_id) || [];
  const bulkCodes = qrCodes?.filter(qr => qr.bulk_batch_id) || [];

  // Group bulk codes by batch ID
  type BulkBatch = { id: string; codes: typeof bulkCodes; createdAt: string; totalScans: number };
  const bulkBatches: Record<string, BulkBatch> = {};

  for (const qr of bulkCodes) {
    const batchId = qr.bulk_batch_id;
    if (!bulkBatches[batchId]) {
      bulkBatches[batchId] = {
        id: batchId,
        codes: [],
        createdAt: qr.created_at,
        totalScans: 0,
      };
    }
    bulkBatches[batchId].codes.push(qr);
    bulkBatches[batchId].totalScans += qr.scan_count || 0;
  }

  const bulkBatchList = Object.values(bulkBatches).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My QR Codes</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your QR codes
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tier === 'business' && (
            <Link href="/qr-codes/bulk">
              <Button variant="outline" size="lg" className="gap-2">
                <BulkIcon className="w-5 h-5" />
                Bulk Generate
              </Button>
            </Link>
          )}
          <Link href="/qr-codes/new">
            <Button size="lg" className="gap-2">
              <PlusIcon className="w-5 h-5" />
              New QR Code
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {qrCodes && qrCodes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <QRIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{qrCodes.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <DynamicIcon className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dynamicCount}</p>
                <p className="text-xs text-muted-foreground">Dynamic</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <StaticIcon className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{staticCount}</p>
                <p className="text-xs text-muted-foreground">Static</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ScanIcon className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalScans.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Scans</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!qrCodes || qrCodes.length === 0) && (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
            <QRIcon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No QR codes yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first QR code to get started. Generate codes for URLs, WiFi networks, contact cards, and more.
          </p>
          <Link href="/qr-codes/new">
            <Button size="lg" className="gap-2">
              <PlusIcon className="w-5 h-5" />
              Create Your First QR Code
            </Button>
          </Link>
        </div>
      )}

      {/* Individual QR Codes */}
      {individualCodes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <QRIcon className="w-5 h-5 text-primary" />
            QR Codes
            <span className="text-sm font-normal text-muted-foreground">({individualCodes.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {individualCodes.map((qr, index) => (
              <QRCodeCard key={qr.id} qrCode={qr} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Bulk Batches */}
      {bulkBatchList.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BulkIcon className="w-5 h-5 text-amber-500" />
            Bulk Generated
            <span className="text-sm font-normal text-muted-foreground">({bulkCodes.length} codes in {bulkBatchList.length} batch{bulkBatchList.length !== 1 ? 'es' : ''})</span>
          </h2>
          <div className="space-y-4">
            {bulkBatchList.map((batch) => (
              <BulkBatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        </div>
      )}
    </div>
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

function QRIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function DynamicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function StaticIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6v6H9z" />
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

function BulkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
