'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { QRPreview } from '@/components/qr/QRPreview';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';

interface DownloadStepProps {
  content: QRContent | null;
  style: QRStyleOptions;
  qrName: string;
  userId: string | null;
  userTier: 'free' | 'pro' | 'business' | null;
  // Save state
  isSaving: boolean;
  savedQRId: string | null;
  saveError: string | null;
  // Download state
  isDownloading: boolean;
  canDownloadSVG: boolean;
  // Actions
  onDownload: () => void;
  onDownloadSVG: () => void;
  onClose: () => void;
  onReset: () => void;
}

export function DownloadStep({
  content,
  style,
  qrName,
  userId,
  userTier,
  isSaving,
  savedQRId,
  saveError,
  isDownloading,
  canDownloadSVG,
  onDownload,
  onDownloadSVG,
  onClose,
  onReset,
}: DownloadStepProps) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-8">
      {/* QR Preview */}
      <div className="w-64 h-64 mx-auto">
        <QRPreview content={content} style={style} className="w-full h-full shadow-2xl" />
      </div>

      {/* Not Logged In - Sign Up Prompt */}
      {!userId && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Sign up to download</h3>
          <p className="text-slate-400 mb-6">
            Create a free account to save and download your QR code. Your codes are tracked in your dashboard with scan analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="glow-hover min-w-[160px]">
                Sign Up Free
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="min-w-[160px]">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Logged In - Download Section */}
      {userId && (
        <>
          {/* Success/Saving Message */}
          <div>
            {isSaving ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Saving your QR code...</h3>
                <p className="text-slate-400">This will just take a moment</p>
              </>
            ) : savedQRId ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {qrName ? `"${qrName}" saved!` : 'QR code saved!'}
                </h3>
                <p className="text-slate-400">Your QR code is now in your dashboard</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {qrName ? `"${qrName}" is ready!` : 'Your QR code is ready!'}
                </h3>
                <p className="text-slate-400">Download to save and get a working QR code</p>
              </>
            )}
          </div>

          {/* Save Error */}
          {saveError && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {saveError}
            </div>
          )}

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onDownload}
              disabled={isDownloading || isSaving}
              size="lg"
              className="min-w-[160px]"
            >
              {isDownloading || isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isSaving ? 'Saving...' : 'Downloading...'}
                </span>
              ) : savedQRId ? (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PNG
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save & Download PNG
                </>
              )}
            </Button>
            <Button
              onClick={onDownloadSVG}
              disabled={!canDownloadSVG || isDownloading || isSaving}
              variant="outline"
              size="lg"
              className={cn(
                "min-w-[160px]",
                canDownloadSVG
                  ? "border-primary/50 text-primary hover:bg-primary/10"
                  : "border-slate-600 text-slate-500 cursor-not-allowed"
              )}
              title={!canDownloadSVG ? "Upgrade to Pro for SVG downloads" : undefined}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              {savedQRId ? 'SVG' : 'Save & SVG'}
              {!canDownloadSVG && (
                <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Pro</span>
              )}
            </Button>
          </div>

          {/* View in Dashboard - only after saving */}
          {savedQRId && (
            <Link href="/qr-codes">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <rect x="7" y="7" width="3" height="3" />
                  <rect x="14" y="7" width="3" height="3" />
                  <rect x="7" y="14" width="3" height="3" />
                  <rect x="14" y="14" width="3" height="3" />
                </svg>
                View in Dashboard
              </Button>
            </Link>
          )}

          {/* Upgrade CTA - only for free/pro users */}
          {userTier !== 'business' && (
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
              <h4 className="text-lg font-semibold text-white mb-2">
                {userTier === 'free' ? "Unlock Pro features" : "Upgrade to Business"}
              </h4>
              <p className="text-sm text-slate-400 mb-4">
                {userTier === 'free'
                  ? "Get SVG downloads, custom logos, landing pages, and scan analytics."
                  : "Get unlimited codes, API access, team collaboration, and more."}
              </p>
              <Link href="/plans">
                <Button className="glow-hover">
                  View Plans
                  <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Button
          onClick={onClose}
          variant="outline"
          className="border-slate-600"
        >
          Done
        </Button>
        <Button
          onClick={onReset}
          variant="ghost"
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Another
        </Button>
      </div>
    </div>
  );
}
