'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getFormComponent } from '@/lib/qr/form-registry';
import { Sparkles } from 'lucide-react';
import { useQRStudio } from '../QRStudioContext';
import type {
  QRContent,
  URLContent,
  TextContent,
  WiFiContent,
  VCardContent,
  EmailContent,
  PhoneContent,
  SMSContent,
} from '@/lib/qr/types';

interface ContentStepProps {
  onContinue: () => void;
}

export function ContentStep({ onContinue }: ContentStepProps) {
  const { state, actions } = useQRStudio();
  const selectedType = state.selectedType!;
  const content = state.content;
  const qrName = state.qrName;
  const onContentChange = actions.setContent;
  const onNameChange = actions.setQrName;
  const canContinue = actions.isContentValid();
  const templateId = state.templateId;
  const templateName = state.templateName;
  // State for basic form types
  const [urlValue, setUrlValue] = useState((content as URLContent | null)?.url || '');
  const [textValue, setTextValue] = useState((content as TextContent | null)?.text || '');
  const [wifiSSID, setWifiSSID] = useState((content as WiFiContent | null)?.ssid || '');
  const [wifiPassword, setWifiPassword] = useState((content as WiFiContent | null)?.password || '');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>((content as WiFiContent | null)?.encryption || 'WPA');
  const [vcardFirstName, setVcardFirstName] = useState((content as VCardContent | null)?.firstName || '');
  const [vcardLastName, setVcardLastName] = useState((content as VCardContent | null)?.lastName || '');
  const [vcardEmail, setVcardEmail] = useState((content as VCardContent | null)?.email || '');
  const [vcardPhone, setVcardPhone] = useState((content as VCardContent | null)?.phone || '');
  const [emailValue, setEmailValue] = useState((content as EmailContent | null)?.email || '');
  const [emailSubject, setEmailSubject] = useState((content as EmailContent | null)?.subject || '');
  const [phoneValue, setPhoneValue] = useState((content as PhoneContent | null)?.phone || '');
  const [smsPhone, setSmsPhone] = useState((content as SMSContent | null)?.phone || '');
  const [smsMessage, setSmsMessage] = useState((content as SMSContent | null)?.message || '');

  // Update content when form values change
  useEffect(() => {
    let newContent: QRContent | null = null;

    switch (selectedType) {
      case 'url':
        if (urlValue) {
          newContent = { type: 'url', url: urlValue };
        }
        break;
      case 'text':
        if (textValue) {
          newContent = { type: 'text', text: textValue };
        }
        break;
      case 'wifi':
        if (wifiSSID) {
          newContent = { type: 'wifi', ssid: wifiSSID, password: wifiPassword, encryption: wifiEncryption, hidden: false };
        }
        break;
      case 'vcard':
        if (vcardFirstName || vcardLastName) {
          newContent = { type: 'vcard', firstName: vcardFirstName, lastName: vcardLastName, email: vcardEmail, phone: vcardPhone };
        }
        break;
      case 'email':
        if (emailValue) {
          newContent = { type: 'email', email: emailValue, subject: emailSubject };
        }
        break;
      case 'phone':
        if (phoneValue) {
          newContent = { type: 'phone', phone: phoneValue };
        }
        break;
      case 'sms':
        if (smsPhone) {
          newContent = { type: 'sms', phone: smsPhone, message: smsMessage };
        }
        break;
      default:
        // For complex types, content is managed by the form components
        break;
    }

    if (newContent) {
      onContentChange(newContent);
    }
  }, [selectedType, urlValue, textValue, wifiSSID, wifiPassword, wifiEncryption, vcardFirstName, vcardLastName, vcardEmail, vcardPhone, emailValue, emailSubject, phoneValue, smsPhone, smsMessage, onContentChange]);

  const renderForm = () => {
    // Check registry for a dedicated form component
    const FormComponent = getFormComponent(selectedType);
    if (FormComponent) {
      return <FormComponent content={content || {}} onChange={onContentChange} />;
    }

    // Basic types — inline forms
    switch (selectedType) {
      case 'url':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Text Content</Label>
              <textarea
                id="text"
                placeholder="Enter your text..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="mt-1 w-full min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ssid">Network Name (SSID)</Label>
              <Input
                id="ssid"
                placeholder="My WiFi Network"
                value={wifiSSID}
                onChange={(e) => setWifiSSID(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="wifiPassword">Password</Label>
              <Input
                id="wifiPassword"
                type="password"
                placeholder="Network password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Encryption</Label>
              <div className="flex gap-2 mt-1">
                {(['WPA', 'WEP', 'nopass'] as const).map((enc) => (
                  <button
                    key={enc}
                    onClick={() => setWifiEncryption(enc)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      wifiEncryption === enc
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    {enc === 'nopass' ? 'None' : enc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={vcardFirstName}
                  onChange={(e) => setVcardFirstName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={vcardLastName}
                  onChange={(e) => setVcardLastName(e.target.value)}
                  className="mt-1"
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
                onChange={(e) => setVcardEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vcardPhone">Phone</Label>
              <Input
                id="vcardPhone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={vcardPhone}
                onChange={(e) => setVcardPhone(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                placeholder="Hello!"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phoneValue}
                onChange={(e) => setPhoneValue(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="smsPhone">Phone Number</Label>
              <Input
                id="smsPhone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="smsMessage">Message (optional)</Label>
              <textarea
                id="smsMessage"
                placeholder="Your message..."
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="mt-1 w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Template banner */}
      {templateId && templateName && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">Using template: {templateName}</p>
            <p className="text-sm text-slate-400">Style applied. Add your content below.</p>
          </div>
          <Link
            href="/templates"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
          >
            Change
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-1">Enter Content</h2>
        <p className="text-muted-foreground text-sm">
          Fill in the details for your QR code
        </p>
      </div>

      {/* QR Code Name */}
      <div>
        <Label htmlFor="qrName">QR Code Name</Label>
        <Input
          id="qrName"
          placeholder="My QR Code"
          value={qrName}
          onChange={(e) => onNameChange(e.target.value)}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          This name will be used for the download filename
        </p>
      </div>

      {/* Content form */}
      <div className="pt-4 border-t border-border">
        {renderForm()}
      </div>

      {/* Continue Button */}
      <Button
        onClick={onContinue}
        disabled={!canContinue}
        className="w-full mt-6"
        size="lg"
      >
        Continue to Style
        <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}
