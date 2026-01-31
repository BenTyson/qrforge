'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QRCodeCard } from '@/components/qr/QRCodeCard';
import { BulkBatchCard } from '@/components/qr/BulkBatchCard';
import { QRFilters } from '@/components/qr/QRFilters';
import { FolderManager } from '@/components/qr/FolderManager';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PLANS } from '@/lib/stripe/plans';
import type { QRContentType } from '@/lib/qr/types';
import type { Folder, SubscriptionTier, QRCode } from '@/lib/supabase/types';

interface QRCodesContentProps {
  qrCodes: QRCode[];
  folders: Folder[];
  tier: SubscriptionTier;
}

type BulkBatch = {
  id: string;
  codes: QRCode[];
  createdAt: string;
  totalScans: number;
};

// Helper to get QR status
function getQRStatus(qr: QRCode): 'active' | 'expired' | 'scheduled' {
  const now = new Date();

  if (qr.expires_at && new Date(qr.expires_at) < now) {
    return 'expired';
  }

  if (qr.active_from && new Date(qr.active_from) > now) {
    return 'scheduled';
  }

  if (qr.active_until && new Date(qr.active_until) < now) {
    return 'expired';
  }

  return 'active';
}

export function QRCodesContent({ qrCodes: initialQrCodes, folders: initialFolders, tier }: QRCodesContentProps) {
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState(initialQrCodes);
  const [folders, setFolders] = useState(initialFolders);
  const [showArchived, setShowArchived] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<QRContentType | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'expired' | 'scheduled' | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Split active vs archived
  const activeCodes = useMemo(() => qrCodes.filter(qr => !qr.archived_at), [qrCodes]);
  const archivedCodes = useMemo(() => qrCodes.filter(qr => qr.archived_at), [qrCodes]);

  // Calculate stats from active codes only
  const totalScans = useMemo(() => activeCodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0), [activeCodes]);
  const dynamicCount = useMemo(() => activeCodes.filter(qr => qr.type === 'dynamic').length, [activeCodes]);
  const staticCount = activeCodes.length - dynamicCount;

  // Check if user is at QR code limit (for duplicate button)
  const qrLimit = PLANS[tier].dynamicQRLimit;
  const duplicateDisabled = qrLimit !== -1 && qrCodes.length >= qrLimit;

  // Filter QR codes (apply to the currently viewed set)
  const currentCodes = showArchived ? archivedCodes : activeCodes;
  const filteredCodes = useMemo(() => {
    return currentCodes.filter(qr => {
      // Search filter
      if (searchQuery && !qr.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Type filter
      if (selectedType && qr.content_type !== selectedType) {
        return false;
      }
      // Status filter
      if (selectedStatus && getQRStatus(qr) !== selectedStatus) {
        return false;
      }
      // Folder filter
      if (selectedFolder === 'uncategorized' && qr.folder_id !== null) {
        return false;
      }
      if (selectedFolder && selectedFolder !== 'uncategorized' && qr.folder_id !== selectedFolder) {
        return false;
      }
      return true;
    });
  }, [currentCodes, searchQuery, selectedType, selectedStatus, selectedFolder]);

  // Separate individual codes from bulk batches
  const individualCodes = useMemo(() => filteredCodes.filter(qr => !qr.bulk_batch_id), [filteredCodes]);
  const bulkCodes = useMemo(() => filteredCodes.filter(qr => qr.bulk_batch_id), [filteredCodes]);

  // Group bulk codes by batch ID
  const bulkBatchList = useMemo(() => {
    const batches: Record<string, BulkBatch> = {};

    for (const qr of bulkCodes) {
      const batchId = qr.bulk_batch_id!;
      if (!batches[batchId]) {
        batches[batchId] = {
          id: batchId,
          codes: [],
          createdAt: qr.created_at,
          totalScans: 0,
        };
      }
      batches[batchId].codes.push(qr);
      batches[batchId].totalScans += qr.scan_count || 0;
    }

    return Object.values(batches).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [bulkCodes]);

  // Get folder color for a QR code
  const getFolderColor = useCallback((folderId: string | null) => {
    if (!folderId) return null;
    return folders.find(f => f.id === folderId)?.color || null;
  }, [folders]);

  // Folder CRUD handlers
  const handleFolderCreate = async (name: string, color: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create folder');
      }

      const newFolder = await response.json();
      setFolders(prev => [...prev, newFolder]);
      toast.success('Folder created');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create folder');
      throw error;
    }
  };

  const handleFolderUpdate = async (id: string, name: string, color: string) => {
    try {
      const response = await fetch(`/api/folders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update folder');
      }

      setFolders(prev => prev.map(f => f.id === id ? { ...f, name, color } : f));
      toast.success('Folder updated');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update folder');
      throw error;
    }
  };

  const handleFolderDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/folders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete folder');
      }

      setFolders(prev => prev.filter(f => f.id !== id));
      if (selectedFolder === id) {
        setSelectedFolder(null);
      }
      toast.success('Folder deleted');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete folder');
      throw error;
    }
  };

  // Assign QR code to folder (optimistic update)
  const handleFolderAssign = async (qrCodeId: string, folderId: string | null) => {
    // Store previous state for rollback
    const previousQrCodes = qrCodes;

    // Optimistically update the UI
    setQrCodes(prev => prev.map(qr =>
      qr.id === qrCodeId ? { ...qr, folder_id: folderId } : qr
    ));

    const folderName = folderId ? folders.find(f => f.id === folderId)?.name : null;
    toast.success(folderName ? `Moved to "${folderName}"` : 'Removed from folder');

    try {
      const response = await fetch(`/api/qr/${qrCodeId}/folder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: folderId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to move QR code');
      }
    } catch (error) {
      // Rollback on error
      setQrCodes(previousQrCodes);
      toast.error(error instanceof Error ? error.message : 'Failed to move QR code');
    }
  };

  // Duplicate handler
  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/qr/${id}/duplicate`, { method: 'POST' });
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          toast.error(error.error || 'QR code limit reached. Upgrade for more.');
        } else {
          toast.error(error.error || 'Failed to duplicate QR code');
        }
        return;
      }
      const duplicate = await response.json();
      toast.success(`Duplicated as "${duplicate.name}"`);
      window.location.reload();
    } catch {
      toast.error('Failed to duplicate QR code');
    }
  };

  // Archive handler (optimistic)
  const handleArchive = async (id: string) => {
    const previousQrCodes = qrCodes;
    const archivedAt = new Date().toISOString();

    setQrCodes(prev => prev.map(qr =>
      qr.id === id ? { ...qr, archived_at: archivedAt } : qr
    ));
    toast.success('QR code archived');

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('qr_codes')
        .update({ archived_at: archivedAt })
        .eq('id', id);

      if (error) throw error;
    } catch {
      setQrCodes(previousQrCodes);
      toast.error('Failed to archive QR code');
    }
  };

  // Restore handler (optimistic)
  const handleRestore = async (id: string) => {
    const previousQrCodes = qrCodes;

    setQrCodes(prev => prev.map(qr =>
      qr.id === id ? { ...qr, archived_at: null } : qr
    ));
    toast.success('QR code restored');

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('qr_codes')
        .update({ archived_at: null })
        .eq('id', id);

      if (error) throw error;
    } catch {
      setQrCodes(previousQrCodes);
      toast.error('Failed to restore QR code');
    }
  };

  // Permanent delete handler
  const handlePermanentDelete = async (id: string) => {
    const previousQrCodes = qrCodes;
    setQrCodes(prev => prev.filter(qr => qr.id !== id));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('QR code permanently deleted');
    } catch {
      setQrCodes(previousQrCodes);
      toast.error('Failed to delete QR code');
    }
  };

  const hasActiveFilters = searchQuery || selectedType || selectedStatus || selectedFolder;

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            My <span className="gradient-text">QR Codes</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage, organize, and track all your QR codes
          </p>
        </div>
        {tier === 'business' ? (
          <Link href="/qr-codes/bulk">
            <Button variant="outline" size="lg" className="gap-2">
              <BulkIcon className="w-5 h-5" />
              Bulk Generate
            </Button>
          </Link>
        ) : (
          <Link href="/plans">
            <Button variant="outline" size="lg" className="gap-2 opacity-70 hover:opacity-100">
              <BulkIcon className="w-5 h-5" />
              Bulk Generate
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                Business
              </span>
            </Button>
          </Link>
        )}
      </div>

      {/* Active / Archived Tabs */}
      {qrCodes.length > 0 && (
        <div className="flex gap-1 mb-6 p-1 bg-secondary/30 rounded-xl w-fit animate-fade-in">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !showArchived
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My QR Codes
            <span className="ml-1.5 text-xs text-muted-foreground">({activeCodes.length})</span>
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showArchived
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Archived
            {archivedCodes.length > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                {archivedCodes.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {qrCodes.length > 0 && !showArchived && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={<QRIcon className="w-5 h-5 text-primary" />}
            value={activeCodes.length}
            label="Total"
            color="primary"
            index={0}
          />
          <StatsCard
            icon={<DynamicIcon className="w-5 h-5 text-cyan-500" />}
            value={dynamicCount}
            label="Dynamic"
            color="cyan"
            index={1}
          />
          <StatsCard
            icon={<StaticIcon className="w-5 h-5 text-violet-500" />}
            value={staticCount}
            label="Static"
            color="violet"
            index={2}
          />
          <StatsCard
            icon={<ScanIcon className="w-5 h-5 text-emerald-500" />}
            value={totalScans.toLocaleString()}
            label="Scans"
            color="emerald"
            index={3}
          />
        </div>
      )}

      {/* Filters and Folders */}
      {qrCodes.length > 0 && !showArchived && (
        <div className="mb-8 space-y-6">
          {/* Filters */}
          <QRFilters
            searchQuery={searchQuery}
            selectedType={selectedType}
            selectedStatus={selectedStatus}
            selectedFolder={selectedFolder}
            folders={folders}
            tier={tier}
            onSearchChange={setSearchQuery}
            onTypeChange={setSelectedType}
            onStatusChange={setSelectedStatus}
            onFolderChange={setSelectedFolder}
          />

          {/* Folder Manager (Pro+ only) */}
          {tier !== 'free' && (
            <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur px-3 py-2">
              <FolderManager
                folders={folders}
                qrCodes={qrCodes}
                selectedFolder={selectedFolder}
                tier={tier}
                onFolderSelect={setSelectedFolder}
                onFolderCreate={handleFolderCreate}
                onFolderUpdate={handleFolderUpdate}
                onFolderDelete={handleFolderDelete}
              />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {qrCodes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 p-12 text-center animate-slide-up">
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

      {/* Empty archived view */}
      {showArchived && archivedCodes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/50 bg-card/30 p-12 text-center animate-slide-up">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-2xl flex items-center justify-center">
            <ArchiveEmptyIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No archived QR codes</h2>
          <p className="text-muted-foreground">
            Archived QR codes will appear here. Archive codes you no longer need instead of deleting them.
          </p>
        </div>
      )}

      {/* No results from filter */}
      {qrCodes.length > 0 && filteredCodes.length === 0 && hasActiveFilters && !showArchived && (
        <div className="rounded-2xl border border-dashed border-border/50 bg-card/30 p-12 text-center animate-slide-up">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-2xl flex items-center justify-center">
            <SearchIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No matching QR codes</h2>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}

      {/* Individual QR Codes */}
      {individualCodes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className={`w-1 h-6 bg-gradient-to-b ${showArchived ? 'from-amber-500 to-orange-500' : 'from-primary to-cyan-500'} rounded-full`} />
            {showArchived ? 'Archived' : 'QR Codes'}
            <span className="text-sm font-normal text-muted-foreground">({individualCodes.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {individualCodes.map((qr, index) => (
              <QRCodeCard
                key={qr.id}
                qrCode={qr}
                index={index}
                folderColor={getFolderColor(qr.folder_id)}
                folders={!showArchived && tier !== 'free' ? folders : undefined}
                onFolderChange={!showArchived && tier !== 'free' ? handleFolderAssign : undefined}
                onDuplicate={!showArchived ? handleDuplicate : undefined}
                onArchive={!showArchived ? handleArchive : undefined}
                onRestore={showArchived ? handleRestore : undefined}
                onPermanentDelete={showArchived ? handlePermanentDelete : undefined}
                duplicateDisabled={duplicateDisabled}
                userTier={tier}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bulk Batches */}
      {!showArchived && bulkBatchList.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
            Bulk Generated
            <span className="text-sm font-normal text-muted-foreground">
              ({bulkCodes.length} codes in {bulkBatchList.length} batch{bulkBatchList.length !== 1 ? 'es' : ''})
            </span>
          </h2>
          <div className="space-y-4">
            {bulkBatchList.map((batch, index) => (
              <BulkBatchCard key={batch.id} batch={batch} index={index} userTier={tier} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({
  icon,
  value,
  label,
  color,
  index,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: 'primary' | 'cyan' | 'violet' | 'emerald';
  index: number;
}) {
  const colorClasses = {
    primary: 'bg-primary/10',
    cyan: 'bg-cyan-500/10',
    violet: 'bg-violet-500/10',
    emerald: 'bg-emerald-500/10',
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-4 hover:border-primary/30 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Icons
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ArchiveEmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}
