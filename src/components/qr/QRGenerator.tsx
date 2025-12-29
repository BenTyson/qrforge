'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRPreview } from './QRPreview';
import { QRWizard } from './QRWizard';
import { generateQRDataURL, downloadQRPNG } from '@/lib/qr/generator';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEFAULT_STYLE: QRStyleOptions = {
  foregroundColor: '#14b8a6',
  backgroundColor: '#0f172a',
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 256,
};

export function QRGenerator() {
  const [urlValue, setUrlValue] = useState('');
  const [content, setContent] = useState<QRContent | null>(null);
  const [style] = useState<QRStyleOptions>(DEFAULT_STYLE);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleUrlChange = (value: string) => {
    setUrlValue(value);
    if (value) {
      let url = value;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      setContent({ type: 'url', url });
    } else {
      setContent(null);
    }
  };

  const handleDownloadPNG = async () => {
    if (!content) return;
    setIsDownloading(true);
    try {
      const dataURL = await generateQRDataURL(content, { ...style, width: 1024 });
      downloadQRPNG(dataURL, 'qrwolf-code');
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: QR Preview */}
          <div className="flex flex-col items-center order-2 lg:order-1">
            <div className="w-full max-w-xs aspect-square">
              <QRPreview
                content={content}
                style={style}
                className="w-full h-full shadow-2xl"
              />
            </div>

            {/* Download Button */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleDownloadPNG}
                disabled={!content || isDownloading}
                className="bg-primary hover:bg-primary/90 glow-hover transition-all"
              >
                {isDownloading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Downloading...
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download PNG
                  </>
                )}
              </Button>
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  SVG
                  <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Pro</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: URL Input + Wizard CTA */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* URL Input - Primary Action */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Enter your URL
              </div>
              <Input
                type="url"
                placeholder="https://example.com"
                value={urlValue}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="h-14 text-lg bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-primary"
              />
              <p className="text-xs text-slate-500">
                Paste any website link to generate a QR code instantly
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-sm text-slate-500">or</span>
              </div>
            </div>

            {/* Wizard CTA */}
            <button
              onClick={() => setIsWizardOpen(true)}
              className="w-full p-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-primary/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-primary transition-colors">
                    Create other QR types
                  </p>
                  <p className="text-sm text-slate-400">
                    WiFi, Contact, Social Media, Documents & more
                  </p>
                </div>
                <svg className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>

            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-slate-800/30">
                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-slate-700/50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <circle cx="12" cy="20" r="1" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400">WiFi</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-800/30">
                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-slate-700/50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400">Contact</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-800/30">
                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-slate-700/50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400">Social</p>
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">Want analytics & dynamic QR codes?</p>
                  <p className="text-xs text-slate-400">Track scans, edit destinations, add logos</p>
                </div>
                <Link href="/signup">
                  <Button size="sm" className="shrink-0 glow-hover">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wizard Modal */}
      <QRWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </>
  );
}
