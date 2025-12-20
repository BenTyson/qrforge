'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { QRPreview } from '@/components/qr/QRPreview';
import { QRTypeSelector } from '@/components/qr/QRTypeSelector';
import { QRStyleEditor } from '@/components/qr/QRStyleEditor';
import { generateQRDataURL, generateQRSVG, downloadQRPNG, downloadQRSVG } from '@/lib/qr/generator';
import type { QRContent, QRContentType, QRStyleOptions } from '@/lib/qr/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

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

    setIsSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Generate short code for dynamic QR codes
      let shortCode = null;
      let destinationUrl = null;

      if (isDynamic) {
        shortCode = generateShortCode();
        destinationUrl = content.type === 'url' ? (content as any).url : null;
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
                  disabled={!content}
                  variant="outline"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  SVG
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

          {/* Dynamic Toggle */}
          <Card className="p-6 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dynamic QR Code</p>
                <p className="text-sm text-muted-foreground">
                  Edit destination anytime without reprinting
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Pro
                </span>
                <Switch
                  checked={isDynamic}
                  onCheckedChange={setIsDynamic}
                />
              </div>
            </div>
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

          {/* Type Selector */}
          <QRTypeSelector
            value={contentType}
            onChange={(type) => {
              setContentType(type);
              setContent(null);
            }}
          />

          {/* Content Form */}
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
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
