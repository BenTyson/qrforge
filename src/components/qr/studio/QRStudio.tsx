'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQRStudioState, DEFAULT_STYLE } from './hooks/useQRStudioState';
import { QRStudioSidebar } from './QRStudioSidebar';
import { QRStudioPreview, QRStudioMiniPreview } from './QRStudioPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { generateQRDataURL, downloadQRPNG, generateQRSVG, downloadQRSVG } from '@/lib/qr/generator';
import type { QRContent, QRContentType, QRStyleOptions } from '@/lib/qr/types';
import { PRO_ONLY_TYPES } from '@/lib/qr/types';

// Import step components from wizard
import {
  TypeStep,
  StyleStep,
  OptionsStep,
} from '../wizard';
import type { WizardStep } from '../wizard';

// Import form components for content step
import { WhatsAppForm } from '@/components/qr/forms/WhatsAppForm';
import { FacebookForm } from '@/components/qr/forms/FacebookForm';
import { InstagramForm } from '@/components/qr/forms/InstagramForm';
import { AppsForm } from '@/components/qr/forms/AppsForm';
import { PDFForm } from '@/components/qr/forms/PDFForm';
import { ImagesForm } from '@/components/qr/forms/ImagesForm';
import { VideoForm } from '@/components/qr/forms/VideoForm';
import { MP3Form } from '@/components/qr/forms/MP3Form';
import { MenuForm } from '@/components/qr/forms/MenuForm';
import { BusinessForm } from '@/components/qr/forms/BusinessForm';
import { LinksForm } from '@/components/qr/forms/LinksForm';
import { CouponForm } from '@/components/qr/forms/CouponForm';
import { SocialForm } from '@/components/qr/forms/SocialForm';
import { MenuPreview } from '@/components/menu/MenuPreview';
import { LinksPreview } from '@/components/links/LinksPreview';
import { BusinessPreview } from '@/components/business/BusinessPreview';
import { SocialPreview } from '@/components/social/SocialPreview';
import { CouponPreview } from '@/components/coupon/CouponPreview';
import { GalleryPreview } from '@/components/gallery/GalleryPreview';
import { PDFPreview } from '@/components/pdf/PDFPreview';
import { VideoPreview } from '@/components/video/VideoPreview';
import { AudioPreview } from '@/components/audio/AudioPreview';

interface QRStudioProps {
  mode: 'create' | 'edit';
  qrCodeId?: string;
}

export function QRStudio({ mode, qrCodeId }: QRStudioProps) {
  const router = useRouter();
  const [state, actions] = useQRStudioState({ mode, qrCodeId });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [mobilePreviewExpanded, setMobilePreviewExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(mode === 'create');

  // Load QR code data in edit mode
  useEffect(() => {
    if (mode === 'edit' && qrCodeId && !isLoaded) {
      actions.loadQRCode(qrCodeId).then((success) => {
        setIsLoaded(true);
        if (!success) {
          router.push('/qr-codes');
        }
      });
    }
  }, [mode, qrCodeId, isLoaded, actions, router]);

  // Check if step is complete
  const isStepComplete = useCallback((step: WizardStep): boolean => {
    switch (step) {
      case 'type':
        return !!state.selectedType;
      case 'content':
        return actions.isContentValid();
      case 'style':
        return true; // Style always has defaults
      case 'options':
        return true; // Options are optional
      case 'download':
        return state.hasDownloaded;
      default:
        return false;
    }
  }, [state.selectedType, state.hasDownloaded, actions]);

  // Check if step is clickable
  const isStepClickable = useCallback((step: WizardStep): boolean => {
    if (mode === 'edit') {
      return step !== 'type'; // All steps except type are clickable in edit mode
    }
    // In create mode, can only click completed steps or next step
    const stepOrder: WizardStep[] = ['type', 'content', 'style', 'options', 'download'];
    const targetIndex = stepOrder.indexOf(step);
    const currentIndex = stepOrder.indexOf(state.currentStep);

    // Can always go back
    if (targetIndex <= currentIndex) return true;

    // Can only go forward one step if current is valid
    if (targetIndex === currentIndex + 1) {
      return actions.canGoForward();
    }

    return false;
  }, [mode, state.currentStep, actions]);

  // Handle download
  const handleDownloadPNG = useCallback(async () => {
    if (!state.content || !state.selectedType) return;

    // If not logged in, prompt to sign up
    if (!state.userId) {
      router.push('/signup');
      return;
    }

    actions.setIsDownloading(true);
    try {
      // Save first if not already saved
      let code = state.shortCode;
      if (!state.savedQRId) {
        const result = await actions.saveQRCode();
        if (!result) {
          return;
        }
        code = result.shortCode;
      }

      // Generate QR with real short_code URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
      const qrContent: QRContent = {
        type: 'url',
        url: `${appUrl}/r/${code}`,
      };

      const dataURL = await generateQRDataURL(qrContent, { ...state.style, width: 1024 });
      downloadQRPNG(dataURL, actions.getFilename());
      actions.setHasDownloaded(true);
    } finally {
      actions.setIsDownloading(false);
    }
  }, [state, actions, router]);

  const handleDownloadSVG = useCallback(async () => {
    if (!state.content || !state.userTier || state.userTier === 'free' || !state.selectedType) return;

    actions.setIsDownloading(true);
    try {
      let code = state.shortCode;
      if (!state.savedQRId) {
        const result = await actions.saveQRCode();
        if (!result) {
          return;
        }
        code = result.shortCode;
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
      const qrContent: QRContent = {
        type: 'url',
        url: `${appUrl}/r/${code}`,
      };

      const svg = await generateQRSVG(qrContent, state.style);
      downloadQRSVG(svg, actions.getFilename());
      actions.setHasDownloaded(true);
    } finally {
      actions.setIsDownloading(false);
    }
  }, [state, actions]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!state.userId) {
      router.push('/signup');
      return;
    }
    const result = await actions.saveQRCode();
    if (result) {
      router.push('/qr-codes');
    }
  }, [state.userId, actions, router]);

  // Handle exit
  const handleExit = useCallback(() => {
    // Show confirmation if user has made progress
    if (state.currentStep !== 'type' && !state.hasDownloaded && !state.savedQRId) {
      setShowExitConfirm(true);
      return;
    }
    router.push('/qr-codes');
  }, [state, router]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canAccessProTypes = state.userTier === 'pro' || state.userTier === 'business';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40 flex items-center px-4 lg:px-6">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={handleExit}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">
            {mode === 'create' ? 'Create QR Code' : 'Edit QR Code'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Show save status */}
          {state.isSaving && (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Saving...
            </span>
          )}
          {state.saveError && (
            <span className="text-sm text-red-500">{state.saveError}</span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExit}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!actions.isContentValid() || state.isSaving || !state.userId}
          >
            {state.isSaving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Save'}
          </Button>
        </div>
      </header>

      {/* Mobile preview - only show on mobile */}
      <div className="lg:hidden">
        <QRStudioMiniPreview
          content={state.content}
          style={state.style}
          isExpanded={mobilePreviewExpanded}
          onToggle={() => setMobilePreviewExpanded(!mobilePreviewExpanded)}
        />
      </div>

      {/* Main layout */}
      <div className="flex-1 flex">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <QRStudioSidebar
              mode={mode}
              currentStep={state.currentStep}
              selectedType={state.selectedType}
              onStepClick={actions.setStep}
              isStepComplete={isStepComplete}
              isStepClickable={isStepClickable}
            />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 lg:p-8">
            {/* Step content */}
            {state.currentStep === 'type' && (
              <TypeStep
                selectedCategory={state.selectedCategory}
                onCategorySelect={(categoryId) => actions.selectCategory(categoryId)}
                onTypeSelect={(typeId) => {
                  if (PRO_ONLY_TYPES.includes(typeId as QRContentType) && !canAccessProTypes) {
                    router.push('/plans');
                    return;
                  }
                  actions.selectType(typeId as QRContentType);
                }}
                canAccessProTypes={canAccessProTypes}
                userTier={state.userTier}
              />
            )}

            {state.currentStep === 'content' && state.selectedType && (
              <ContentStep
                selectedType={state.selectedType}
                content={state.content}
                qrName={state.qrName}
                onContentChange={actions.setContent}
                onNameChange={actions.setQrName}
                userTier={state.userTier}
              />
            )}

            {state.currentStep === 'style' && (
              <StyleStep
                content={state.content}
                style={state.style}
                onStyleChange={actions.setStyle}
                onContinue={actions.goForward}
                canAccessProTypes={canAccessProTypes}
              />
            )}

            {state.currentStep === 'options' && (
              <OptionsStep
                expiresAt={state.expiresAt}
                onExpiresAtChange={actions.setExpiresAt}
                passwordEnabled={state.passwordEnabled}
                onPasswordEnabledChange={actions.setPasswordEnabled}
                password={state.password}
                onPasswordChange={actions.setPassword}
                scheduledEnabled={state.scheduledEnabled}
                onScheduledEnabledChange={actions.setScheduledEnabled}
                activeFrom={state.activeFrom}
                onActiveFromChange={actions.setActiveFrom}
                activeUntil={state.activeUntil}
                onActiveUntilChange={actions.setActiveUntil}
                canAccessProTypes={canAccessProTypes}
                userTier={state.userTier}
                onContinue={actions.goForward}
              />
            )}

            {state.currentStep === 'download' && (
              <DownloadStep
                content={state.content}
                style={state.style}
                qrName={state.qrName}
                shortCode={state.shortCode}
                savedQRId={state.savedQRId}
                userId={state.userId}
                userTier={state.userTier}
                isSaving={state.isSaving}
                isDownloading={state.isDownloading}
                hasDownloaded={state.hasDownloaded}
                saveError={state.saveError}
                onDownloadPNG={handleDownloadPNG}
                onDownloadSVG={handleDownloadSVG}
                onDone={() => router.push('/qr-codes')}
                onCreateAnother={() => actions.reset()}
              />
            )}
          </div>

          {/* Mobile bottom navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background p-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={actions.goBack}
              disabled={state.currentStep === (mode === 'edit' ? 'content' : 'type')}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={actions.goForward}
              disabled={!actions.canGoForward() || state.currentStep === 'download'}
            >
              Continue
            </Button>
          </div>
        </main>

        {/* Preview panel - hidden on mobile */}
        <div className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            {/* Show content preview for dynamic types on content step, QRStudioPreview otherwise */}
            {state.selectedType === 'menu' && state.currentStep === 'content' ? (
              <div className="h-full flex items-start justify-center p-6 bg-secondary/20">
                <MenuPreview content={(state.content as any) || {}} />
              </div>
            ) : state.selectedType === 'links' && state.currentStep === 'content' ? (
              <div className="h-full flex items-start justify-center p-6 bg-secondary/20">
                <LinksPreview content={(state.content as any) || {}} />
              </div>
            ) : state.selectedType === 'business' && state.currentStep === 'content' ? (
              <div className="h-full flex items-start justify-center p-6 bg-secondary/20">
                <BusinessPreview content={(state.content as any) || {}} />
              </div>
            ) : state.selectedType === 'social' && state.currentStep === 'content' ? (
              <div className="h-full flex items-start justify-center p-6 bg-secondary/20">
                <SocialPreview content={(state.content as any) || {}} />
              </div>
            ) : state.selectedType === 'coupon' && state.currentStep === 'content' ? (
              <div className="h-full flex items-start justify-center p-6 bg-secondary/20">
                <CouponPreview content={(state.content as any) || {}} />
              </div>
            ) : state.selectedType === 'images' && state.currentStep === 'content' ? (
              <div className="h-full flex items-start justify-center p-6 bg-secondary/20">
                <GalleryPreview content={(state.content as any) || {}} />
              </div>
            ) : state.selectedType === 'pdf' && state.currentStep === 'content' ? (
              <div className="h-full flex items-start justify-center p-6 bg-secondary/20">
                <PDFPreview content={(state.content as any) || {}} />
              </div>
            ) : state.selectedType === 'video' && state.currentStep === 'content' ? (
              <div className="h-full flex items-start justify-center p-6 bg-secondary/20">
                <VideoPreview content={(state.content as any) || {}} />
              </div>
            ) : state.selectedType === 'mp3' && state.currentStep === 'content' ? (
              <div className="h-full flex items-start justify-center p-6 bg-secondary/20">
                <AudioPreview content={(state.content as any) || {}} />
              </div>
            ) : (
              <QRStudioPreview
                content={state.content}
                style={state.style}
                qrName={state.qrName}
                shortCode={state.shortCode}
                userTier={state.userTier}
                isSaving={state.isSaving}
                isDownloading={state.isDownloading}
                onDownloadPNG={handleDownloadPNG}
                onDownloadSVG={handleDownloadSVG}
                className="h-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Exit confirmation dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowExitConfirm(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Discard changes?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You have unsaved changes. Are you sure you want to leave?
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowExitConfirm(false)}>
                Keep editing
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => router.push('/qr-codes')}>
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Content step component
interface ContentStepProps {
  selectedType: QRContentType;
  content: QRContent | null;
  qrName: string;
  onContentChange: (content: QRContent | null) => void;
  onNameChange: (name: string) => void;
  userTier: 'free' | 'pro' | 'business' | null;
}

function ContentStep({
  selectedType,
  content,
  qrName,
  onContentChange,
  onNameChange,
  userTier,
}: ContentStepProps) {
  // State for basic form types
  const [urlValue, setUrlValue] = useState((content as any)?.url || '');
  const [textValue, setTextValue] = useState((content as any)?.text || '');
  const [wifiSSID, setWifiSSID] = useState((content as any)?.ssid || '');
  const [wifiPassword, setWifiPassword] = useState((content as any)?.password || '');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>((content as any)?.encryption || 'WPA');
  const [vcardFirstName, setVcardFirstName] = useState((content as any)?.firstName || '');
  const [vcardLastName, setVcardLastName] = useState((content as any)?.lastName || '');
  const [vcardEmail, setVcardEmail] = useState((content as any)?.email || '');
  const [vcardPhone, setVcardPhone] = useState((content as any)?.phone || '');
  const [emailValue, setEmailValue] = useState((content as any)?.email || '');
  const [emailSubject, setEmailSubject] = useState((content as any)?.subject || '');
  const [phoneValue, setPhoneValue] = useState((content as any)?.phone || '');
  const [smsPhone, setSmsPhone] = useState((content as any)?.phone || '');
  const [smsMessage, setSmsMessage] = useState((content as any)?.message || '');

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

      // Pro types use dedicated form components
      case 'whatsapp':
        return <WhatsAppForm content={(content as any) || {}} onChange={onContentChange} />;
      case 'facebook':
        return <FacebookForm content={(content as any) || {}} onChange={onContentChange} />;
      case 'instagram':
        return <InstagramForm content={(content as any) || {}} onChange={onContentChange} />;
      case 'apps':
        return <AppsForm content={(content as any) || {}} onChange={onContentChange} />;
      case 'pdf':
        return <PDFForm content={(content as any) || {}} onChange={onContentChange} />;
      case 'images':
        return <ImagesForm content={(content as any) || {}} onChange={onContentChange} />;
      case 'video':
        return <VideoForm content={(content as any) || {}} onChange={onContentChange} />;
      case 'mp3':
        return <MP3Form content={(content as any) || {}} onChange={onContentChange} />;
      case 'menu':
        return <MenuForm content={(content as any) || {}} onChange={onContentChange} />;
      case 'business':
        return <BusinessForm content={(content as any) || {}} onChange={onContentChange} />;
      case 'links':
        return <LinksForm content={(content as any) || {}} onChange={onContentChange} />;
      case 'coupon':
        return <CouponForm content={(content as any) || {}} onChange={onContentChange} />;
      case 'social':
        return <SocialForm content={(content as any) || {}} onChange={onContentChange} />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
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
    </div>
  );
}

// Download step component
interface DownloadStepProps {
  content: QRContent | null;
  style: QRStyleOptions;
  qrName: string;
  shortCode: string | null;
  savedQRId: string | null;
  userId: string | null;
  userTier: 'free' | 'pro' | 'business' | null;
  isSaving: boolean;
  isDownloading: boolean;
  hasDownloaded: boolean;
  saveError: string | null;
  onDownloadPNG: () => void;
  onDownloadSVG: () => void;
  onDone: () => void;
  onCreateAnother: () => void;
}

function DownloadStep({
  content,
  style,
  qrName,
  shortCode,
  savedQRId,
  userId,
  userTier,
  isSaving,
  isDownloading,
  hasDownloaded,
  saveError,
  onDownloadPNG,
  onDownloadSVG,
  onDone,
  onCreateAnother,
}: DownloadStepProps) {
  const canDownloadSVG = userTier === 'pro' || userTier === 'business';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Download Your QR Code</h2>
        <p className="text-muted-foreground text-sm">
          {hasDownloaded
            ? 'Your QR code has been saved and downloaded!'
            : 'Save your QR code and download it in your preferred format'}
        </p>
      </div>

      {/* Sign up prompt for non-logged in users */}
      {!userId && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <h3 className="font-medium mb-1">Create an account to save</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Sign up to save your QR code and access it anytime.
          </p>
          <Link href="/signup">
            <Button size="sm">Sign up free</Button>
          </Link>
        </div>
      )}

      {/* Save error */}
      {saveError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
          {saveError}
        </div>
      )}

      {/* Download buttons */}
      <div className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          onClick={onDownloadPNG}
          disabled={!content || isDownloading || isSaving}
        >
          {isDownloading ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              {savedQRId ? 'Downloading...' : 'Saving & Downloading...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {savedQRId ? 'Download PNG' : 'Save & Download PNG'}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={onDownloadSVG}
          disabled={!content || !canDownloadSVG || isDownloading || isSaving}
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download SVG (Vector)
            {!canDownloadSVG && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">
                Pro
              </span>
            )}
          </span>
        </Button>
      </div>

      {/* Short URL */}
      {shortCode && (
        <div className="p-4 bg-secondary/50 rounded-xl">
          <p className="text-sm font-medium mb-2">Your QR Code URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-background px-3 py-2 rounded-lg">
              https://qrwolf.com/r/{shortCode}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(`https://qrwolf.com/r/${shortCode}`)}
            >
              Copy
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      {hasDownloaded && (
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onCreateAnother}>
            Create Another
          </Button>
          <Button className="flex-1" onClick={onDone}>
            <span className="flex items-center gap-2">
              Done
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </Button>
        </div>
      )}

      {/* Dashboard link */}
      {savedQRId && (
        <div className="text-center pt-4">
          <Link href="/qr-codes" className="text-sm text-primary hover:underline">
            View in Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
