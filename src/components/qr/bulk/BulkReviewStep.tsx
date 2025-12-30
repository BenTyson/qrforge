'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { QRPreview } from '@/components/qr/QRPreview';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { generateQRDataURL } from '@/lib/qr/generator';
import { toast } from 'sonner';
import type { BulkEntry, QRStyleOptions } from './hooks/useBulkState';
import type { QRContent } from '@/lib/qr/types';

interface BulkReviewStepProps {
  entries: BulkEntry[];
  style: QRStyleOptions;
  expiresAt: string;
  passwordEnabled: boolean;
  password: string;
  scheduledEnabled: boolean;
  activeFrom: string;
  showLandingPage: boolean;
  landingPageTitle: string;
  landingPageDescription: string;
  landingPageButtonText: string;
  landingPageTheme: 'dark' | 'light';
  userId: string;
  isSaving: boolean;
  savedCount: number;
  saveError: string | null;
  onEntryStatusChange: (id: string, status: BulkEntry['status'], previewUrl?: string, error?: string) => void;
  onSetIsSaving: (saving: boolean) => void;
  onSetSavedCount: (count: number) => void;
  onSetSaveError: (error: string | null) => void;
  onDone: () => void;
}

function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomValues = new Uint8Array(7);
  crypto.getRandomValues(randomValues);
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
}

export function BulkReviewStep({
  entries,
  style,
  expiresAt,
  passwordEnabled,
  password,
  scheduledEnabled,
  activeFrom,
  showLandingPage,
  landingPageTitle,
  landingPageDescription,
  landingPageButtonText,
  landingPageTheme,
  userId,
  isSaving,
  savedCount,
  saveError,
  onEntryStatusChange,
  onSetIsSaving,
  onSetSavedCount,
  onSetSaveError,
  onDone,
}: BulkReviewStepProps) {
  const [previewsGenerated, setPreviewsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const isMountedRef = useRef(true);
  const hasStartedRef = useRef(false);

  // Set mounted ref on mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Generate previews on mount (only once)
  useEffect(() => {
    if (hasStartedRef.current || entries.length === 0) return;
    hasStartedRef.current = true;

    const generatePreviews = async () => {
      setIsGenerating(true);

      // Generate previews in batches of 5 for performance
      const batchSize = 5;
      for (let i = 0; i < entries.length; i += batchSize) {
        if (!isMountedRef.current) return;

        const batch = entries.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (entry) => {
            if (!isMountedRef.current) return;
            try {
              onEntryStatusChange(entry.id, 'generating');
              const content: QRContent = { type: 'url', url: entry.url };
              const previewUrl = await generateQRDataURL(content, { ...style, width: 256 });
              if (isMountedRef.current) {
                onEntryStatusChange(entry.id, 'done', previewUrl);
              }
            } catch (error) {
              if (isMountedRef.current) {
                onEntryStatusChange(entry.id, 'error', undefined, 'Failed to generate preview');
              }
            }
          })
        );
      }

      if (isMountedRef.current) {
        setIsGenerating(false);
        setPreviewsGenerated(true);
      }
    };

    generatePreviews();
  }, [entries, style, onEntryStatusChange]);

  const handleSaveAll = useCallback(async () => {
    if (entries.length === 0) {
      toast.error('No entries to save');
      return;
    }

    onSetIsSaving(true);
    onSetSaveError(null);

    try {
      const supabase = createClient();

      // Hash password using server-side bcrypt
      let passwordHash: string | null = null;
      if (passwordEnabled && password) {
        const hashResponse = await fetch('/api/qr/hash-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        if (!hashResponse.ok) {
          const errorData = await hashResponse.json();
          throw new Error(errorData.error || 'Failed to hash password');
        }

        const { hash } = await hashResponse.json();
        passwordHash = hash;
      }

      // Generate a batch ID for grouping
      const batchId = crypto.randomUUID();

      // Prepare QR codes data
      const qrCodes = entries.map(entry => ({
        bulk_batch_id: batchId,
        user_id: userId,
        name: entry.name,
        type: 'dynamic',
        content_type: 'url',
        content: { type: 'url', url: entry.url },
        short_code: generateShortCode(),
        destination_url: entry.url,
        style: {
          foregroundColor: style.foregroundColor,
          backgroundColor: style.backgroundColor,
          errorCorrectionLevel: style.errorCorrectionLevel,
          margin: style.margin,
          ...(style.logoUrl && { logoUrl: style.logoUrl }),
          ...(style.logoSize && { logoSize: style.logoSize }),
        },
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        password_hash: passwordHash,
        active_from: scheduledEnabled && activeFrom ? new Date(activeFrom).toISOString() : null,
        active_until: null,
        show_landing_page: showLandingPage,
        landing_page_title: showLandingPage ? (landingPageTitle || 'Welcome') : null,
        landing_page_description: showLandingPage ? landingPageDescription : null,
        landing_page_button_text: showLandingPage ? (landingPageButtonText || 'Continue') : 'Continue',
        landing_page_theme: showLandingPage ? landingPageTheme : 'dark',
      }));

      // Insert all QR codes
      const { error } = await supabase
        .from('qr_codes')
        .insert(qrCodes);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Database insert failed');
      }

      onSetSavedCount(entries.length);
      setSaveComplete(true);
      toast.success(`Created ${entries.length} QR codes`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onSetSaveError(errorMessage);
      toast.error(`Failed to save QR codes: ${errorMessage}`);
      console.error('Save error:', error);
    } finally {
      onSetIsSaving(false);
    }
  }, [
    entries, userId, style, expiresAt, passwordEnabled, password,
    scheduledEnabled, activeFrom, showLandingPage, landingPageTitle,
    landingPageDescription, landingPageButtonText, landingPageTheme,
    onSetIsSaving, onSetSaveError, onSetSavedCount,
  ]);

  const handleDownloadAll = useCallback(async () => {
    // For now, just show a message - ZIP download can be added later
    toast.info('Individual downloads available by clicking each QR code');
  }, []);

  // Calculate stats
  const pendingCount = entries.filter(e => e.status === 'pending').length;
  const generatingCount = entries.filter(e => e.status === 'generating').length;
  const doneCount = entries.filter(e => e.status === 'done').length;
  const errorCount = entries.filter(e => e.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-1">Review & Save</h2>
        <p className="text-muted-foreground text-sm">
          Preview your {entries.length} QR codes before saving them to your account
        </p>
      </div>

      {/* Status bar */}
      {!saveComplete && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
          {isGenerating ? (
            <>
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <div>
                <p className="font-medium">Generating previews...</p>
                <p className="text-sm text-muted-foreground">
                  {doneCount} / {entries.length} complete
                </p>
              </div>
            </>
          ) : errorCount > 0 ? (
            <>
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{errorCount} error{errorCount !== 1 ? 's' : ''}</p>
                <p className="text-sm text-muted-foreground">
                  {doneCount} previews generated successfully
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Ready to save</p>
                <p className="text-sm text-muted-foreground">
                  {entries.length} QR codes generated
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Success state */}
      {saveComplete && (
        <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {savedCount} QR Codes Created!
          </h3>
          <p className="text-muted-foreground mb-4">
            Your QR codes have been saved to your account
          </p>
          <Button onClick={onDone} size="lg">
            View My QR Codes
          </Button>
        </div>
      )}

      {/* Error state */}
      {saveError && !saveComplete && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-500">Save failed</p>
              <p className="text-sm text-muted-foreground">{saveError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid of previews */}
      {!saveComplete && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                'rounded-xl border bg-card/50 overflow-hidden transition-all',
                entry.status === 'error' && 'border-red-500/50',
                entry.status === 'done' && 'border-border',
                (entry.status === 'pending' || entry.status === 'generating') && 'border-border opacity-70',
              )}
            >
              {/* Preview */}
              <div className="aspect-square p-4 bg-white relative">
                {entry.previewUrl ? (
                  <img
                    src={entry.previewUrl}
                    alt={entry.name}
                    className="w-full h-full object-contain"
                  />
                ) : entry.status === 'generating' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : entry.status === 'error' ? (
                  <div className="w-full h-full flex items-center justify-center text-red-500">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                ) : (
                  <QRPreview
                    content={{ type: 'url', url: entry.url }}
                    style={style as import('@/lib/qr/types').QRStyleOptions}
                    className="w-full h-full"
                    showPlaceholder={true}
                  />
                )}

                {/* Index badge */}
                <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-medium text-sm truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground truncate">{entry.url}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary of settings */}
      {!saveComplete && (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
          <h4 className="text-sm font-medium mb-3">Applied Settings</h4>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-secondary px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: style.foregroundColor }} />
              {style.foregroundColor}
            </span>
            <span className="text-xs bg-secondary px-2 py-1 rounded-full">
              Error Level: {style.errorCorrectionLevel}
            </span>
            {style.logoUrl && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                Logo included
              </span>
            )}
            {expiresAt && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                Expires {new Date(expiresAt).toLocaleDateString()}
              </span>
            )}
            {passwordEnabled && password && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                Password protected
              </span>
            )}
            {scheduledEnabled && activeFrom && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                Scheduled
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {!saveComplete && (
        <div className="flex gap-3">
          <Button
            onClick={handleSaveAll}
            disabled={isSaving || isGenerating || doneCount === 0}
            className="flex-1"
            size="lg"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save {entries.length} QR Codes
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
