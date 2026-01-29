'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRPreview } from './QRPreview';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

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

  // Build destination URL based on auth state
  const getCtaUrl = () => {
    const createUrl = content && content.type === 'url'
      ? `/qr-codes/create?prefill_url=${encodeURIComponent(content.url)}`
      : '/qr-codes/create';

    if (isLoggedIn) {
      return createUrl;
    }
    return `/signup?redirect=${encodeURIComponent(createUrl)}`;
  };

  // Build the generic CTA destination (no prefill URL)
  const getGenericCtaUrl = () => {
    if (isLoggedIn) {
      return '/qr-codes/create';
    }
    return '/signup';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left: QR Preview */}
        <div className="flex flex-col items-center order-2 lg:order-1">
          <div className="w-full max-w-xs aspect-square">
            <QRPreview
              content={content}
              style={DEFAULT_STYLE}
              className="w-full h-full shadow-2xl"
            />
          </div>

          {/* CTA - Gates to signup or goes to create */}
          <div className="mt-6 w-full max-w-xs">
            <Link href={getCtaUrl()} className="block">
              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 glow-hover transition-all text-base font-medium"
                disabled={!content}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Create My QR Code
              </Button>
            </Link>
            {!isLoggedIn && (
              <p className="text-center text-xs text-slate-500 mt-2">
                Free account required
              </p>
            )}
          </div>
        </div>

        {/* Right: URL Input + CTAs */}
        <div className="space-y-6 order-1 lg:order-2">
          {/* URL Input */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Try it — enter any URL
            </div>
            <Input
              type="url"
              placeholder="https://example.com"
              value={urlValue}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="h-14 text-lg bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-primary"
            />
            <p className="text-xs text-slate-500">
              Watch your QR code generate instantly
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

          {/* Studio CTA */}
          <Link
            href={getGenericCtaUrl()}
            className="block w-full p-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-primary/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all group text-left"
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
                  Create any QR type
                </p>
                <p className="text-sm text-slate-400">
                  WiFi, Contact, Social, PDF, Video & 12 more
                </p>
              </div>
              <svg className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </Link>

          {/* What you get */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/30">
              <svg className="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-xs text-slate-300">Track scans</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/30">
              <svg className="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-xs text-slate-300">Edit anytime</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/30">
              <svg className="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-xs text-slate-300">Add your logo</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/30">
              <svg className="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-xs text-slate-300">Custom colors</span>
            </div>
          </div>

          {/* Final CTA */}
          <Link href={getGenericCtaUrl()} className="block">
            <Button className="w-full h-12 glow-hover text-base">
              Get Started Free
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
