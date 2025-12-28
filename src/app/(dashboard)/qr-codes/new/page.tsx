'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { QRPreview } from '@/components/qr/QRPreview';
import { QRTypeSelector } from '@/components/qr/QRTypeSelector';
import { QRStyleEditor } from '@/components/qr/QRStyleEditor';
import { QRLogoUploader } from '@/components/qr/QRLogoUploader';
import { generateQRDataURL, generateQRSVG, downloadQRPNG, downloadQRSVG } from '@/lib/qr/generator';
import type { QRContent, QRContentType, QRStyleOptions } from '@/lib/qr/types';
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
import { PLANS } from '@/lib/stripe/plans';

const DEFAULT_STYLE: QRStyleOptions = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 256,
};

export default function NewQRCodePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isDynamic, setIsDynamic] = useState(false);
  const [contentType, setContentType] = useState<QRContentType>('url');
  const [content, setContent] = useState<QRContent | null>(null);
  const [style, setStyle] = useState<QRStyleOptions>(DEFAULT_STYLE);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
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

  // Tier and limits
  const [tier, setTier] = useState<'free' | 'pro' | 'business'>('free');
  const [dynamicCount, setDynamicCount] = useState(0);
  const [isLoadingTier, setIsLoadingTier] = useState(true);

  // Calculate limits
  const dynamicLimit = PLANS[tier].dynamicQRLimit;
  const canCreateDynamic = tier !== 'free';
  const hasReachedLimit = dynamicLimit !== -1 && dynamicCount >= dynamicLimit;

  useEffect(() => {
    const fetchTierAndCount = async () => {
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

      const userTier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business';
      setTier(userTier);

      // Count existing dynamic QR codes
      const { count } = await supabase
        .from('qr_codes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'dynamic');

      setDynamicCount(count || 0);
      setIsLoadingTier(false);
    };

    fetchTierAndCount();
  }, [router]);

  // Form state
  const [urlValue, setUrlValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [vcardFirstName, setVcardFirstName] = useState('');
  const [vcardLastName, setVcardLastName] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  const updateContent = (type: QRContentType, values: Record<string, string | boolean>) => {
    switch (type) {
      case 'url':
        if (values.url) {
          let url = values.url as string;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          setContent({ type: 'url', url });
        } else {
          setContent(null);
        }
        break;
      case 'text':
        if (values.text) {
          setContent({ type: 'text', text: values.text as string });
        } else {
          setContent(null);
        }
        break;
      case 'wifi':
        if (values.ssid) {
          setContent({
            type: 'wifi',
            ssid: values.ssid as string,
            password: (values.password as string) || '',
            encryption: (values.encryption as 'WPA' | 'WEP' | 'nopass') || 'WPA',
            hidden: false,
          });
        } else {
          setContent(null);
        }
        break;
      case 'vcard':
        if (values.firstName || values.lastName) {
          setContent({
            type: 'vcard',
            firstName: (values.firstName as string) || '',
            lastName: (values.lastName as string) || '',
            email: values.email as string,
            phone: values.phone as string,
            organization: values.org as string,
          });
        } else {
          setContent(null);
        }
        break;
      case 'email':
        if (values.email) {
          setContent({
            type: 'email',
            email: values.email as string,
            subject: values.subject as string,
          });
        } else {
          setContent(null);
        }
        break;
      case 'phone':
        if (values.phone) {
          setContent({ type: 'phone', phone: values.phone as string });
        } else {
          setContent(null);
        }
        break;
      case 'sms':
        if (values.phone) {
          setContent({
            type: 'sms',
            phone: values.phone as string,
            message: values.message as string,
          });
        } else {
          setContent(null);
        }
        break;
    }
  };

  const handleSave = async () => {
    if (!content) {
      setError('Please enter content for your QR code');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a name for your QR code');
      return;
    }

    // Validate dynamic QR permissions
    if (isDynamic) {
      if (!canCreateDynamic) {
        setError('Dynamic QR codes require a Pro or Business subscription');
        return;
      }
      if (hasReachedLimit) {
        setError(`You've reached your limit of ${dynamicLimit} dynamic QR codes. Upgrade to Business for unlimited.`);
        return;
      }
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

      // Double-check limits server-side for dynamic QR codes
      if (isDynamic) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        const currentTier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business';

        if (currentTier === 'free') {
          setError('Dynamic QR codes require a Pro or Business subscription');
          setIsSaving(false);
          return;
        }

        const limit = PLANS[currentTier].dynamicQRLimit;
        if (limit !== -1) {
          const { count } = await supabase
            .from('qr_codes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('type', 'dynamic');

          if ((count || 0) >= limit) {
            setError(`You've reached your limit of ${limit} dynamic QR codes.`);
            setIsSaving(false);
            return;
          }
        }
      }

      // Generate short code for dynamic QR codes
      let shortCode = null;
      let destinationUrl = null;

      if (isDynamic) {
        shortCode = generateShortCode();
        destinationUrl = content.type === 'url' ? (content as any).url : null;
      }

      // Hash password if set
      let passwordHash = null;
      if (isDynamic && isPasswordProtected && password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      const { error: insertError } = await supabase
        .from('qr_codes')
        .insert({
          user_id: user.id,
          name: name.trim(),
          type: isDynamic ? 'dynamic' : 'static',
          content_type: contentType,
          content: content as Record<string, any>,
          short_code: shortCode,
          destination_url: destinationUrl,
          expires_at: isDynamic && expiresAt ? new Date(expiresAt).toISOString() : null,
          password_hash: passwordHash,
          active_from: isDynamic && isScheduled && activeFrom ? new Date(activeFrom).toISOString() : null,
          active_until: isDynamic && isScheduled && activeUntil ? new Date(activeUntil).toISOString() : null,
          show_landing_page: isDynamic && showLandingPage,
          landing_page_title: showLandingPage ? landingPageTitle : null,
          landing_page_description: showLandingPage ? landingPageDescription : null,
          landing_page_button_text: showLandingPage ? landingPageButtonText : 'Continue',
          landing_page_theme: showLandingPage ? landingPageTheme : 'dark',
          style: {
            foregroundColor: style.foregroundColor,
            backgroundColor: style.backgroundColor,
            errorCorrectionLevel: style.errorCorrectionLevel,
            margin: style.margin,
            ...(style.logoUrl && { logoUrl: style.logoUrl }),
            ...(style.logoSize && { logoSize: style.logoSize }),
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
    downloadQRPNG(dataURL, name || 'qrforge-code');
  };

  const handleDownloadSVG = async () => {
    if (!content) return;
    const svg = await generateQRSVG(content, style);
    downloadQRSVG(svg, name || 'qrforge-code');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create QR Code</h1>
        <p className="text-muted-foreground mt-1">
          Generate a new QR code for your business
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Preview */}
        <div className="order-2 lg:order-1">
          <div className="sticky top-24">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-sm aspect-square">
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
        </div>

        {/* Right: Configuration */}
        <div className="order-1 lg:order-2 space-y-6">
          {/* Name Input */}
          <Card className="p-6 glass">
            <Label htmlFor="name" className="text-base font-medium">QR Code Name</Label>
            <Input
              id="name"
              placeholder="e.g., Restaurant Menu, Business Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 bg-secondary/50"
            />
          </Card>

          {/* Type Selector - Free */}
          <QRTypeSelector
            value={contentType}
            onChange={(type) => {
              setContentType(type);
              setContent(null);
            }}
          />

          {/* Content Form - Free */}
          <Card className="p-6 glass">
            {contentType === 'url' && (
              <div className="space-y-4">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={urlValue}
                  onChange={(e) => {
                    setUrlValue(e.target.value);
                    updateContent('url', { url: e.target.value });
                  }}
                  className="text-lg bg-secondary/50"
                />
              </div>
            )}

            {contentType === 'text' && (
              <div className="space-y-4">
                <Label htmlFor="text">Text Content</Label>
                <textarea
                  id="text"
                  placeholder="Enter your text here..."
                  value={textValue}
                  onChange={(e) => {
                    setTextValue(e.target.value);
                    updateContent('text', { text: e.target.value });
                  }}
                  className="w-full h-32 px-3 py-2 rounded-md bg-secondary/50 border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            {contentType === 'wifi' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ssid">Network Name (SSID)</Label>
                  <Input
                    id="ssid"
                    placeholder="MyWiFiNetwork"
                    value={wifiSSID}
                    onChange={(e) => {
                      setWifiSSID(e.target.value);
                      updateContent('wifi', {
                        ssid: e.target.value,
                        password: wifiPassword,
                        encryption: wifiEncryption,
                      });
                    }}
                    className="mt-1 bg-secondary/50"
                  />
                </div>
                <div>
                  <Label htmlFor="wifiPass">Password</Label>
                  <Input
                    id="wifiPass"
                    type="password"
                    placeholder="WiFi password"
                    value={wifiPassword}
                    onChange={(e) => {
                      setWifiPassword(e.target.value);
                      updateContent('wifi', {
                        ssid: wifiSSID,
                        password: e.target.value,
                        encryption: wifiEncryption,
                      });
                    }}
                    className="mt-1 bg-secondary/50"
                  />
                </div>
                <div>
                  <Label>Security</Label>
                  <select
                    value={wifiEncryption}
                    onChange={(e) => {
                      const val = e.target.value as 'WPA' | 'WEP' | 'nopass';
                      setWifiEncryption(val);
                      updateContent('wifi', {
                        ssid: wifiSSID,
                        password: wifiPassword,
                        encryption: val,
                      });
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-secondary/50 border border-input"
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                  </select>
                </div>
              </div>
            )}

            {contentType === 'vcard' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={vcardFirstName}
                      onChange={(e) => {
                        setVcardFirstName(e.target.value);
                        updateContent('vcard', {
                          firstName: e.target.value,
                          lastName: vcardLastName,
                          email: vcardEmail,
                          phone: vcardPhone,
                          org: vcardOrg,
                        });
                      }}
                      className="mt-1 bg-secondary/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={vcardLastName}
                      onChange={(e) => {
                        setVcardLastName(e.target.value);
                        updateContent('vcard', {
                          firstName: vcardFirstName,
                          lastName: e.target.value,
                          email: vcardEmail,
                          phone: vcardPhone,
                          org: vcardOrg,
                        });
                      }}
                      className="mt-1 bg-secondary/50"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="vcardEmail">Email</Label>
                  <Input
                    id="vcardEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={vcardEmail}
                    onChange={(e) => {
                      setVcardEmail(e.target.value);
                      updateContent('vcard', {
                        firstName: vcardFirstName,
                        lastName: vcardLastName,
                        email: e.target.value,
                        phone: vcardPhone,
                        org: vcardOrg,
                      });
                    }}
                    className="mt-1 bg-secondary/50"
                  />
                </div>
                <div>
                  <Label htmlFor="vcardPhone">Phone</Label>
                  <Input
                    id="vcardPhone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={vcardPhone}
                    onChange={(e) => {
                      setVcardPhone(e.target.value);
                      updateContent('vcard', {
                        firstName: vcardFirstName,
                        lastName: vcardLastName,
                        email: vcardEmail,
                        phone: e.target.value,
                        org: vcardOrg,
                      });
                    }}
                    className="mt-1 bg-secondary/50"
                  />
                </div>
              </div>
            )}

            {contentType === 'email' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    placeholder="contact@example.com"
                    value={emailValue}
                    onChange={(e) => {
                      setEmailValue(e.target.value);
                      updateContent('email', {
                        email: e.target.value,
                        subject: emailSubject,
                      });
                    }}
                    className="mt-1 bg-secondary/50"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject (optional)</Label>
                  <Input
                    id="subject"
                    placeholder="Email subject"
                    value={emailSubject}
                    onChange={(e) => {
                      setEmailSubject(e.target.value);
                      updateContent('email', {
                        email: emailValue,
                        subject: e.target.value,
                      });
                    }}
                    className="mt-1 bg-secondary/50"
                  />
                </div>
              </div>
            )}

            {contentType === 'phone' && (
              <div className="space-y-4">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phoneValue}
                  onChange={(e) => {
                    setPhoneValue(e.target.value);
                    updateContent('phone', { phone: e.target.value });
                  }}
                  className="text-lg bg-secondary/50"
                />
              </div>
            )}

            {contentType === 'sms' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="smsPhone">Phone Number</Label>
                  <Input
                    id="smsPhone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={smsPhone}
                    onChange={(e) => {
                      setSmsPhone(e.target.value);
                      updateContent('sms', {
                        phone: e.target.value,
                        message: smsMessage,
                      });
                    }}
                    className="mt-1 bg-secondary/50"
                  />
                </div>
                <div>
                  <Label htmlFor="smsMessage">Message (optional)</Label>
                  <textarea
                    id="smsMessage"
                    placeholder="Pre-filled message..."
                    value={smsMessage}
                    onChange={(e) => {
                      setSmsMessage(e.target.value);
                      updateContent('sms', {
                        phone: smsPhone,
                        message: e.target.value,
                      });
                    }}
                    className="w-full h-20 mt-1 px-3 py-2 rounded-md bg-secondary/50 border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Style Editor */}
          <QRStyleEditor style={style} onChange={setStyle} />

          {/* Pro Features Section */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Pro Features</p>
          </div>

          {/* Brand Logo (Pro) */}
          <QRLogoUploader style={style} onChange={setStyle} userTier={tier} />

          {/* Dynamic Toggle */}
          <Card className="p-6 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dynamic QR Code</p>
                <p className="text-sm text-muted-foreground">
                  Edit destination anytime without reprinting
                </p>
                {/* Show limit info for paid users */}
                {canCreateDynamic && dynamicLimit !== -1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {dynamicCount} / {dynamicLimit} used
                  </p>
                )}
                {canCreateDynamic && dynamicLimit === -1 && (
                  <p className="text-xs text-primary mt-1">Unlimited</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Pro
                </span>
                <Switch
                  checked={isDynamic}
                  onCheckedChange={setIsDynamic}
                  disabled={isLoadingTier || !canCreateDynamic || hasReachedLimit}
                />
              </div>
            </div>
            {/* Upgrade prompt for free users */}
            {!isLoadingTier && !canCreateDynamic && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Dynamic QR codes require a Pro subscription.{' '}
                  <Link href="/settings" className="text-primary hover:underline">
                    Upgrade now
                  </Link>
                </p>
              </div>
            )}
            {/* Limit reached message for Pro users */}
            {!isLoadingTier && canCreateDynamic && hasReachedLimit && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You&apos;ve reached your limit of {dynamicLimit} dynamic QR codes.{' '}
                  <Link href="/settings" className="text-primary hover:underline">
                    Upgrade to Business
                  </Link>{' '}
                  for unlimited.
                </p>
              </div>
            )}
          </Card>

          {/* Expiration Date (Dynamic QR codes only) */}
          {isDynamic && (
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">Expiration Date</p>
                  <p className="text-sm text-muted-foreground">
                    QR code will stop working after this date
                  </p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Pro
                </span>
              </div>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="bg-secondary/50"
              />
              {expiresAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Expires: {new Date(expiresAt).toLocaleString()}
                </p>
              )}
            </Card>
          )}

          {/* Password Protection (Dynamic QR codes only) */}
          {isDynamic && (
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">Password Protection</p>
                  <p className="text-sm text-muted-foreground">
                    Require a password to access the destination
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Pro
                  </span>
                  <Switch
                    checked={isPasswordProtected}
                    onCheckedChange={setIsPasswordProtected}
                  />
                </div>
              </div>
              {isPasswordProtected && (
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/50"
                />
              )}
            </Card>
          )}

          {/* Scheduled Activation (Dynamic QR codes only) */}
          {isDynamic && (
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">Scheduled Activation</p>
                  <p className="text-sm text-muted-foreground">
                    Set a time window when the QR code is active
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
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
                    <Label htmlFor="activeFrom" className="text-sm text-muted-foreground">
                      Starts at (optional)
                    </Label>
                    <Input
                      id="activeFrom"
                      type="datetime-local"
                      value={activeFrom}
                      onChange={(e) => setActiveFrom(e.target.value)}
                      className="mt-1 bg-secondary/50"
                    />
                    {activeFrom && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Active from: {new Date(activeFrom).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="activeUntil" className="text-sm text-muted-foreground">
                      Ends at (optional)
                    </Label>
                    <Input
                      id="activeUntil"
                      type="datetime-local"
                      value={activeUntil}
                      onChange={(e) => setActiveUntil(e.target.value)}
                      min={activeFrom || undefined}
                      className="mt-1 bg-secondary/50"
                    />
                    {activeUntil && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Active until: {new Date(activeUntil).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded">
                    Leave either field empty to have no limit on that end.
                  </p>
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
                    className="w-full mt-4"
                    onClick={() => setShowLandingPreview(true)}
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview Landing Page
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Error */}
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!content || !name.trim() || isSaving}
            className="w-full"
            size="lg"
          >
            {isSaving ? 'Saving...' : 'Save QR Code'}
          </Button>
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
              {/* Logo placeholder */}
              {style.logoUrl && (
                <div className="mb-8">
                  <img
                    src={style.logoUrl}
                    alt="Logo"
                    className="h-16 mx-auto object-contain"
                  />
                </div>
              )}

              {/* Title */}
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

              {/* Description */}
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

              {/* CTA Button */}
              <Button size="lg" className="px-8 py-6 text-lg">
                {landingPageButtonText || 'Continue'}
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>

              {/* Powered by */}
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

function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
