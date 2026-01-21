'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { contentToString } from '@/lib/qr/generator';
import type {
  QRContent,
  QRContentType,
  QRStyleOptions,
  URLContent,
  TextContent,
  WiFiContent,
  VCardContent,
  EmailContent,
  PhoneContent,
  SMSContent,
  WhatsAppContent,
  FacebookContent,
  InstagramContent,
  AppsContent,
  PDFContent,
  ImagesContent,
  VideoContent,
  MP3Content,
  MenuContent,
  BusinessContent,
  LinksContent,
  CouponContent,
  SocialContent,
} from '@/lib/qr/types';
import { DYNAMIC_REQUIRED_TYPES } from '@/lib/qr/types';
import type { WizardStep } from '../../wizard';

export const DEFAULT_STYLE: QRStyleOptions = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 4,
  width: 256,
};

export interface QRStudioState {
  // Mode
  mode: 'create' | 'edit';
  qrCodeId: string | null;

  // Current step
  currentStep: WizardStep;

  // Type selection
  selectedCategory: string | null;
  selectedType: QRContentType | null;

  // Content
  content: QRContent | null;
  qrName: string;

  // Style
  style: QRStyleOptions;

  // Pro Options
  expiresAt: string;
  passwordEnabled: boolean;
  password: string;
  scheduledEnabled: boolean;
  activeFrom: string;
  activeUntil: string;
  landingPageEnabled: boolean;
  landingPageTitle: string;
  landingPageDescription: string;
  landingPageButtonText: string;

  // User context
  userId: string | null;
  userTier: 'free' | 'pro' | 'business' | null;

  // Persistence
  isSaving: boolean;
  savedQRId: string | null;
  shortCode: string | null;
  saveError: string | null;
  hasDownloaded: boolean;
  isDownloading: boolean;
}

export interface QRStudioActions {
  // Navigation
  setStep: (step: WizardStep) => void;
  goBack: () => void;
  goForward: () => void;
  canGoForward: () => boolean;

  // Type selection
  selectCategory: (category: string | null) => void;
  selectType: (type: QRContentType) => void;

  // Content
  setContent: (content: QRContent | null) => void;
  setQrName: (name: string) => void;
  isContentValid: () => boolean;

  // Style
  setStyle: (style: QRStyleOptions) => void;
  updateStyle: (updates: Partial<QRStyleOptions>) => void;

  // Pro Options
  setExpiresAt: (date: string) => void;
  setPasswordEnabled: (enabled: boolean) => void;
  setPassword: (password: string) => void;
  setScheduledEnabled: (enabled: boolean) => void;
  setActiveFrom: (date: string) => void;
  setActiveUntil: (date: string) => void;
  setLandingPageEnabled: (enabled: boolean) => void;
  setLandingPageTitle: (title: string) => void;
  setLandingPageDescription: (description: string) => void;
  setLandingPageButtonText: (text: string) => void;

  // Persistence
  saveQRCode: () => Promise<{ id: string; shortCode: string } | null>;
  loadQRCode: (id: string) => Promise<boolean>;
  reset: () => void;

  // Download
  setHasDownloaded: (downloaded: boolean) => void;
  setIsDownloading: (downloading: boolean) => void;
  getFilename: () => string;

  // Error handling
  clearSaveError: () => void;
}

interface UseQRStudioStateProps {
  mode: 'create' | 'edit';
  qrCodeId?: string;
}

export function useQRStudioState({ mode, qrCodeId }: UseQRStudioStateProps): [QRStudioState, QRStudioActions] {
  // Core state
  const [currentStep, setCurrentStep] = useState<WizardStep>(mode === 'edit' ? 'content' : 'type');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<QRContentType | null>(null);
  const [content, setContent] = useState<QRContent | null>(null);
  const [qrName, setQrName] = useState('');
  const [style, setStyle] = useState<QRStyleOptions>(DEFAULT_STYLE);

  // Pro options
  const [expiresAt, setExpiresAt] = useState('');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [scheduledEnabled, setScheduledEnabled] = useState(false);
  const [activeFrom, setActiveFrom] = useState('');
  const [activeUntil, setActiveUntil] = useState('');
  const [landingPageEnabled, setLandingPageEnabled] = useState(false);
  const [landingPageTitle, setLandingPageTitle] = useState('');
  const [landingPageDescription, setLandingPageDescription] = useState('');
  const [landingPageButtonText, setLandingPageButtonText] = useState('Continue');

  // User context
  const [userId, setUserId] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'business' | null>(null);

  // Persistence
  const [isSaving, setIsSaving] = useState(false);
  const [savedQRId, setSavedQRId] = useState<string | null>(qrCodeId || null);
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business';
        setUserTier(tier);
      } else {
        setUserId(null);
        setUserTier('free'); // Default to free instead of null for unauthenticated
      }
    };

    fetchUser();
  }, []);

  // Generate short code
  const generateShortCode = useCallback((): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  // Check if type requires dynamic QR
  // Pro and Business users always get dynamic QR codes (for analytics tracking)
  const requiresDynamicQR = useCallback((type: QRContentType): boolean => {
    if (userTier === 'pro' || userTier === 'business') {
      return true;
    }
    return DYNAMIC_REQUIRED_TYPES.includes(type);
  }, [userTier]);

  // Validate content
  const isContentValid = useCallback((): boolean => {
    if (!content || !selectedType) return false;

    switch (selectedType) {
      case 'url':
        return !!(content as URLContent).url?.trim();
      case 'text':
        return !!(content as TextContent).text?.trim();
      case 'wifi':
        return !!(content as WiFiContent).ssid?.trim();
      case 'vcard':
        return !!((content as VCardContent).firstName?.trim() || (content as VCardContent).lastName?.trim());
      case 'email':
        return !!(content as EmailContent).email?.trim();
      case 'phone':
        return !!(content as PhoneContent).phone?.trim();
      case 'sms':
        return !!(content as SMSContent).phone?.trim();
      case 'whatsapp':
        return !!(content as WhatsAppContent).phone?.trim();
      case 'facebook':
        return !!(content as FacebookContent).profileUrl?.trim();
      case 'instagram':
        return !!(content as InstagramContent).username?.trim();
      case 'apps': {
        const appsContent = content as AppsContent;
        return !!(appsContent.appStoreUrl?.trim() || appsContent.playStoreUrl?.trim() || appsContent.fallbackUrl?.trim());
      }
      case 'pdf':
        return !!(content as PDFContent).fileUrl?.trim() || !!(content as PDFContent).fileName?.trim();
      case 'images':
        return (content as ImagesContent).images?.length > 0;
      case 'video':
        return !!(content as VideoContent).videoUrl?.trim() || !!(content as VideoContent).embedUrl?.trim();
      case 'mp3':
        return !!(content as MP3Content).audioUrl?.trim() || !!(content as MP3Content).embedUrl?.trim();
      case 'menu':
        return !!(content as MenuContent).restaurantName?.trim();
      case 'business':
        return !!(content as BusinessContent).name?.trim();
      case 'links':
        return !!(content as LinksContent).title?.trim();
      case 'coupon':
        return !!(content as CouponContent).businessName?.trim() && !!(content as CouponContent).headline?.trim();
      case 'social':
        return !!(content as SocialContent).name?.trim();
      default:
        return false;
    }
  }, [content, selectedType]);

  // Navigation
  const canGoForward = useCallback((): boolean => {
    switch (currentStep) {
      case 'type':
        return !!selectedType;
      case 'content':
        return isContentValid();
      case 'style':
        return true;
      case 'options':
        return true;
      case 'download':
        return false;
      default:
        return false;
    }
  }, [currentStep, selectedType, isContentValid]);

  const goForward = useCallback(() => {
    if (!canGoForward()) return;

    const stepOrder: WizardStep[] = mode === 'edit'
      ? ['content', 'style', 'options', 'download']
      : ['type', 'content', 'style', 'options', 'download'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep, canGoForward, mode]);

  const goBack = useCallback(() => {
    const stepOrder: WizardStep[] = mode === 'edit'
      ? ['content', 'style', 'options', 'download']
      : ['type', 'content', 'style', 'options', 'download'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep, mode]);

  const setStep = useCallback((step: WizardStep) => {
    // In edit mode, allow jumping to any step (except type)
    if (mode === 'edit') {
      if (step !== 'type') {
        setCurrentStep(step);
      }
      return;
    }
    // In create mode, only allow going back or to the next valid step
    setCurrentStep(step);
  }, [mode]);

  // Type selection
  const selectType = useCallback((type: QRContentType) => {
    setSelectedType(type);
    setContent(null); // Reset content when type changes
    if (mode === 'create') {
      setCurrentStep('content');
    }
  }, [mode]);

  // Style updates
  const updateStyle = useCallback((updates: Partial<QRStyleOptions>) => {
    setStyle(prev => ({ ...prev, ...updates }));
  }, []);

  // Get filename for download
  const getFilename = useCallback(() => {
    if (qrName.trim()) {
      return `qrwolf-${qrName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    }
    return `qrwolf-${selectedType || 'code'}`;
  }, [qrName, selectedType]);

  // Save QR code
  const saveQRCode = useCallback(async (): Promise<{ id: string; shortCode: string } | null> => {
    if (!content || !selectedType || !userId) return null;

    setIsSaving(true);
    setSaveError(null);

    try {
      const supabase = createClient();
      const newShortCode = shortCode || generateShortCode();
      const isDynamic = requiresDynamicQR(selectedType);

      let destinationUrl = null;
      if (!isDynamic) {
        destinationUrl = contentToString(content);
      }

      const insertData: Record<string, unknown> = {
        user_id: userId,
        name: qrName.trim() || `${selectedType} QR Code`,
        type: isDynamic ? 'dynamic' : 'static',
        content_type: selectedType,
        content: content as unknown as Record<string, unknown>,
        destination_url: destinationUrl,
        short_code: newShortCode,
        // Save entire style object to preserve all properties (gradient, patterns, frame, etc.)
        style: style as unknown as Record<string, unknown>,
      };

      // Add Pro options
      if (expiresAt) {
        insertData.expires_at = new Date(expiresAt).toISOString();
      }
      if (passwordEnabled && password) {
        // Hash the password before saving
        const hashResponse = await fetch('/api/qr/hash-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        if (!hashResponse.ok) {
          throw new Error('Failed to hash password');
        }
        const hashData = await hashResponse.json();
        if (hashData.hash) {
          insertData.password_hash = hashData.hash;
        }
      } else if (!passwordEnabled) {
        // Clear password if protection is disabled
        insertData.password_hash = null;
      }
      if (scheduledEnabled) {
        if (activeFrom) {
          insertData.active_from = new Date(activeFrom).toISOString();
        }
        if (activeUntil) {
          insertData.active_until = new Date(activeUntil).toISOString();
        }
      }

      // Update or insert based on mode
      if (mode === 'edit' && savedQRId) {
        const { error } = await supabase
          .from('qr_codes')
          .update(insertData)
          .eq('id', savedQRId);

        if (error) throw error;
        return { id: savedQRId, shortCode: newShortCode };
      } else {
        const { data, error } = await supabase
          .from('qr_codes')
          .insert(insertData)
          .select('id')
          .single();

        if (error) throw error;

        setSavedQRId(data.id);
        setShortCode(newShortCode);
        return { id: data.id, shortCode: newShortCode };
      }
    } catch (err) {
      console.error('Failed to save QR code:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save QR code');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [content, selectedType, userId, qrName, style, mode, savedQRId, shortCode, generateShortCode, requiresDynamicQR, expiresAt, passwordEnabled, password, scheduledEnabled, activeFrom, activeUntil]);

  // Load existing QR code for edit mode
  const loadQRCode = useCallback(async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Failed to load QR code:', error);
        return false;
      }

      // Populate state from loaded data
      setSelectedType(data.content_type as QRContentType);
      setContent(data.content as QRContent);
      setQrName(data.name || '');
      setShortCode(data.short_code);
      setSavedQRId(data.id);

      if (data.style) {
        setStyle({
          ...DEFAULT_STYLE,
          ...data.style,
        });
      }

      // Pro options
      if (data.expires_at) {
        setExpiresAt(new Date(data.expires_at).toISOString().slice(0, 16));
      }
      if (data.password_hash) {
        // Just enable password protection indicator, don't populate the password field
        // The hash should never be shown to the user or saved back
        setPasswordEnabled(true);
        // Leave password field empty - user can enter a new one if they want to change it
        setPassword('');
      }
      if (data.active_from || data.active_until) {
        setScheduledEnabled(true);
        if (data.active_from) {
          setActiveFrom(new Date(data.active_from).toISOString().slice(0, 16));
        }
        if (data.active_until) {
          setActiveUntil(new Date(data.active_until).toISOString().slice(0, 16));
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to load QR code:', err);
      return false;
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setCurrentStep(mode === 'edit' ? 'content' : 'type');
    setSelectedCategory(null);
    setSelectedType(null);
    setContent(null);
    setQrName('');
    setStyle(DEFAULT_STYLE);
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
    setSavedQRId(null);
    setShortCode(null);
    setSaveError(null);
    setHasDownloaded(false);
    setIsDownloading(false);
  }, [mode]);

  const state: QRStudioState = {
    mode,
    qrCodeId: savedQRId,
    currentStep,
    selectedCategory,
    selectedType,
    content,
    qrName,
    style,
    expiresAt,
    passwordEnabled,
    password,
    scheduledEnabled,
    activeFrom,
    activeUntil,
    landingPageEnabled,
    landingPageTitle,
    landingPageDescription,
    landingPageButtonText,
    userId,
    userTier,
    isSaving,
    savedQRId,
    shortCode,
    saveError,
    hasDownloaded,
    isDownloading,
  };

  const actions: QRStudioActions = {
    setStep,
    goBack,
    goForward,
    canGoForward,
    selectCategory: setSelectedCategory,
    selectType,
    setContent,
    setQrName,
    isContentValid,
    setStyle,
    updateStyle,
    setExpiresAt,
    setPasswordEnabled,
    setPassword,
    setScheduledEnabled,
    setActiveFrom,
    setActiveUntil,
    setLandingPageEnabled,
    setLandingPageTitle,
    setLandingPageDescription,
    setLandingPageButtonText,
    saveQRCode,
    loadQRCode,
    reset,
    setHasDownloaded,
    setIsDownloading,
    getFilename,
    clearSaveError: () => setSaveError(null),
  };

  return [state, actions];
}
