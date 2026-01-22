'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { QRPreview } from '@/components/qr/QRPreview';
import { QRStyleEditor } from '@/components/qr/QRStyleEditor';
import { QRLogoUploader } from '@/components/qr/QRLogoUploader';
import { generateQRDataURL, downloadQRPNG, downloadQRSVG, generateQRSVG } from '@/lib/qr/generator';
import type { QRContent, QRContentType, QRStyleOptions, MenuContent, BusinessContent, LinksContent, CouponContent, SocialContent } from '@/lib/qr/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getAppUrl } from '@/lib/utils';
import { normalizeContentUrls } from '@/lib/qr/generator';

// Form components for new QR types
import { MenuForm } from '@/components/qr/forms/MenuForm';
import { BusinessForm } from '@/components/qr/forms/BusinessForm';
import { LinksForm } from '@/components/qr/forms/LinksForm';
import { CouponForm } from '@/components/qr/forms/CouponForm';
import { SocialForm } from '@/components/qr/forms/SocialForm';
import { QR_TYPE_LABELS, DYNAMIC_REQUIRED_TYPES } from '@/lib/qr/types';

const DEFAULT_STYLE: QRStyleOptions = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 256,
};

export default function EditQRCodePage() {
  const router = useRouter();
  const params = useParams();
  const qrCodeId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [isDynamic, setIsDynamic] = useState(false);
  const [contentType, setContentType] = useState<QRContentType>('url');
  const [content, setContent] = useState<QRContent | null>(null);
  const [style, setStyle] = useState<QRStyleOptions>(DEFAULT_STYLE);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic QR settings
  const [destinationUrl, setDestinationUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [activeFrom, setActiveFrom] = useState<string>('');
  const [activeUntil, setActiveUntil] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState(false);

  // Landing page settings
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [landingPageTitle, setLandingPageTitle] = useState('');
  const [landingPageDescription, setLandingPageDescription] = useState('');
  const [landingPageButtonText, setLandingPageButtonText] = useState('Continue');
  const [landingPageTheme, setLandingPageTheme] = useState<'dark' | 'light'>('dark');
  const [showLandingPreview, setShowLandingPreview] = useState(false);

  // Tier
  const [tier, setTier] = useState<'free' | 'pro' | 'business'>('free');

  // Short code for redirect URL
  const [shortCode, setShortCode] = useState<string | null>(null);

  // Load QR code data
  useEffect(() => {
    const fetchQRCode = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch profile for tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      setTier((profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business');

      // Fetch QR code
      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', qrCodeId)
        .eq('user_id', user.id)
        .single();

      if (error || !qrCode) {
        toast.error('QR code not found');
        router.push('/qr-codes');
        return;
      }

      // Populate form
      setName(qrCode.name || '');
      setIsDynamic(qrCode.type === 'dynamic');
      setContentType((qrCode.content_type || 'url') as QRContentType);
      setContent(qrCode.content as QRContent);
      setStyle(qrCode.style || DEFAULT_STYLE);
      setShortCode(qrCode.short_code || null);

      // Dynamic settings
      if (qrCode.destination_url) {
        setDestinationUrl(qrCode.destination_url);
      }
      if (qrCode.expires_at) {
        setExpiresAt(new Date(qrCode.expires_at).toISOString().slice(0, 16));
      }
      if (qrCode.password_hash) {
        setIsPasswordProtected(true);
        setHasExistingPassword(true);
      }
      if (qrCode.active_from || qrCode.active_until) {
        setIsScheduled(true);
        if (qrCode.active_from) {
          setActiveFrom(new Date(qrCode.active_from).toISOString().slice(0, 16));
        }
        if (qrCode.active_until) {
          setActiveUntil(new Date(qrCode.active_until).toISOString().slice(0, 16));
        }
      }

      // Landing page settings
      setShowLandingPage(qrCode.show_landing_page || false);
      setLandingPageTitle(qrCode.landing_page_title || '');
      setLandingPageDescription(qrCode.landing_page_description || '');
      setLandingPageButtonText(qrCode.landing_page_button_text || 'Continue');
      setLandingPageTheme(qrCode.landing_page_theme || 'dark');

      setIsLoading(false);
    };

    fetchQRCode();
  }, [qrCodeId, router]);

  const handleSave = async () => {
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

      // Build update object
      const updateData: Record<string, unknown> = {
        name: name.trim(),
        style: {
          foregroundColor: style.foregroundColor,
          backgroundColor: style.backgroundColor,
          errorCorrectionLevel: style.errorCorrectionLevel,
          margin: style.margin,
          ...(style.logoUrl && { logoUrl: style.logoUrl }),
          ...(style.logoSize && { logoSize: style.logoSize }),
        },
      };

      // Update content for landing page types (normalize URLs before saving)
      if (DYNAMIC_REQUIRED_TYPES.includes(contentType) && content) {
        updateData.content = normalizeContentUrls(content);
      }

      // Dynamic QR settings
      if (isDynamic) {
        updateData.destination_url = destinationUrl || null;
        updateData.expires_at = expiresAt ? new Date(expiresAt).toISOString() : null;
        updateData.active_from = isScheduled && activeFrom ? new Date(activeFrom).toISOString() : null;
        updateData.active_until = isScheduled && activeUntil ? new Date(activeUntil).toISOString() : null;

        // Landing page
        updateData.show_landing_page = showLandingPage;
        updateData.landing_page_title = showLandingPage ? landingPageTitle : null;
        updateData.landing_page_description = showLandingPage ? landingPageDescription : null;
        updateData.landing_page_button_text = showLandingPage ? landingPageButtonText : 'Continue';
        updateData.landing_page_theme = showLandingPage ? landingPageTheme : 'dark';

        // Password - only update if changed (use server-side bcrypt)
        if (isPasswordProtected && password) {
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
          updateData.password_hash = hash;
        } else if (!isPasswordProtected) {
          updateData.password_hash = null;
        }
      }

      const { error: updateError } = await supabase
        .from('qr_codes')
        .update(updateData)
        .eq('id', qrCodeId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('QR code updated');
      router.push('/qr-codes');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save QR code');
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!content) return;

    // IMPORTANT: If QR has a short_code, always use the redirect URL
    // This ensures scans are tracked regardless of how the QR was originally saved
    let qrContent: QRContent = content;
    if (shortCode) {
      qrContent = { type: 'url', url: `${getAppUrl()}/r/${shortCode}` };
    }

    const dataURL = await generateQRDataURL(qrContent, { ...style, width: 1024 });
    await downloadQRPNG(dataURL, `qrwolf-${(name || 'code').toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleDownloadSVG = async () => {
    if (!content) return;

    // IMPORTANT: If QR has a short_code, always use the redirect URL
    // This ensures scans are tracked regardless of how the QR was originally saved
    let qrContent: QRContent = content;
    if (shortCode) {
      qrContent = { type: 'url', url: `${getAppUrl()}/r/${shortCode}` };
    }

    const svg = await generateQRSVG(qrContent, style);
    downloadQRSVG(svg, `qrwolf-${(name || 'code').toLowerCase().replace(/\s+/g, '-')}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary/50 rounded w-1/3 mb-4" />
          <div className="h-4 bg-secondary/50 rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="h-48 bg-secondary/50 rounded-xl" />
              <div className="h-32 bg-secondary/50 rounded-xl" />
            </div>
            <div className="h-80 bg-secondary/50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/qr-codes" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
          ← Back to QR Codes
        </Link>
        <h1 className="text-3xl font-bold">Edit QR Code</h1>
        <p className="text-muted-foreground mt-1">
          Update your QR code settings
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6 glass">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">QR Code Name</Label>
                <Input
                  id="name"
                  placeholder="My QR Code"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 bg-secondary/50"
                />
              </div>

              {isDynamic && (
                <div>
                  <Label htmlFor="destinationUrl">Destination URL</Label>
                  <Input
                    id="destinationUrl"
                    type="url"
                    placeholder="https://example.com"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    className="mt-1 bg-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Change where this QR code redirects to
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Content Editor for Landing Page Types */}
          {DYNAMIC_REQUIRED_TYPES.includes(contentType) && (
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Edit Content</p>
                  <p className="text-sm text-muted-foreground">
                    {QR_TYPE_LABELS[contentType]}
                  </p>
                </div>
              </div>

              {contentType === 'menu' && (
                <MenuForm
                  content={(content as Partial<MenuContent>) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {contentType === 'business' && (
                <BusinessForm
                  content={(content as Partial<BusinessContent>) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {contentType === 'links' && (
                <LinksForm
                  content={(content as Partial<LinksContent>) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {contentType === 'coupon' && (
                <CouponForm
                  content={(content as Partial<CouponContent>) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {contentType === 'social' && (
                <SocialForm
                  content={(content as Partial<SocialContent>) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}
            </Card>
          )}

          {/* Style Editor */}
          <QRStyleEditor
            style={style}
            onChange={setStyle}
          />

          {/* Pro Features Section */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Pro Features</p>
          </div>

          {/* Brand Logo (Pro) */}
          <QRLogoUploader style={style} onChange={setStyle} userTier={tier} />

          {/* Expiration (Dynamic only) */}
          {isDynamic && (
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">Expiration Date</p>
                  <p className="text-sm text-muted-foreground">
                    QR code will stop working after this date
                  </p>
                </div>
              </div>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="bg-secondary/50"
              />
            </Card>
          )}

          {/* Password Protection (Dynamic + Pro+) */}
          {isDynamic && (tier === 'pro' || tier === 'business') && (
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">Password Protection</p>
                  <p className="text-sm text-muted-foreground">
                    Require a password to access
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    Pro
                  </span>
                  <Switch
                    checked={isPasswordProtected}
                    onCheckedChange={setIsPasswordProtected}
                  />
                </div>
              </div>
              {isPasswordProtected && (
                <div>
                  <Input
                    type="password"
                    placeholder={hasExistingPassword ? "Enter new password to change" : "Enter password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary/50"
                  />
                  {hasExistingPassword && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave blank to keep existing password
                    </p>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Scheduled Activation (Pro+) */}
          {isDynamic && (tier === 'pro' || tier === 'business') && (
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">Scheduled Activation</p>
                  <p className="text-sm text-muted-foreground">
                    Control when this QR code is active
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    Pro
                  </span>
                  <Switch
                    checked={isScheduled}
                    onCheckedChange={setIsScheduled}
                  />
                </div>
              </div>
              {isScheduled && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Active From</Label>
                    <Input
                      type="datetime-local"
                      value={activeFrom}
                      onChange={(e) => setActiveFrom(e.target.value)}
                      className="mt-1 bg-secondary/50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Active Until</Label>
                    <Input
                      type="datetime-local"
                      value={activeUntil}
                      onChange={(e) => setActiveUntil(e.target.value)}
                      className="mt-1 bg-secondary/50"
                    />
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Landing Page (Pro+) */}
          {isDynamic && (tier === 'pro' || tier === 'business') && (
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">Branded Landing Page</p>
                  <p className="text-sm text-muted-foreground">
                    Show a custom page before redirecting
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    Pro
                  </span>
                  <Switch
                    checked={showLandingPage}
                    onCheckedChange={setShowLandingPage}
                  />
                </div>
              </div>
              {showLandingPage && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="landingTitle" className="text-sm text-muted-foreground">
                      Title
                    </Label>
                    <Input
                      id="landingTitle"
                      placeholder="Welcome to Our Site"
                      value={landingPageTitle}
                      onChange={(e) => setLandingPageTitle(e.target.value)}
                      className="mt-1 bg-secondary/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="landingDescription" className="text-sm text-muted-foreground">
                      Description
                    </Label>
                    <textarea
                      id="landingDescription"
                      placeholder="Add a message for your visitors..."
                      value={landingPageDescription}
                      onChange={(e) => setLandingPageDescription(e.target.value)}
                      className="w-full h-20 mt-1 px-3 py-2 rounded-md bg-secondary/50 border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="landingButton" className="text-sm text-muted-foreground">
                        Button Text
                      </Label>
                      <Input
                        id="landingButton"
                        placeholder="Continue"
                        value={landingPageButtonText}
                        onChange={(e) => setLandingPageButtonText(e.target.value)}
                        className="mt-1 bg-secondary/50"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Theme</Label>
                      <select
                        value={landingPageTheme}
                        onChange={(e) => setLandingPageTheme(e.target.value as 'dark' | 'light')}
                        className="w-full mt-1 px-3 py-2 rounded-md bg-secondary/50 border border-input"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowLandingPreview(true)}
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview Landing Page
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="w-full"
            size="lg"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Right Column - Preview */}
        <div>
          <Card className="p-6 glass sticky top-24">
            <h3 className="font-semibold mb-4">Preview</h3>
            {content && (
              <QRPreview content={content} style={style} />
            )}

            {/* Download Buttons */}
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownloadPNG}
                disabled={!content}
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                PNG
              </Button>
              {(tier === 'pro' || tier === 'business') && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownloadSVG}
                  disabled={!content}
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  SVG
                </Button>
              )}
            </div>

            {/* Type Badge */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isDynamic
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {isDynamic ? 'Dynamic' : 'Static'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Landing Page Preview Modal */}
      <Dialog open={showLandingPreview} onOpenChange={setShowLandingPreview}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Landing Page Preview</DialogTitle>
          </DialogHeader>
          <div className={`min-h-[400px] flex items-center justify-center px-4 py-8 ${
            landingPageTheme === 'dark'
              ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
              : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
          }`}>
            <div className="max-w-lg w-full text-center">
              {style.logoUrl && (
                <div className="mb-8">
                  <Image
                    src={style.logoUrl}
                    alt="Logo"
                    width={64}
                    height={64}
                    className="h-16 w-auto mx-auto object-contain"
                    unoptimized
                  />
                </div>
              )}

              {landingPageTitle ? (
                <h1 className={`text-3xl font-bold mb-4 ${
                  landingPageTheme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {landingPageTitle}
                </h1>
              ) : (
                <h1 className={`text-3xl font-bold mb-4 ${
                  landingPageTheme === 'dark' ? 'text-white/30' : 'text-slate-300'
                }`}>
                  Your Title Here
                </h1>
              )}

              {landingPageDescription ? (
                <p className={`text-lg mb-8 ${
                  landingPageTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {landingPageDescription}
                </p>
              ) : (
                <p className={`text-lg mb-8 ${
                  landingPageTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Your description will appear here...
                </p>
              )}

              <Button size="lg" className="px-8 py-6 text-lg">
                {landingPageButtonText || 'Continue'}
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>

              <p className={`mt-12 text-sm ${
                landingPageTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Powered by QRWolf
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
