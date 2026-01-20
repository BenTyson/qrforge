'use client';

import { QRPreview } from '../QRPreview';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';

interface QRStudioPreviewProps {
  content: QRContent | null;
  style: QRStyleOptions;
  qrName: string;
  shortCode: string | null;
  userTier: 'free' | 'pro' | 'business' | null;
  isSaving: boolean;
  isDownloading: boolean;
  canDownload: boolean;
  onDownloadPNG: () => void;
  onDownloadSVG: () => void;
  className?: string;
}

export function QRStudioPreview({
  content,
  style,
  qrName,
  shortCode,
  userTier,
  isSaving,
  isDownloading,
  canDownload,
  onDownloadPNG,
  onDownloadSVG,
  className,
}: QRStudioPreviewProps) {
  const canDownloadSVG = userTier === 'pro' || userTier === 'business';

  return (
    <aside
      className={cn(
        'w-80 border-l border-border bg-card/30 backdrop-blur flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-border">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Live Preview
        </h3>
        {qrName && (
          <p className="text-sm font-medium mt-1 truncate">{qrName}</p>
        )}
      </div>

      {/* Preview */}
      <div className="flex-1 p-5 flex flex-col items-center justify-center">
        <div className="w-full max-w-[240px] p-3 bg-muted/30 rounded-2xl">
          <QRPreview
            content={content}
            style={style}
            className="w-full rounded-xl shadow-lg"
            showPlaceholder={true}
          />
        </div>

        {/* Short URL display */}
        {shortCode && (
          <div className="mt-4 w-full">
            <p className="text-xs text-muted-foreground text-center mb-1">Short URL</p>
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
              <code className="flex-1 text-xs truncate text-center">
                qrwolf.com/r/{shortCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://qrwolf.com/r/${shortCode}`);
                }}
                className="p-1 hover:bg-secondary rounded transition-colors"
                title="Copy link"
              >
                <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Download buttons */}
      <div className="p-5 border-t border-border space-y-2">
        {!canDownload ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            Complete all steps to download your QR code
          </p>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onDownloadPNG}
              disabled={!content || isDownloading || isSaving}
            >
              {isDownloading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                  Downloading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              size="sm"
              className="w-full"
              onClick={onDownloadSVG}
              disabled={!content || !canDownloadSVG || isDownloading || isSaving}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download SVG
                {!canDownloadSVG && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-1">
                    Pro
                  </span>
                )}
              </span>
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}

// Mobile-specific mini preview component
export function QRStudioMiniPreview({
  content,
  style,
  isExpanded,
  onToggle,
}: {
  content: QRContent | null;
  style: QRStyleOptions;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center gap-3"
      >
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <QRPreview
            content={content}
            style={style}
            className="w-full h-full"
            showPlaceholder={true}
          />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">Preview</p>
          <p className="text-xs text-muted-foreground">
            {isExpanded ? 'Tap to collapse' : 'Tap to expand'}
          </p>
        </div>
        <svg
          className={cn(
            'w-5 h-5 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="w-48 mx-auto p-2 bg-muted/30 rounded-xl">
            <QRPreview
              content={content}
              style={style}
              className="w-full rounded-xl shadow-lg"
              showPlaceholder={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
