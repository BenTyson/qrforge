'use client';

import { useState } from 'react';
import { FolderPlus, FolderOpen, Pencil, Crown, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderModal } from './FolderModal';
import type { Folder, SubscriptionTier, QRCode } from '@/lib/supabase/types';
import { TIER_LIMITS } from '@/lib/supabase/types';

interface FolderManagerProps {
  folders: Folder[];
  qrCodes: QRCode[];
  selectedFolder: string | null;
  tier: SubscriptionTier;
  onFolderSelect: (folderId: string | null) => void;
  onFolderCreate: (name: string, color: string) => Promise<void>;
  onFolderUpdate: (id: string, name: string, color: string) => Promise<void>;
  onFolderDelete: (id: string) => Promise<void>;
}

export function FolderManager({
  folders,
  qrCodes,
  selectedFolder,
  tier,
  onFolderSelect,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete,
}: FolderManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const canUseFolders = tier !== 'free';
  const folderLimit = TIER_LIMITS[tier].folders;
  const canCreateMore = typeof folderLimit === 'number' ? folders.length < folderLimit : true;

  // Count QR codes per folder
  const getCodeCount = (folderId: string | null) => {
    if (folderId === null) {
      return qrCodes.length;
    }
    if (folderId === 'uncategorized') {
      return qrCodes.filter((qr) => !qr.folder_id).length;
    }
    return qrCodes.filter((qr) => qr.folder_id === folderId).length;
  };

  const handleCreateFolder = () => {
    setEditingFolder(null);
    setIsModalOpen(true);
  };

  const handleEditFolder = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setIsModalOpen(true);
  };

  const handleSave = async (name: string, color: string) => {
    if (editingFolder) {
      await onFolderUpdate(editingFolder.id, name, color);
    } else {
      await onFolderCreate(name, color);
    }
  };

  const handleDelete = async () => {
    if (editingFolder) {
      await onFolderDelete(editingFolder.id);
      // If we deleted the selected folder, reset selection
      if (selectedFolder === editingFolder.id) {
        onFolderSelect(null);
      }
    }
  };

  // Show upgrade prompt for free users
  if (!canUseFolders) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
          <FolderOpen className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold mb-2">Organize with Folders</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upgrade to Pro to create folders and organize your QR codes.
        </p>
        <Badge className="bg-gradient-to-r from-primary to-cyan-500 text-white border-0">
          <Crown className="w-3 h-3 mr-1" />
          Pro Feature
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* All QR Codes chip */}
      <button
        onClick={() => onFolderSelect(null)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
          selectedFolder === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        All
        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
          selectedFolder === null ? 'bg-white/20' : 'bg-background/50'
        }`}>
          {getCodeCount(null)}
        </span>
      </button>

      {/* Uncategorized chip */}
      <button
        onClick={() => onFolderSelect('uncategorized')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
          selectedFolder === 'uncategorized'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <FolderOpen className="w-3.5 h-3.5" />
        Uncategorized
        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
          selectedFolder === 'uncategorized' ? 'bg-white/20' : 'bg-background/50'
        }`}>
          {getCodeCount('uncategorized')}
        </span>
      </button>

      {/* User folder chips */}
      {folders.map((folder) => (
        <div
          key={folder.id}
          role="button"
          tabIndex={0}
          onClick={() => onFolderSelect(folder.id)}
          onKeyDown={(e) => e.key === 'Enter' && onFolderSelect(folder.id)}
          className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
            selectedFolder === folder.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: folder.color }}
          />
          <span className="max-w-[100px] truncate">{folder.name}</span>
          <button
            onClick={(e) => handleEditFolder(folder, e)}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/20 rounded transition-opacity"
            aria-label={`Edit ${folder.name}`}
          >
            <Pencil className="w-2.5 h-2.5" />
          </button>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            selectedFolder === folder.id ? 'bg-white/20' : 'bg-background/50'
          }`}>
            {getCodeCount(folder.id)}
          </span>
        </div>
      ))}

      {/* New folder button */}
      {canCreateMore ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateFolder}
          className="h-7 px-2.5 text-xs rounded-full"
        >
          <FolderPlus className="w-3.5 h-3.5 mr-1" />
          New
        </Button>
      ) : (
        <span className="text-[10px] text-muted-foreground px-2">
          {folders.length}/{folderLimit}
        </span>
      )}

      {/* Folder modal */}
      <FolderModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        folder={editingFolder}
        onSave={handleSave}
        onDelete={editingFolder ? handleDelete : undefined}
      />
    </div>
  );
}
