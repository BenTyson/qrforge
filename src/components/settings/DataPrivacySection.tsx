'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, Trash2, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataExportModal } from './DataExportModal';
import { DeleteAccountModal } from './DeleteAccountModal';

interface DataPrivacySectionProps {
  userEmail: string;
}

export function DataPrivacySection({ userEmail }: DataPrivacySectionProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check for delete_token in URL (from confirmation email)
  const deleteToken = searchParams.get('delete_token');

  // Initialize state - auto-open delete modal if token is present
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(() => !!deleteToken);
  const [urlCleaned, setUrlCleaned] = useState(false);

  // Handle delete modal state changes
  const handleDeleteModalOpen = useCallback((open: boolean) => {
    setDeleteModalOpen(open);
    // Clean URL when modal opens with token (only once)
    if (open && deleteToken && !urlCleaned) {
      setUrlCleaned(true);
      // Use setTimeout to avoid calling router.replace during render
      setTimeout(() => {
        router.replace('/settings', { scroll: false });
      }, 0);
    }
  }, [deleteToken, urlCleaned, router]);

  // Memoize the token to pass to the modal
  const tokenForModal = useMemo(() => deleteToken, [deleteToken]);

  return (
    <>
      {/* Data & Privacy Section */}
      <Card className="p-6 glass mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Data & Privacy</h2>
        </div>
        <div className="space-y-4">
          {/* Download Data */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Download Your Data</p>
              <p className="text-sm text-muted-foreground">
                Export all your data in JSON format (GDPR)
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setExportModalOpen(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 glass border-red-500/20">
        <h2 className="text-lg font-semibold mb-4 text-red-500">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <Button
            variant="outline"
            className="text-red-500 border-red-500/50 hover:bg-red-500/10"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Modals */}
      <DataExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
      />
      <DeleteAccountModal
        open={deleteModalOpen}
        onOpenChange={handleDeleteModalOpen}
        userEmail={userEmail}
        deleteToken={tokenForModal}
      />
    </>
  );
}
