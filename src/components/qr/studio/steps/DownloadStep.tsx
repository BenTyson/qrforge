'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useQRStudio } from '../QRStudioContext';

interface DownloadStepProps {
  onSave: () => void;
  onDownloadPNG: () => void;
  onDownloadSVG: () => void;
  onDownloadPDF: () => void;
  onEmbed: () => void;
  onDone: () => void;
  onCreateAnother: () => void;
}

export function DownloadStep({
  onSave,
  onDownloadPNG,
  onDownloadSVG,
  onDownloadPDF,
  onEmbed,
  onDone,
  onCreateAnother,
}: DownloadStepProps) {
  const { state } = useQRStudio();
  const {
    content,
    qrName,
    shortCode,
    savedQRId,
    userId,
    userTier,
    isSaving,
    isDownloading,
    hasDownloaded,
    saveError,
  } = state;
  const canDownloadSVG = userTier === 'pro' || userTier === 'business';
  const isSaved = !!savedQRId;

  // Phase 1: Not saved yet - show save prompt
  if (!isSaved) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Save Your QR Code</h2>
          <p className="text-muted-foreground">
            {qrName ? `"${qrName}" is ready to be saved` : 'Your QR code is ready to be saved'}
          </p>
        </div>

        {/* Sign up prompt for non-logged in users */}
        {!userId && (
          <div className="p-5 bg-primary/10 border border-primary/20 rounded-xl text-center">
            <h3 className="font-semibold mb-2">Create a free account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign up to save your QR code and access it anytime from your dashboard.
            </p>
            <Link href="/signup">
              <Button>Sign up free</Button>
            </Link>
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center">
            {saveError}
          </div>
        )}

        {/* Save button - only for logged in users */}
        {userId && (
          <Button
            className="w-full"
            size="lg"
            onClick={onSave}
            disabled={!content || isSaving}
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
                Save & Create QR Code
              </span>
            )}
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          After saving, you&apos;ll be able to download your QR code in PNG or SVG format
        </p>
      </div>
    );
  }

  // Phase 2: Saved - show success and download options
  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {hasDownloaded ? 'Downloaded!' : 'QR Code Created!'}
        </h2>
        <p className="text-muted-foreground">
          {hasDownloaded
            ? 'Your QR code has been saved and downloaded'
            : 'Your QR code is saved and ready to download'}
        </p>
      </div>

      {/* Short URL */}
      {shortCode && (
        <div className="p-4 bg-secondary/50 rounded-xl">
          <p className="text-sm font-medium mb-2">Your QR Code URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-background px-3 py-2 rounded-lg truncate">
              https://qrwolf.com/r/{shortCode}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`https://qrwolf.com/r/${shortCode}`);
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      )}

      {/* Download buttons */}
      <div className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          onClick={onDownloadPNG}
          disabled={!content || isDownloading}
        >
          {isDownloading ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Downloading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PNG
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={onDownloadSVG}
          disabled={!content || !canDownloadSVG || isDownloading}
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download SVG (Vector)
            {!canDownloadSVG && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">
                Pro
              </span>
            )}
          </span>
        </Button>

        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={onDownloadPDF}
          disabled={!content || !canDownloadSVG || isDownloading}
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Download Print PDF
            {!canDownloadSVG && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">
                Pro
              </span>
            )}
          </span>
        </Button>

        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={onEmbed}
          disabled={!content}
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Get Embed Code
          </span>
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={onCreateAnother}>
          Create Another
        </Button>
        <Button className="flex-1" onClick={onDone}>
          <span className="flex items-center gap-2">
            Go to Dashboard
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </Button>
      </div>
    </div>
  );
}
