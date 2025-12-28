'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { QRPreview } from './QRPreview';
import { QRTypeSelector } from './QRTypeSelector';
import { QRStyleEditor } from './QRStyleEditor';
import { generateQRDataURL, downloadQRPNG } from '@/lib/qr/generator';
import type { QRContent, QRContentType, QRStyleOptions, DEFAULT_STYLE } from '@/lib/qr/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const DEFAULT_STYLE_OPTIONS: QRStyleOptions = {
  foregroundColor: '#14b8a6', // Teal/primary brand color
  backgroundColor: '#0f172a', // Dark navy background
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 256,
};

export function QRGenerator() {
  const [contentType, setContentType] = useState<QRContentType>('url');
  const [content, setContent] = useState<QRContent | null>(null);
  const [style, setStyle] = useState<QRStyleOptions>(DEFAULT_STYLE_OPTIONS);
  const [isDownloading, setIsDownloading] = useState(false);

  // Form state for different content types
  const [urlValue, setUrlValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
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

  // Update content based on type and form values
  const updateContent = useCallback((type: QRContentType, values: Record<string, string | boolean>) => {
    switch (type) {
      case 'url':
        if (values.url) {
          let url = values.url as string;
          // Add https:// if no protocol
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
            hidden: (values.hidden as boolean) || false,
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
  }, []);

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
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: QR Preview */}
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

        {/* Right: Configuration */}
        <div className="space-y-6">
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
                        hidden: wifiHidden,
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
                        hidden: wifiHidden,
                      });
                    }}
                    className="mt-1 bg-secondary/50"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
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
                          hidden: wifiHidden,
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
                <div>
                  <Label htmlFor="org">Organization</Label>
                  <Input
                    id="org"
                    placeholder="Company Inc."
                    value={vcardOrg}
                    onChange={(e) => {
                      setVcardOrg(e.target.value);
                      updateContent('vcard', {
                        firstName: vcardFirstName,
                        lastName: vcardLastName,
                        email: vcardEmail,
                        phone: vcardPhone,
                        org: e.target.value,
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

          {/* Upgrade CTA */}
          <Card className="p-6 glass border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Want more features?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upgrade to Pro for dynamic QR codes, analytics, brand logos, SVG downloads, and more.
                </p>
                <Link href="/signup" className="inline-block mt-3">
                  <Button size="sm" className="glow-hover">
                    Get Started Free
                    <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
