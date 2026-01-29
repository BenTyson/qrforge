'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { normalizeContentUrls } from '@/lib/qr/generator';
import { getDestinationUrl } from '@/lib/qr/destination-url';
import type { QRContent, QRContentType, QRStyleOptions } from '@/lib/qr/types';
import { PLANS } from '@/lib/stripe/plans';
import { DEFAULT_STYLE } from './useStyleState';

export interface SaveQRState {
  userId: string | null;
  userTier: 'free' | 'pro' | 'business' | null;
  userTierLoading: boolean;
  isSaving: boolean;
  savedQRId: string | null;
  shortCode: string | null;
  saveError: string | null;
  saveBlockedReason: string | null;
  hasDownloaded: boolean;
  isDownloading: boolean;
}

export interface SaveQRActions {
  saveQRCode: () => Promise<{ id: string; shortCode: string } | null>;
  loadQRCode: (id: string) => Promise<boolean>;
  setHasDownloaded: (downloaded: boolean) => void;
  setIsDownloading: (downloading: boolean) => void;
  clearSaveError: () => void;
  resetSave: () => void;
}

interface UseSaveQRProps {
  mode: 'create' | 'edit';
  qrCodeId?: string;
  /** Getters for current state from other hooks */
  getContent: () => QRContent | null;
  getSelectedType: () => QRContentType | null;
  getQrName: () => string;
  getStyle: () => QRStyleOptions;
  getExpiresAt: () => string;
  getPasswordEnabled: () => boolean;
  getPassword: () => string;
  getScheduledEnabled: () => boolean;
  getActiveFrom: () => string;
  getActiveUntil: () => string;
  getAbTestEnabled: () => boolean;
  getAbVariantBUrl: () => string;
  getAbSplitPercentage: () => number;
  /** Setters to populate state when loading an existing QR code */
  onLoadContent: (type: QRContentType, content: QRContent, name: string) => void;
  onLoadStyle: (style: QRStyleOptions) => void;
  onLoadProOptions: (opts: {
    expiresAt?: string;
    passwordEnabled?: boolean;
    scheduledEnabled?: boolean;
    activeFrom?: string;
    activeUntil?: string;
    abTestEnabled?: boolean;
    abVariantBUrl?: string;
    abSplitPercentage?: number;
  }) => void;
}

// Generate a random short code
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function useSaveQR({
  mode,
  qrCodeId,
  getContent,
  getSelectedType,
  getQrName,
  getStyle,
  getExpiresAt,
  getPasswordEnabled,
  getPassword,
  getScheduledEnabled,
  getActiveFrom,
  getActiveUntil,
  getAbTestEnabled,
  getAbVariantBUrl,
  getAbSplitPercentage,
  onLoadContent,
  onLoadStyle,
  onLoadProOptions,
}: UseSaveQRProps): [SaveQRState, SaveQRActions] {
  // User context
  const [userId, setUserId] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'business' | null>(null);
  const [userTierLoading, setUserTierLoading] = useState(true);

  // Persistence
  const [isSaving, setIsSaving] = useState(false);
  const [savedQRId, setSavedQRId] = useState<string | null>(qrCodeId || null);
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveBlockedReason, setSaveBlockedReason] = useState<string | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      setUserTierLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

          const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business';
          setUserTier(tier);
        } else {
          setUserId(null);
          setUserTier(null);
        }
      } finally {
        setUserTierLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Save QR code
  const saveQRCode = useCallback(async (): Promise<{ id: string; shortCode: string } | null> => {
    setSaveBlockedReason(null);

    const content = getContent();
    const selectedType = getSelectedType();
    const qrName = getQrName();
    const style = getStyle();
    const expiresAt = getExpiresAt();
    const passwordEnabled = getPasswordEnabled();
    const password = getPassword();
    const scheduledEnabled = getScheduledEnabled();
    const activeFrom = getActiveFrom();
    const activeUntil = getActiveUntil();
    const abTestEnabled = getAbTestEnabled();
    const abVariantBUrl = getAbVariantBUrl();
    const abSplitPercentage = getAbSplitPercentage();

    if (!userId) {
      setSaveBlockedReason('Please sign in to save your QR code');
      return null;
    }
    if (userTierLoading) {
      setSaveBlockedReason('Loading your account...');
      return null;
    }
    if (!content) {
      setSaveBlockedReason('Please add content to your QR code');
      return null;
    }
    if (!selectedType) {
      setSaveBlockedReason('Please select a QR code type');
      return null;
    }

    // Enforce QR code creation limit (skip for edits)
    if (mode === 'create' && userTier) {
      const limit = PLANS[userTier].dynamicQRLimit;
      if (limit !== -1) {
        try {
          const supabase = createClient();
          const { count, error } = await supabase
            .from('qr_codes')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);

          if (!error && count !== null && count >= limit) {
            setSaveBlockedReason(
              userTier === 'free'
                ? `You've reached your limit of ${limit} QR codes. Upgrade to Pro for up to 50.`
                : `You've reached your limit of ${limit} QR codes. Upgrade to Business for unlimited.`
            );
            return null;
          }
        } catch {
          // If count check fails, allow the save to proceed
        }
      }
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const supabase = createClient();
      const newShortCode = shortCode || generateShortCode();

      const normalizedContent = normalizeContentUrls(content);

      const insertData: Record<string, unknown> = {
        user_id: userId,
        name: qrName.trim() || `${selectedType} QR Code`,
        type: 'dynamic',
        content_type: selectedType,
        content: normalizedContent as unknown as Record<string, unknown>,
        destination_url: null,
        short_code: newShortCode,
        style: style as unknown as Record<string, unknown>,
      };

      // Add Pro options
      if (expiresAt) {
        insertData.expires_at = new Date(expiresAt).toISOString();
      }
      if (passwordEnabled && password) {
        const hashResponse = await fetch('/api/qr/hash-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const hashData = await hashResponse.json();
        if (!hashResponse.ok) {
          throw new Error(hashData.error || 'Failed to hash password');
        }
        if (hashData.hash) {
          insertData.password_hash = hashData.hash;
        }
      } else if (!passwordEnabled) {
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

      // Update or insert
      let qrCodeId: string;
      if (mode === 'edit' && savedQRId) {
        const { error } = await supabase
          .from('qr_codes')
          .update(insertData)
          .eq('id', savedQRId);

        if (error) throw error;
        qrCodeId = savedQRId;
      } else {
        const { data, error } = await supabase
          .from('qr_codes')
          .insert(insertData)
          .select('id')
          .single();

        if (error) throw error;

        setSavedQRId(data.id);
        setShortCode(newShortCode);
        qrCodeId = data.id;
      }

      // Handle A/B testing
      try {
        if (abTestEnabled && abVariantBUrl.trim()) {
          const primaryUrl = getDestinationUrl(normalizedContent, selectedType);

          if (primaryUrl) {
            await supabase
              .from('ab_tests')
              .delete()
              .eq('qr_code_id', qrCodeId)
              .neq('status', 'completed');

            const { data: testData, error: testError } = await supabase
              .from('ab_tests')
              .insert({
                qr_code_id: qrCodeId,
                name: `A/B Test for ${qrName.trim() || selectedType}`,
                status: 'running',
                started_at: new Date().toISOString(),
                target_confidence: 0.95,
              })
              .select('id')
              .single();

            if (testError) {
              console.error('Failed to create A/B test:', testError);
            } else if (testData) {
              const variantA = {
                test_id: testData.id,
                name: 'Control',
                slug: 'a',
                destination_url: primaryUrl,
                weight: 100 - abSplitPercentage,
              };

              const variantB = {
                test_id: testData.id,
                name: 'Variant B',
                slug: 'b',
                destination_url: abVariantBUrl.trim(),
                weight: abSplitPercentage,
              };

              const { error: variantsError } = await supabase
                .from('ab_variants')
                .insert([variantA, variantB]);

              if (variantsError) {
                console.error('Failed to create A/B variants:', variantsError);
              }
            }
          }
        }
      } catch (abTestError) {
        console.error('A/B test operation failed (non-critical):', abTestError);
      }

      return { id: qrCodeId, shortCode: newShortCode };
    } catch (err) {
      console.error('Failed to save QR code:', JSON.stringify(err, null, 2), err);
      const supaErr = err as { message?: string; code?: string; details?: string; hint?: string };
      const errorMessage = err instanceof Error
        ? err.message
        : supaErr?.message || supaErr?.details || supaErr?.code || 'Failed to save QR code';
      setSaveError(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [userId, userTier, userTierLoading, mode, savedQRId, shortCode, getContent, getSelectedType, getQrName, getStyle, getExpiresAt, getPasswordEnabled, getPassword, getScheduledEnabled, getActiveFrom, getActiveUntil, getAbTestEnabled, getAbVariantBUrl, getAbSplitPercentage]);

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

      // Populate content state
      onLoadContent(
        data.content_type as QRContentType,
        data.content as QRContent,
        data.name || '',
      );

      setShortCode(data.short_code);
      setSavedQRId(data.id);

      // Populate style
      if (data.style) {
        onLoadStyle({ ...DEFAULT_STYLE, ...data.style });
      }

      // Populate pro options
      const proOpts: Parameters<typeof onLoadProOptions>[0] = {};
      if (data.expires_at) {
        proOpts.expiresAt = new Date(data.expires_at).toISOString().slice(0, 16);
      }
      if (data.password_hash) {
        proOpts.passwordEnabled = true;
      }
      if (data.active_from || data.active_until) {
        proOpts.scheduledEnabled = true;
        if (data.active_from) {
          proOpts.activeFrom = new Date(data.active_from).toISOString().slice(0, 16);
        }
        if (data.active_until) {
          proOpts.activeUntil = new Date(data.active_until).toISOString().slice(0, 16);
        }
      }
      onLoadProOptions(proOpts);

      // Load A/B test if exists
      try {
        const { data: testData } = await supabase
          .from('ab_tests')
          .select(`
            id,
            status,
            ab_variants (
              id,
              name,
              slug,
              destination_url,
              weight
            )
          `)
          .eq('qr_code_id', id)
          .in('status', ['draft', 'running', 'paused'])
          .single();

        if (testData?.ab_variants && Array.isArray(testData.ab_variants) && testData.ab_variants.length >= 2) {
          onLoadProOptions({
            abTestEnabled: testData.status === 'running',
            abVariantBUrl: testData.ab_variants.find((v: { slug: string }) => v.slug === 'b')?.destination_url || '',
            abSplitPercentage: testData.ab_variants.find((v: { slug: string }) => v.slug === 'b')?.weight || 50,
          });
        }
      } catch (abTestError) {
        console.error('Failed to load A/B test (non-critical):', abTestError);
      }

      return true;
    } catch (err) {
      console.error('Failed to load QR code:', err);
      return false;
    }
  }, [onLoadContent, onLoadStyle, onLoadProOptions]);

  const clearSaveError = useCallback(() => {
    setSaveError(null);
    setSaveBlockedReason(null);
  }, []);

  const resetSave = useCallback(() => {
    setSavedQRId(null);
    setShortCode(null);
    setSaveError(null);
    setSaveBlockedReason(null);
    setHasDownloaded(false);
    setIsDownloading(false);
  }, []);

  const state: SaveQRState = {
    userId,
    userTier,
    userTierLoading,
    isSaving,
    savedQRId,
    shortCode,
    saveError,
    saveBlockedReason,
    hasDownloaded,
    isDownloading,
  };

  const actions: SaveQRActions = {
    saveQRCode,
    loadQRCode,
    setHasDownloaded,
    setIsDownloading,
    clearSaveError,
    resetSave,
  };

  return [state, actions];
}
