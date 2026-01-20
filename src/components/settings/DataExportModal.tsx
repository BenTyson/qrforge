'use client';

import { useState } from 'react';
import { Download, Loader2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DataExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataExportModal({ open, onOpenChange }: DataExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownInfo, setCooldownInfo] = useState<{
    available: boolean;
    remainingHours?: number;
  } | null>(null);

  const checkAvailability = async () => {
    try {
      const res = await fetch('/api/user/export', { method: 'POST' });
      const data = await res.json();
      setCooldownInfo(data);
    } catch {
      // Ignore - will check during export
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const res = await fetch('/api/user/export');

      if (res.status === 429) {
        const data = await res.json();
        setError(data.error);
        setCooldownInfo({ available: false, remainingHours: parseInt(data.error.match(/\d+/)?.[0] || '24') });
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Export failed');
      }

      // Trigger file download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrwolf-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Close modal after successful download
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Check availability when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      checkAvailability();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Download Your Data
          </DialogTitle>
          <DialogDescription>
            Export all your QRWolf data in JSON format for portability or backup purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-secondary/30 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">What&apos;s included:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>Profile information</li>
              <li>All QR codes and their configurations</li>
              <li>Scan analytics (location, device, time)</li>
              <li>Folders and organization</li>
              <li>API keys (without sensitive hashes)</li>
              <li>Team memberships</li>
            </ul>
          </div>

          {cooldownInfo && !cooldownInfo.available && (
            <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 rounded-lg p-3">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                You can request another export in {cooldownInfo.remainingHours} hours
              </span>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            For privacy protection, exports are limited to once every 24 hours. Your data will be
            downloaded as a JSON file.
          </p>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || (cooldownInfo?.available === false)}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
