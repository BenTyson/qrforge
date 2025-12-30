/**
 * @deprecated This modal-based wizard is deprecated in favor of QRStudio.
 * Use the full-page QRStudio component instead:
 *   - Create: /qr-codes/create (QRStudio mode="create")
 *   - Edit: /qr-codes/[id]/edit (QRStudio mode="edit")
 *
 * This file is kept temporarily for reference during migration.
 * TODO: Remove this file once QRStudio is fully tested.
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { QRPreview } from './QRPreview';
import { generateQRDataURL, downloadQRPNG, generateQRSVG, downloadQRSVG, contentToString } from '@/lib/qr/generator';
import type { QRContent, QRContentType, QRStyleOptions } from '@/lib/qr/types';
import { PRO_ONLY_TYPES, DYNAMIC_REQUIRED_TYPES } from '@/lib/qr/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Form components
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
import { LogoUploader } from '@/components/qr/LogoUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

// Wizard step components and constants
import {
  TYPE_CATEGORIES,
  COLOR_PRESETS,
  PREVIEWABLE_TYPES,
  WIZARD_STEPS,
  TypeStep,
  StyleStep,
  OptionsStep,
  DownloadStep,
} from './wizard';
import type { WizardStep } from './wizard';

const DEFAULT_STYLE: QRStyleOptions = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 256,
};

interface QRWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRWizard({ isOpen, onClose }: QRWizardProps) {
  const [step, setStep] = useState<WizardStep>('type');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<QRContentType | null>(null);
  const [content, setContent] = useState<QRContent | null>(null);
  const [style, setStyle] = useState<QRStyleOptions>(DEFAULT_STYLE);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'business' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [savedQRId, setSavedQRId] = useState<string | null>(null);
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Pro options state
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [scheduledEnabled, setScheduledEnabled] = useState(false);
  const [activeFrom, setActiveFrom] = useState<string>('');
  const [activeUntil, setActiveUntil] = useState<string>('');
  const [landingPageEnabled, setLandingPageEnabled] = useState(false);
  const [landingPageTitle, setLandingPageTitle] = useState('');
  const [landingPageDescription, setLandingPageDescription] = useState('');
  const [landingPageButtonText, setLandingPageButtonText] = useState('Continue');

  const router = useRouter();

  // Fetch user tier on mount
  useEffect(() => {
    const fetchUserTier = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        setUserTier((profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business');
      } else {
        setUserId(null);
        setUserTier(null); // Not logged in
      }
    };

    if (isOpen) {
      fetchUserTier();
    }
  }, [isOpen]);

  // QR Code name
  const [qrName, setQrName] = useState('');

  // Form state for basic types
  const [urlValue, setUrlValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [vcardFirstName, setVcardFirstName] = useState('');
  const [vcardLastName, setVcardLastName] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  const resetWizard = useCallback(() => {
    setStep('type');
    setSelectedCategory(null);
    setSelectedType(null);
    setContent(null);
    setStyle(DEFAULT_STYLE);
    setQrName('');
    setHasDownloaded(false);
    setSavedQRId(null);
    setShortCode(null);
    setSaveError(null);
    // Reset Pro options
    setExpiresAt('');
    setPasswordEnabled(false);
    setPassword('');
    setScheduledEnabled(false);
    setActiveFrom('');
    setActiveUntil('');
    setLandingPageEnabled(false);
    setLandingPageTitle('');
    setLandingPageDescription('');
    setLandingPageButtonText('Continue');
    // Reset form fields
    setUrlValue('');
    setTextValue('');
    setWifiSSID('');
    setWifiPassword('');
    setVcardFirstName('');
    setVcardLastName('');
    setVcardEmail('');
    setVcardPhone('');
    setEmailValue('');
    setEmailSubject('');
    setPhoneValue('');
    setSmsPhone('');
    setSmsMessage('');
  }, []);

  // Validate content based on type
  const isContentValid = useCallback(() => {
    if (!content || !selectedType) return false;

    switch (selectedType) {
      case 'url':
        return !!(content as any).url?.trim();
      case 'text':
        return !!(content as any).text?.trim();
      case 'wifi':
        return !!(content as any).ssid?.trim();
      case 'vcard':
        return !!((content as any).firstName?.trim() || (content as any).lastName?.trim());
      case 'email':
        return !!(content as any).email?.trim();
      case 'phone':
        return !!(content as any).phone?.trim();
      case 'sms':
        return !!(content as any).phone?.trim();
      case 'whatsapp':
        return !!(content as any).phone?.trim();
      case 'facebook':
        return !!(content as any).profileUrl?.trim();
      case 'instagram':
        return !!(content as any).username?.trim();
      case 'apps':
        return !!((content as any).appStoreUrl?.trim() || (content as any).playStoreUrl?.trim() || (content as any).fallbackUrl?.trim());
      // Media File Types
      case 'pdf':
        return !!(content as any).fileUrl?.trim() || !!(content as any).fileName?.trim();
      case 'images':
        return (content as any).images?.length > 0;
      case 'video':
        return !!(content as any).videoUrl?.trim() || !!(content as any).embedUrl?.trim();
      case 'mp3':
        return !!(content as any).audioUrl?.trim() || !!(content as any).embedUrl?.trim();
      // Business & Landing Page Types
      case 'menu':
        return !!(content as any).restaurantName?.trim();
      case 'business':
        return !!(content as any).name?.trim();
      case 'links':
        return !!(content as any).title?.trim();
      case 'coupon':
        return !!(content as any).businessName?.trim() && !!(content as any).headline?.trim();
      case 'social':
        return !!(content as any).name?.trim();
      default:
        return false;
    }
  }, [content, selectedType]);

  const handleClose = () => {
    // Skip confirmation if user has downloaded or completed the flow
    if (hasDownloaded || step === 'download') {
      resetWizard();
      onClose();
      return;
    }
    // Show confirmation if user has made progress
    if (step !== 'type' || selectedCategory) {
      setShowExitConfirm(true);
      return;
    }
    resetWizard();
    onClose();
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    resetWizard();
    onClose();
  };

  // Generate safe filename from QR name
  // Generate a short code for the QR
  const generateShortCode = useCallback((): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  // Check if type requires dynamic QR code
  const requiresDynamicQR = useCallback((type: QRContentType): boolean => {
    return DYNAMIC_REQUIRED_TYPES.includes(type);
  }, []);

  // Save QR code to database
  const saveQRCode = useCallback(async (): Promise<{ id: string; shortCode: string } | null> => {
    if (!content || !selectedType || !userId) return null;

    setIsSaving(true);
    setSaveError(null);

    try {
      const supabase = createClient();
      const newShortCode = generateShortCode();
      const isDynamic = requiresDynamicQR(selectedType);

      // Get destination URL for simple types
      let destinationUrl = null;
      if (!isDynamic) {
        destinationUrl = contentToString(content);
      }

      // Build the insert object with Pro options
      const insertData: Record<string, unknown> = {
        user_id: userId,
        name: qrName.trim() || `${selectedType} QR Code`,
        type: isDynamic ? 'dynamic' : 'static',
        content_type: selectedType,
        content: content as unknown as Record<string, unknown>,
        destination_url: destinationUrl,
        short_code: newShortCode,
        style: {
          foregroundColor: style.foregroundColor,
          backgroundColor: style.backgroundColor,
          errorCorrectionLevel: style.errorCorrectionLevel,
          margin: style.margin,
          logoUrl: style.logoUrl,
          logoSize: style.logoSize,
        },
      };

      // Add Pro options if set
      if (expiresAt) {
        insertData.expires_at = new Date(expiresAt).toISOString();
      }
      if (passwordEnabled && password) {
        // Simple hash for now - in production you'd want bcrypt on the server
        insertData.password_hash = password;
      }
      if (scheduledEnabled) {
        if (activeFrom) {
          insertData.active_from = new Date(activeFrom).toISOString();
        }
        if (activeUntil) {
          insertData.active_until = new Date(activeUntil).toISOString();
        }
      }

      const { data, error } = await supabase
        .from('qr_codes')
        .insert(insertData)
        .select('id')
        .single();

      if (error) throw error;

      setSavedQRId(data.id);
      setShortCode(newShortCode);
      return { id: data.id, shortCode: newShortCode };
    } catch (err) {
      console.error('Failed to save QR code:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save QR code');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [content, selectedType, userId, qrName, style, generateShortCode, requiresDynamicQR, expiresAt, passwordEnabled, password, scheduledEnabled, activeFrom, activeUntil]);

  const getFilename = useCallback(() => {
    if (qrName.trim()) {
      return `qrwolf-${qrName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    }
    return `qrwolf-${selectedType || 'code'}`;
  }, [qrName, selectedType]);

  const handleDownloadSVG = async () => {
    if (!content || !userTier || userTier === 'free' || !selectedType) return;
    setIsDownloading(true);
    try {
      // Save first if not already saved
      let code = shortCode;
      if (!savedQRId) {
        const result = await saveQRCode();
        if (!result) {
          return; // Save failed
        }
        code = result.shortCode;
      }

      // Generate QR with real short_code URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
      const qrContent: QRContent = {
        type: 'url',
        url: `${appUrl}/r/${code}`,
      };

      const svg = await generateQRSVG(qrContent, style);
      downloadQRSVG(svg, getFilename());
      setHasDownloaded(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const canDownloadSVG = userTier === 'pro' || userTier === 'business';
  const canAccessProTypes = userTier === 'pro' || userTier === 'business';

  const handleTypeSelect = (typeId: string) => {
    // Check if it's a pro-only type and user doesn't have access
    if (PRO_ONLY_TYPES.includes(typeId as QRContentType) && !canAccessProTypes) {
      // Pro types redirect to signup for non-pro users
      return;
    }
    setSelectedType(typeId as QRContentType);
    setStep('content');
  };

  const handleBack = () => {
    if (step === 'content') {
      // Go back to type selection and clear selections
      setStep('type');
      setSelectedCategory(null);
      setSelectedType(null);
      setContent(null);
    } else if (step === 'style') {
      setStep('content');
    } else if (step === 'options') {
      setStep('style');
    } else if (step === 'download') {
      setStep('options');
    }
  };

  const handleContinue = () => {
    if (step === 'content' && content) {
      setStep('style');
    } else if (step === 'style') {
      setStep('options');
    } else if (step === 'options') {
      setStep('download');
    }
  };

  const handleDownload = async () => {
    if (!content || !selectedType) return;

    // If not logged in, prompt to sign up
    if (!userId) {
      router.push('/signup');
      return;
    }

    setIsDownloading(true);
    try {
      // Save first if not already saved
      let code = shortCode;
      if (!savedQRId) {
        const result = await saveQRCode();
        if (!result) {
          return; // Save failed
        }
        code = result.shortCode;
      }

      // Generate QR with real short_code URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
      const qrContent: QRContent = {
        type: 'url',
        url: `${appUrl}/r/${code}`,
      };

      const dataURL = await generateQRDataURL(qrContent, { ...style, width: 1024 });
      downloadQRPNG(dataURL, getFilename());
      setHasDownloaded(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const steps: { id: WizardStep; label: string }[] = [
    { id: 'type', label: 'Type' },
    { id: 'content', label: 'Content' },
    { id: 'style', label: 'Style' },
    { id: 'options', label: 'Options' },
    { id: 'download', label: 'Download' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            {step !== 'type' && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-xl font-semibold text-white">Create QR Code</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-3 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center justify-center gap-2">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      index < currentStepIndex
                        ? 'bg-primary text-white'
                        : index === currentStepIndex
                        ? 'bg-primary text-white'
                        : 'bg-slate-700 text-slate-400'
                    )}
                  >
                    {index < currentStepIndex ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium hidden sm:inline',
                      index <= currentStepIndex ? 'text-white' : 'text-slate-500'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-12 sm:w-16 h-0.5 mx-2 sm:mx-4',
                      index < currentStepIndex ? 'bg-primary' : 'bg-slate-700'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Type Selection */}
          {step === 'type' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">What would you like to create?</h3>
                <p className="text-slate-400">Choose the type of QR code you need</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TYPE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'relative p-6 rounded-xl border-2 transition-all text-left group',
                      selectedCategory === category.id
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                    )}
                  >
                    {category.pro && !canAccessProTypes && (
                      <span className="absolute top-3 right-3 text-[10px] font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Pro
                      </span>
                    )}
                    <div className={cn(
                      'mb-3 transition-colors',
                      selectedCategory === category.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-300'
                    )}>
                      {category.icon}
                    </div>
                    <h4 className="font-semibold text-white mb-1">{category.name}</h4>
                    <p className="text-xs text-slate-400">
                      {category.types.length} option{category.types.length > 1 ? 's' : ''}
                    </p>
                  </button>
                ))}
              </div>

              {/* Type options for selected category */}
              {selectedCategory && (
                <div className="mt-8 pt-6 border-t border-slate-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Choose a type
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TYPE_CATEGORIES.find((c) => c.id === selectedCategory)?.types.map((type) => {
                      const isProType = 'pro' in type && type.pro;
                      const isDisabled = isProType && !canAccessProTypes;
                      return (
                        <button
                          key={type.id}
                          onClick={() => handleTypeSelect(type.id)}
                          disabled={isDisabled}
                          className={cn(
                            'p-4 rounded-xl border transition-all text-left',
                            isDisabled
                              ? 'border-slate-700 bg-slate-800/30 opacity-60 cursor-not-allowed'
                              : 'border-slate-700 bg-slate-800/50 hover:border-primary hover:bg-primary/5'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-white">{type.name}</h5>
                              <p className="text-sm text-slate-400">{type.description}</p>
                            </div>
                            {isDisabled ? (
                              <Link
                                href="/plans"
                                className="text-xs font-medium bg-primary/20 text-primary px-2 py-1 rounded-full hover:bg-primary/30"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Pro
                              </Link>
                            ) : (
                              <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upgrade CTA - only show for non-pro users */}
              {!canAccessProTypes && (
                <div className="mt-8 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">Unlock all QR types</p>
                      <p className="text-sm text-slate-400">Get analytics, dynamic codes, file uploads & more</p>
                    </div>
                    <Link href={userTier === null ? "/signup" : "/plans"}>
                      <Button className="shrink-0 glow-hover">
                        {userTier === null ? "Sign Up" : "View Plans"}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Content */}
          {step === 'content' && selectedType && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Enter your content</h3>
                <p className="text-slate-400">Fill in the details for your QR code</p>
              </div>

              {/* QR Code Name */}
              <div className="space-y-2">
                <Label htmlFor="qrName" className="text-white">QR Code Name</Label>
                <Input
                  id="qrName"
                  type="text"
                  placeholder="e.g., Business Card, Menu, Website Link..."
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
                <p className="text-xs text-slate-500">This helps you identify it later and names your download file</p>
              </div>

              {/* URL Form */}
              {selectedType === 'url' && (
                <div className="space-y-4">
                  <Label htmlFor="url" className="text-white">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={urlValue}
                    onChange={(e) => {
                      setUrlValue(e.target.value);
                      if (e.target.value) {
                        let url = e.target.value;
                        if (!url.startsWith('http://') && !url.startsWith('https://')) {
                          url = 'https://' + url;
                        }
                        setContent({ type: 'url', url });
                      } else {
                        setContent(null);
                      }
                    }}
                    className="text-lg bg-slate-800 border-slate-700"
                  />
                </div>
              )}

              {/* Text Form */}
              {selectedType === 'text' && (
                <div className="space-y-4">
                  <Label htmlFor="text" className="text-white">Text Content</Label>
                  <textarea
                    id="text"
                    placeholder="Enter your text here..."
                    value={textValue}
                    onChange={(e) => {
                      setTextValue(e.target.value);
                      if (e.target.value) {
                        setContent({ type: 'text', text: e.target.value });
                      } else {
                        setContent(null);
                      }
                    }}
                    className="w-full h-32 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              )}

              {/* WiFi Form */}
              {selectedType === 'wifi' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ssid" className="text-white">Network Name (SSID)</Label>
                    <Input
                      id="ssid"
                      placeholder="MyWiFiNetwork"
                      value={wifiSSID}
                      onChange={(e) => {
                        setWifiSSID(e.target.value);
                        if (e.target.value) {
                          setContent({
                            type: 'wifi',
                            ssid: e.target.value,
                            password: wifiPassword,
                            encryption: wifiEncryption,
                            hidden: false,
                          });
                        } else {
                          setContent(null);
                        }
                      }}
                      className="mt-1 bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wifiPass" className="text-white">Password</Label>
                    <Input
                      id="wifiPass"
                      type="password"
                      placeholder="WiFi password"
                      value={wifiPassword}
                      onChange={(e) => {
                        setWifiPassword(e.target.value);
                        if (wifiSSID) {
                          setContent({
                            type: 'wifi',
                            ssid: wifiSSID,
                            password: e.target.value,
                            encryption: wifiEncryption,
                            hidden: false,
                          });
                        }
                      }}
                      className="mt-1 bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Security Type</Label>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => {
                        const val = e.target.value as 'WPA' | 'WEP' | 'nopass';
                        setWifiEncryption(val);
                        if (wifiSSID) {
                          setContent({
                            type: 'wifi',
                            ssid: wifiSSID,
                            password: wifiPassword,
                            encryption: val,
                            hidden: false,
                          });
                        }
                      }}
                      className="w-full mt-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* vCard Form */}
              {selectedType === 'vcard' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-white">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={vcardFirstName}
                        onChange={(e) => {
                          setVcardFirstName(e.target.value);
                          if (e.target.value || vcardLastName) {
                            setContent({
                              type: 'vcard',
                              firstName: e.target.value,
                              lastName: vcardLastName,
                              email: vcardEmail,
                              phone: vcardPhone,
                            });
                          } else {
                            setContent(null);
                          }
                        }}
                        className="mt-1 bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-white">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={vcardLastName}
                        onChange={(e) => {
                          setVcardLastName(e.target.value);
                          if (vcardFirstName || e.target.value) {
                            setContent({
                              type: 'vcard',
                              firstName: vcardFirstName,
                              lastName: e.target.value,
                              email: vcardEmail,
                              phone: vcardPhone,
                            });
                          }
                        }}
                        className="mt-1 bg-slate-800 border-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vcardEmail" className="text-white">Email</Label>
                    <Input
                      id="vcardEmail"
                      type="email"
                      placeholder="john@example.com"
                      value={vcardEmail}
                      onChange={(e) => {
                        setVcardEmail(e.target.value);
                        if (vcardFirstName || vcardLastName) {
                          setContent({
                            type: 'vcard',
                            firstName: vcardFirstName,
                            lastName: vcardLastName,
                            email: e.target.value,
                            phone: vcardPhone,
                          });
                        }
                      }}
                      className="mt-1 bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vcardPhone" className="text-white">Phone</Label>
                    <Input
                      id="vcardPhone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={vcardPhone}
                      onChange={(e) => {
                        setVcardPhone(e.target.value);
                        if (vcardFirstName || vcardLastName) {
                          setContent({
                            type: 'vcard',
                            firstName: vcardFirstName,
                            lastName: vcardLastName,
                            email: vcardEmail,
                            phone: e.target.value,
                          });
                        }
                      }}
                      className="mt-1 bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              )}

              {/* Email Form */}
              {selectedType === 'email' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="emailAddr" className="text-white">Email Address</Label>
                    <Input
                      id="emailAddr"
                      type="email"
                      placeholder="contact@example.com"
                      value={emailValue}
                      onChange={(e) => {
                        setEmailValue(e.target.value);
                        if (e.target.value) {
                          setContent({
                            type: 'email',
                            email: e.target.value,
                            subject: emailSubject,
                          });
                        } else {
                          setContent(null);
                        }
                      }}
                      className="mt-1 bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-white">Subject (optional)</Label>
                    <Input
                      id="subject"
                      placeholder="Email subject line"
                      value={emailSubject}
                      onChange={(e) => {
                        setEmailSubject(e.target.value);
                        if (emailValue) {
                          setContent({
                            type: 'email',
                            email: emailValue,
                            subject: e.target.value,
                          });
                        }
                      }}
                      className="mt-1 bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              )}

              {/* Phone Form */}
              {selectedType === 'phone' && (
                <div className="space-y-4">
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phoneValue}
                    onChange={(e) => {
                      setPhoneValue(e.target.value);
                      if (e.target.value) {
                        setContent({ type: 'phone', phone: e.target.value });
                      } else {
                        setContent(null);
                      }
                    }}
                    className="text-lg bg-slate-800 border-slate-700"
                  />
                </div>
              )}

              {/* SMS Form */}
              {selectedType === 'sms' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="smsPhone" className="text-white">Phone Number</Label>
                    <Input
                      id="smsPhone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={smsPhone}
                      onChange={(e) => {
                        setSmsPhone(e.target.value);
                        if (e.target.value) {
                          setContent({
                            type: 'sms',
                            phone: e.target.value,
                            message: smsMessage,
                          });
                        } else {
                          setContent(null);
                        }
                      }}
                      className="mt-1 bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smsMsg" className="text-white">Pre-filled Message (optional)</Label>
                    <textarea
                      id="smsMsg"
                      placeholder="Your message here..."
                      value={smsMessage}
                      onChange={(e) => {
                        setSmsMessage(e.target.value);
                        if (smsPhone) {
                          setContent({
                            type: 'sms',
                            phone: smsPhone,
                            message: e.target.value,
                          });
                        }
                      }}
                      className="w-full h-24 mt-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Social Media Forms */}
              {selectedType === 'whatsapp' && (
                <WhatsAppForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {selectedType === 'facebook' && (
                <FacebookForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {selectedType === 'instagram' && (
                <InstagramForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {selectedType === 'apps' && (
                <AppsForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {/* Media File Forms */}
              {selectedType === 'pdf' && (
                <PDFForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {selectedType === 'images' && (
                <ImagesForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {selectedType === 'video' && (
                <VideoForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {selectedType === 'mp3' && (
                <MP3Form
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {/* Business & Landing Page Forms */}
              {selectedType === 'menu' && (
                <MenuForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {selectedType === 'business' && (
                <BusinessForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {selectedType === 'links' && (
                <LinksForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {selectedType === 'coupon' && (
                <CouponForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {selectedType === 'social' && (
                <SocialForm
                  content={(content as any) || {}}
                  onChange={(c) => setContent(c)}
                />
              )}

              {/* Preview Button for Landing Page Types */}
              {selectedType && PREVIEWABLE_TYPES.includes(selectedType) && isContentValid() && (
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  className="w-full border-primary/50 text-primary hover:bg-primary/10"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  Preview Landing Page
                </Button>
              )}

              {/* Continue Button */}
              <div className="pt-6">
                <Button
                  onClick={handleContinue}
                  disabled={!isContentValid()}
                  className="w-full"
                  size="lg"
                >
                  Continue to Style
                  <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Style */}
          {step === 'style' && (
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Preview */}
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-xs aspect-square">
                    <QRPreview content={content} style={style} className="w-full h-full" />
                  </div>

                  {/* Logo Upload - Pro feature */}
                  <div className="w-full max-w-xs mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <p className="text-sm font-medium text-white mb-3">Add your logo</p>
                    {canAccessProTypes ? (
                      <div className="space-y-4">
                        <LogoUploader
                          value={style.logoUrl}
                          onChange={(url) => setStyle({ ...style, logoUrl: url, errorCorrectionLevel: url ? 'H' : style.errorCorrectionLevel })}
                          placeholder="Upload logo for QR center"
                        />
                        {/* Logo Size Slider - only show when logo is uploaded */}
                        {style.logoUrl && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-white text-sm">Logo Size</Label>
                              <span className="text-sm text-slate-400">{style.logoSize || 20}%</span>
                            </div>
                            <Slider
                              value={[style.logoSize || 20]}
                              onValueChange={([value]) => setStyle({ ...style, logoSize: value })}
                              min={15}
                              max={30}
                              step={1}
                              className="w-full"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              Larger logos may affect scannability
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-400">Upgrade to Pro to add logos</p>
                        </div>
                        <Link href="/plans">
                          <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                            Pro
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Style Options */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Color Presets</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => setStyle({ ...style, foregroundColor: preset.fg, backgroundColor: preset.bg })}
                          className={cn(
                            'aspect-square rounded-lg border-2 transition-all overflow-hidden',
                            style.foregroundColor === preset.fg && style.backgroundColor === preset.bg
                              ? 'border-primary scale-105'
                              : 'border-transparent hover:border-slate-600'
                          )}
                          title={preset.name}
                        >
                          <div className="w-full h-full" style={{ backgroundColor: preset.bg }}>
                            <div
                              className="w-1/2 h-full"
                              style={{ backgroundColor: preset.fg }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">QR Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={style.foregroundColor}
                          onChange={(e) => setStyle({ ...style, foregroundColor: e.target.value })}
                          className="w-12 h-10 p-1 bg-slate-800 border-slate-700"
                        />
                        <Input
                          type="text"
                          value={style.foregroundColor}
                          onChange={(e) => setStyle({ ...style, foregroundColor: e.target.value })}
                          className="flex-1 bg-slate-800 border-slate-700"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Background</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={style.backgroundColor}
                          onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                          className="w-12 h-10 p-1 bg-slate-800 border-slate-700"
                        />
                        <Input
                          type="text"
                          value={style.backgroundColor}
                          onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                          className="flex-1 bg-slate-800 border-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Durability (Error Correction Level) */}
                  <div>
                    <Label className="text-white mb-3 block">Durability</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { level: 'L' as const, name: 'Basic', desc: 'Screens & digital' },
                        { level: 'M' as const, name: 'Standard', desc: 'General print', recommended: true },
                        { level: 'Q' as const, name: 'Enhanced', desc: 'Logos & busy designs' },
                        { level: 'H' as const, name: 'Maximum', desc: 'Outdoor & rough use' },
                      ]).map((option) => (
                        <button
                          key={option.level}
                          onClick={() => setStyle({ ...style, errorCorrectionLevel: option.level })}
                          className={cn(
                            'flex items-start gap-2 p-3 rounded-lg text-left transition-all border',
                            style.errorCorrectionLevel === option.level
                              ? 'border-primary bg-primary/10'
                              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                          )}
                        >
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-1.5 shrink-0',
                            style.errorCorrectionLevel === option.level ? 'bg-primary' : 'bg-slate-600'
                          )} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'text-sm font-medium',
                                style.errorCorrectionLevel === option.level ? 'text-primary' : 'text-white'
                              )}>
                                {option.name}
                              </span>
                              {option.recommended && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">{option.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Space (Margin) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-white">Border Space</Label>
                      <span className="text-sm text-slate-400">
                        {style.margin === 0 ? 'None' : style.margin <= 2 ? 'Tight' : style.margin <= 4 ? 'Normal' : 'Wide'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      Empty space around the QR helps scanners read it reliably
                    </p>
                    <Slider
                      value={[style.margin]}
                      onValueChange={([value]) => setStyle({ ...style, margin: value })}
                      min={0}
                      max={6}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Continue Button */}
                  <Button onClick={handleContinue} className="w-full" size="lg">
                    Continue to Options
                    <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Options (Pro Features) */}
          {step === 'options' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Advanced Options</h3>
                <p className="text-slate-400">Configure expiration, password protection, and more</p>
              </div>

              {/* Pro Feature Cards */}
              <div className="space-y-4">
                {/* Expiration Date */}
                <div className={cn(
                  'p-4 rounded-xl border transition-all',
                  expiresAt
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-700 bg-slate-800/50',
                  !canAccessProTypes && 'opacity-60'
                )}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">Expiration Date</h4>
                        {!canAccessProTypes && (
                          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Pro</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-3">Set a date when this QR code stops working</p>
                      {canAccessProTypes ? (
                        <Input
                          type="date"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="bg-slate-900 border-slate-600"
                        />
                      ) : (
                        <Link href="/plans">
                          <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                            Upgrade to Pro
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password Protection */}
                <div className={cn(
                  'p-4 rounded-xl border transition-all',
                  passwordEnabled
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-700 bg-slate-800/50',
                  !canAccessProTypes && 'opacity-60'
                )}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">Password Protection</h4>
                        {!canAccessProTypes && (
                          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Pro</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-3">Require a password to view content</p>
                      {canAccessProTypes ? (
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={passwordEnabled}
                              onChange={(e) => {
                                setPasswordEnabled(e.target.checked);
                                if (!e.target.checked) setPassword('');
                              }}
                              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-300">Enable password</span>
                          </label>
                          {passwordEnabled && (
                            <Input
                              type="password"
                              placeholder="Enter password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="bg-slate-900 border-slate-600"
                            />
                          )}
                        </div>
                      ) : (
                        <Link href="/plans">
                          <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                            Upgrade to Pro
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scheduled Activation */}
                <div className={cn(
                  'p-4 rounded-xl border transition-all',
                  scheduledEnabled
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-700 bg-slate-800/50',
                  !canAccessProTypes && 'opacity-60'
                )}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">Scheduled Activation</h4>
                        {!canAccessProTypes && (
                          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Pro</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-3">Set when the QR code becomes active</p>
                      {canAccessProTypes ? (
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={scheduledEnabled}
                              onChange={(e) => {
                                setScheduledEnabled(e.target.checked);
                                if (!e.target.checked) {
                                  setActiveFrom('');
                                  setActiveUntil('');
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-300">Enable scheduling</span>
                          </label>
                          {scheduledEnabled && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs text-slate-400">From</Label>
                                <Input
                                  type="datetime-local"
                                  value={activeFrom}
                                  onChange={(e) => setActiveFrom(e.target.value)}
                                  className="bg-slate-900 border-slate-600 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-slate-400">Until</Label>
                                <Input
                                  type="datetime-local"
                                  value={activeUntil}
                                  onChange={(e) => setActiveUntil(e.target.value)}
                                  className="bg-slate-900 border-slate-600 text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link href="/plans">
                          <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                            Upgrade to Pro
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary of enabled options */}
              {(expiresAt || (passwordEnabled && password) || (scheduledEnabled && (activeFrom || activeUntil))) && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <h4 className="font-medium text-white mb-2">Enabled Options</h4>
                  <div className="flex flex-wrap gap-2">
                    {expiresAt && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Expires {new Date(expiresAt).toLocaleDateString()}
                      </span>
                    )}
                    {passwordEnabled && password && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Password Protected
                      </span>
                    )}
                    {scheduledEnabled && (activeFrom || activeUntil) && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Upgrade CTA for free users */}
              {!canAccessProTypes && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">Unlock all options</p>
                      <p className="text-sm text-slate-400">Upgrade to Pro to access expiration dates, passwords, scheduling, and more</p>
                    </div>
                    <Link href={userTier === null ? "/signup" : "/plans"}>
                      <Button className="shrink-0 glow-hover">
                        {userTier === null ? "Sign Up" : "Upgrade"}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue to Download
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          )}

          {/* Step 5: Download */}
          {step === 'download' && (
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
                      onClick={handleDownload}
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
                      onClick={handleDownloadSVG}
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
                  onClick={handleClose}
                  variant="outline"
                  className="border-slate-600"
                >
                  Done
                </Button>
                <Button
                  onClick={resetWizard}
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
          )}
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowExitConfirm(false)} />
          <div className="relative bg-slate-800 rounded-xl p-6 max-w-sm mx-4 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Discard QR code?</h3>
            <p className="text-sm text-slate-400 mb-6">
              You have unsaved progress. Are you sure you want to exit? Your QR code will be lost.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowExitConfirm(false)}
              >
                Keep editing
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleConfirmExit}
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Landing Page Preview Modal */}
      {showPreview && content && selectedType && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowPreview(false)} />
          <div className="relative flex flex-col items-center max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Phone Frame */}
            <div className="relative w-[320px] bg-slate-900 rounded-[40px] p-3 border-4 border-slate-700 shadow-2xl">
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-xl z-10" />

              {/* Phone screen */}
              <div className="relative bg-white rounded-[28px] overflow-hidden" style={{ height: '580px' }}>
                <div className="h-full overflow-y-auto">
                  {/* Menu Preview */}
                  {selectedType === 'menu' && (
                    <div className="min-h-full" style={{ backgroundColor: (content as any).accentColor || '#14b8a6' }}>
                      <div className="p-6 text-center text-white">
                        {(content as any).logoUrl && (
                          <img src={(content as any).logoUrl} alt="Logo" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover bg-white/10" />
                        )}
                        <h1 className="text-2xl font-bold">{(content as any).restaurantName || 'Restaurant Name'}</h1>
                      </div>
                      <div className="bg-white rounded-t-3xl p-6 min-h-[400px]">
                        {((content as any).categories || []).map((cat: any, i: number) => (
                          <div key={i} className="mb-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b">{cat.name || 'Category'}</h2>
                            {(cat.items || []).map((item: any, j: number) => (
                              <div key={j} className="flex justify-between py-2">
                                <span className="text-slate-700">{item.name || 'Item'}</span>
                                <span className="font-semibold text-slate-900">{item.price || '$0'}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Card Preview */}
                  {selectedType === 'business' && (
                    <div className="min-h-full bg-slate-50">
                      <div className="p-6 text-center" style={{ backgroundColor: (content as any).accentColor || '#14b8a6' }}>
                        {(content as any).photoUrl ? (
                          <img src={(content as any).photoUrl} alt="Photo" className="w-24 h-24 mx-auto mb-4 rounded-full object-cover border-4 border-white" />
                        ) : (
                          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-3xl text-white font-bold">
                              {((content as any).name || 'N')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <h1 className="text-2xl font-bold text-white">{(content as any).name || 'Your Name'}</h1>
                        {(content as any).title && <p className="text-white/80">{(content as any).title}</p>}
                        {(content as any).company && <p className="text-white/60 text-sm">{(content as any).company}</p>}
                      </div>
                      <div className="p-6 space-y-4">
                        {(content as any).bio && (
                          <p className="text-slate-600 text-center">{(content as any).bio}</p>
                        )}
                        {(content as any).email && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                              </svg>
                            </div>
                            <span className="text-slate-700">{(content as any).email}</span>
                          </div>
                        )}
                        {(content as any).phone && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
                              </svg>
                            </div>
                            <span className="text-slate-700">{(content as any).phone}</span>
                          </div>
                        )}
                        {(content as any).website && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                              </svg>
                            </div>
                            <span className="text-slate-700 truncate">{(content as any).website}</span>
                          </div>
                        )}
                        <button className="w-full py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: (content as any).accentColor || '#14b8a6' }}>
                          Save Contact
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Links Preview */}
                  {selectedType === 'links' && (
                    <div className="min-h-full p-6" style={{ backgroundColor: (content as any).accentColor || '#14b8a6' }}>
                      <div className="text-center mb-8">
                        {(content as any).avatarUrl ? (
                          <img src={(content as any).avatarUrl} alt="Avatar" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover border-4 border-white/20" />
                        ) : (
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-2xl text-white font-bold">
                              {((content as any).title || 'L')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <h1 className="text-xl font-bold text-white">{(content as any).title || 'My Links'}</h1>
                        {(content as any).description && (
                          <p className="text-white/80 text-sm mt-1">{(content as any).description}</p>
                        )}
                      </div>
                      <div className="space-y-3">
                        {((content as any).links || []).map((link: any, i: number) => (
                          <button key={i} className="w-full py-3 px-4 bg-white/90 hover:bg-white rounded-xl text-slate-800 font-medium text-center transition-colors">
                            {link.title || 'Link'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coupon Preview */}
                  {selectedType === 'coupon' && (
                    <div className="min-h-full bg-slate-100 p-4">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                        <div className="p-6 text-center" style={{ backgroundColor: (content as any).accentColor || '#14b8a6' }}>
                          {(content as any).logoUrl && (
                            <img src={(content as any).logoUrl} alt="Logo" className="w-16 h-16 mx-auto mb-3 rounded-full object-cover bg-white" />
                          )}
                          <p className="text-white/80 font-medium">{(content as any).businessName || 'Business Name'}</p>
                        </div>
                        <div className="p-6 text-center border-b-2 border-dashed border-slate-200">
                          <h1 className="text-4xl font-bold text-slate-800 mb-2">{(content as any).headline || '20% OFF'}</h1>
                          <p className="text-slate-600">{(content as any).description || 'Your entire purchase'}</p>
                        </div>
                        {(content as any).code && (
                          <div className="p-4 bg-slate-50">
                            <p className="text-xs text-slate-500 text-center mb-2">Promo Code</p>
                            <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg py-3 px-4 text-center">
                              <span className="font-mono text-xl font-bold text-slate-800">{(content as any).code}</span>
                            </div>
                          </div>
                        )}
                        {(content as any).validUntil && (
                          <p className="text-xs text-slate-500 text-center py-2">
                            Valid until {new Date((content as any).validUntil).toLocaleDateString()}
                          </p>
                        )}
                        {(content as any).terms && (
                          <p className="text-xs text-slate-400 text-center p-4 border-t border-slate-100">
                            {(content as any).terms}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Social Preview */}
                  {selectedType === 'social' && (
                    <div className="min-h-full p-6" style={{ backgroundColor: (content as any).accentColor || '#14b8a6' }}>
                      <div className="text-center mb-8">
                        {(content as any).avatarUrl ? (
                          <img src={(content as any).avatarUrl} alt="Avatar" className="w-24 h-24 mx-auto mb-4 rounded-full object-cover border-4 border-white/20" />
                        ) : (
                          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-3xl text-white font-bold">
                              {((content as any).name || 'S')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <h1 className="text-2xl font-bold text-white">{(content as any).name || 'Your Name'}</h1>
                        {(content as any).bio && (
                          <p className="text-white/80 text-sm mt-2 max-w-xs mx-auto">{(content as any).bio}</p>
                        )}
                      </div>
                      <div className="space-y-3">
                        {((content as any).links || []).map((link: any, i: number) => (
                          <button key={i} className="w-full py-3 px-4 bg-white/90 hover:bg-white rounded-xl text-slate-800 font-medium flex items-center justify-center gap-2 transition-colors">
                            <span className="capitalize">{link.platform}</span>
                            <span className="text-slate-500">@{link.handle || 'username'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Label */}
            <p className="mt-4 text-sm text-slate-400">
              This is how your landing page will appear when scanned
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
