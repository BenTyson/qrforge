'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { QRPreview } from '@/components/qr/QRPreview';
import { QRWizard } from '@/components/qr/QRWizard';
import { generateQRDataURL, generateQRSVG, downloadQRPNG, downloadQRSVG } from '@/lib/qr/generator';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { PLANS } from '@/lib/stripe/plans';

const DEFAULT_STYLE: QRStyleOptions = {
  foregroundColor: '#14b8a6',
  backgroundColor: '#0f172a',
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 256,
};

export default function NewQRCodePage() {
  const router = useRouter();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Quick URL mode
  const [urlValue, setUrlValue] = useState('');
  const [name, setName] = useState('');
  const [content, setContent] = useState<QRContent | null>(null);
  const [style] = useState<QRStyleOptions>(DEFAULT_STYLE);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tier
  const [tier, setTier] = useState<'free' | 'pro' | 'business'>('free');
  const [isLoadingTier, setIsLoadingTier] = useState(true);

  useEffect(() => {
    const fetchTier = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      setTier((profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business');
      setIsLoadingTier(false);
    };

    fetchTier();
  }, [router]);

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

  const handleQuickSave = async () => {
    if (!content) {
      setError('Please enter a URL');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a name for your QR code');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { error: insertError } = await supabase
        .from('qr_codes')
        .insert({
          user_id: user.id,
          name: name.trim(),
          type: 'static',
          content_type: 'url',
          content: content as Record<string, any>,
          style: {
            foregroundColor: style.foregroundColor,
            backgroundColor: style.backgroundColor,
            errorCorrectionLevel: style.errorCorrectionLevel,
            margin: style.margin,
          },
        });

      if (insertError) {
        throw insertError;
      }

      router.push('/qr-codes');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save QR code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!content) return;
    const dataURL = await generateQRDataURL(content, { ...style, width: 1024 });
    downloadQRPNG(dataURL, `qrwolf-${(name || 'code').toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleDownloadSVG = async () => {
    if (!content) return;
    const svg = await generateQRSVG(content, style);
    downloadQRSVG(svg, `qrwolf-${(name || 'code').toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create QR Code</h1>
        <p className="text-muted-foreground mt-1">
          Generate a new QR code for your business
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: QR Preview */}
        <div className="order-2 lg:order-1">
          <div className="sticky top-24 flex flex-col items-center">
            <div className="w-full max-w-xs aspect-square">
              <QRPreview
                content={content}
                style={style}
                className="w-full h-full shadow-2xl"
              />
            </div>

            {/* Download Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleDownloadPNG}
                disabled={!content}
                variant="outline"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                PNG
              </Button>
              <Button
                onClick={handleDownloadSVG}
                disabled={!content || tier === 'free'}
                variant="outline"
                title={tier === 'free' ? 'Upgrade to Pro for SVG downloads' : undefined}
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                SVG
                {tier === 'free' && (
                  <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Pro</span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Quick URL + Wizard CTA */}
        <div className="order-1 lg:order-2 space-y-6">
          {/* Wizard CTA - Primary Action */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="w-full p-6 rounded-xl border-2 border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                  Launch QR Wizard
                </p>
                <p className="text-sm text-muted-foreground">
                  WiFi, Contact Cards, Social Media, Documents & more
                </p>
              </div>
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-slate-500">or quick create</span>
            </div>
          </div>

          {/* Quick URL Input */}
          <Card className="p-6 glass">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base font-medium">QR Code Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Website Link"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 bg-secondary/50"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Website URL
                </div>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={urlValue}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="h-12 text-lg bg-secondary/50"
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-500/10 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                onClick={handleQuickSave}
                disabled={!content || !name.trim() || isSaving}
                className="w-full"
                size="lg"
              >
                {isSaving ? 'Saving...' : 'Save QR Code'}
              </Button>
            </div>
          </Card>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="text-center p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="1" />
                </svg>
              </div>
              <p className="text-xs text-slate-400">WiFi</p>
            </button>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="text-center p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <p className="text-xs text-slate-400">Contact</p>
            </button>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="text-center p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
              <p className="text-xs text-slate-400">Social</p>
            </button>
          </div>

          {/* Upgrade CTA */}
          {tier === 'free' && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">Unlock Pro Features</p>
                  <p className="text-sm text-muted-foreground">Dynamic codes, analytics, logos & more</p>
                </div>
                <Link href="/plans">
                  <Button className="shrink-0 glow-hover">
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Wizard Modal */}
      <QRWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
