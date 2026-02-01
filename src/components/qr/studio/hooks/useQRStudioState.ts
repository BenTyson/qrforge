'use client';

import { useCallback, useRef } from 'react';
import { useNavigation } from './useNavigation';
import { useContentState } from './useContentState';
import { useStyleState, DEFAULT_STYLE } from './useStyleState';
import { useProOptions } from './useProOptions';
import type { ScheduleMode } from './useProOptions';
import { useSaveQR } from './useSaveQR';
import type { QRContent, QRContentType, QRStyleOptions } from '@/lib/qr/types';
import type { Template } from '@/lib/templates/types';
import type { WizardStep } from '../../wizard';

// Re-export DEFAULT_STYLE for backward compatibility
export { DEFAULT_STYLE };

export interface QRStudioState {
  // Mode
  mode: 'create' | 'edit';
  qrCodeId: string | null;

  // Template
  templateId: string | null;
  templateName: string;

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
  scheduleTimezone: string;
  scheduleMode: ScheduleMode;
  recurringStartTime: string;
  recurringEndTime: string;
  recurringDaysOfWeek: number[];
  landingPageEnabled: boolean;
  landingPageTitle: string;
  landingPageDescription: string;
  landingPageButtonText: string;

  // A/B Testing
  abTestEnabled: boolean;
  abVariantBUrl: string;
  abSplitPercentage: number;

  // User context
  userId: string | null;
  userTier: 'free' | 'pro' | 'business' | null;
  userTierLoading: boolean;

  // Persistence
  isSaving: boolean;
  savedQRId: string | null;
  shortCode: string | null;
  saveError: string | null;
  saveBlockedReason: string | null;
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

  // Template
  loadTemplate: (template: Template) => void;
  clearTemplate: () => void;

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
  setScheduleTimezone: (tz: string) => void;
  setScheduleMode: (mode: ScheduleMode) => void;
  setRecurringStartTime: (time: string) => void;
  setRecurringEndTime: (time: string) => void;
  setRecurringDaysOfWeek: (days: number[]) => void;
  setLandingPageEnabled: (enabled: boolean) => void;
  setLandingPageTitle: (title: string) => void;
  setLandingPageDescription: (description: string) => void;
  setLandingPageButtonText: (text: string) => void;

  // A/B Testing
  setAbTestEnabled: (enabled: boolean) => void;
  setAbVariantBUrl: (url: string) => void;
  setAbSplitPercentage: (percent: number) => void;

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
  // Style hook (no dependencies)
  const [styleState, styleActions] = useStyleState();

  // Content hook (depends on style for template loading)
  const [contentState, contentActions] = useContentState({
    mode,
    onStyleChange: styleActions.setStyle,
    onTypeSelected: () => {
      // Will set step to 'content' via navigation; handled through goForward
      // We use a ref-based approach to avoid circular dependencies
      navSetStepRef.current?.('content');
    },
  });

  // Navigation hook (depends on content for canGoForward)
  const canGoForwardCheck = useCallback((): boolean => {
    const step = currentStepRef.current;
    switch (step) {
      case 'type':
        return !!contentState.selectedType;
      case 'content':
        return contentActions.isContentValid();
      case 'style':
      case 'options':
        return true;
      case 'download':
        return false;
      default:
        return false;
    }
  }, [contentState.selectedType, contentActions]);

  const [navState, navActions] = useNavigation({ mode, canGoForwardCheck });

  // Store navigation refs to break circular dependency — syncing refs with
  // hook return values is intentional to avoid circular deps between hooks.
  const navSetStepRef = useRef<(step: WizardStep) => void>(navActions.setStep);
  navSetStepRef.current = navActions.setStep;
  const currentStepRef = useRef<WizardStep>(navState.currentStep);
  // eslint-disable-next-line react-hooks/immutability
  currentStepRef.current = navState.currentStep;

  // Pro options hook (no dependencies)
  const [proState, proActions] = useProOptions();

  // Save hook (depends on all other hooks via getters)
  const [saveState, saveActions] = useSaveQR({
    mode,
    qrCodeId,
    getContent: () => contentState.content,
    getSelectedType: () => contentState.selectedType,
    getQrName: () => contentState.qrName,
    getStyle: () => styleState.style,
    getExpiresAt: () => proState.expiresAt,
    getPasswordEnabled: () => proState.passwordEnabled,
    getPassword: () => proState.password,
    getScheduledEnabled: () => proState.scheduledEnabled,
    getActiveFrom: () => proState.activeFrom,
    getActiveUntil: () => proState.activeUntil,
    getScheduleTimezone: () => proState.scheduleTimezone,
    getScheduleMode: () => proState.scheduleMode,
    getRecurringStartTime: () => proState.recurringStartTime,
    getRecurringEndTime: () => proState.recurringEndTime,
    getRecurringDaysOfWeek: () => proState.recurringDaysOfWeek,
    getAbTestEnabled: () => proState.abTestEnabled,
    getAbVariantBUrl: () => proState.abVariantBUrl,
    getAbSplitPercentage: () => proState.abSplitPercentage,
    onLoadContent: (type, content, name) => {
      contentActions.selectCategory(null); // Will be set by type category lookup
      contentActions.setContent(content);
      contentActions.setQrName(name);
      // selectType sets selectedType but also resets content to null in create mode
      // Since we're in edit mode (loading), we directly set the type and then restore content
      // We need to use selectType but it resets content, so set content after
      // Actually, looking at useContentState.selectType: it only calls onTypeSelected in create mode
      // But it always resets content to null. So we'll call it first, then set content.
      contentActions.selectType(type);
      contentActions.setContent(content);
      contentActions.setQrName(name);
    },
    onLoadStyle: styleActions.setStyle,
    onLoadProOptions: (opts) => {
      if (opts.expiresAt !== undefined) proActions.setExpiresAt(opts.expiresAt);
      if (opts.passwordEnabled !== undefined) proActions.setPasswordEnabled(opts.passwordEnabled);
      if (opts.scheduledEnabled !== undefined) proActions.setScheduledEnabled(opts.scheduledEnabled);
      if (opts.activeFrom !== undefined) proActions.setActiveFrom(opts.activeFrom);
      if (opts.activeUntil !== undefined) proActions.setActiveUntil(opts.activeUntil);
      if (opts.scheduleTimezone !== undefined) proActions.setScheduleTimezone(opts.scheduleTimezone);
      if (opts.scheduleMode !== undefined) proActions.setScheduleMode(opts.scheduleMode);
      if (opts.recurringStartTime !== undefined) proActions.setRecurringStartTime(opts.recurringStartTime);
      if (opts.recurringEndTime !== undefined) proActions.setRecurringEndTime(opts.recurringEndTime);
      if (opts.recurringDaysOfWeek !== undefined) proActions.setRecurringDaysOfWeek(opts.recurringDaysOfWeek);
      if (opts.abTestEnabled !== undefined) proActions.setAbTestEnabled(opts.abTestEnabled);
      if (opts.abVariantBUrl !== undefined) proActions.setAbVariantBUrl(opts.abVariantBUrl);
      if (opts.abSplitPercentage !== undefined) proActions.setAbSplitPercentage(opts.abSplitPercentage);
    },
  });

  // Reset all state
  const reset = useCallback(() => {
    navActions.setStep(mode === 'edit' ? 'content' : 'type');
    contentActions.resetContent();
    styleActions.resetStyle();
    proActions.resetProOptions();
    saveActions.resetSave();
  }, [mode, navActions, contentActions, styleActions, proActions, saveActions]);

  // Compose state
  const state: QRStudioState = {
    mode,
    qrCodeId: saveState.savedQRId,
    templateId: contentState.templateId,
    templateName: contentState.templateName,
    currentStep: navState.currentStep,
    selectedCategory: contentState.selectedCategory,
    selectedType: contentState.selectedType,
    content: contentState.content,
    qrName: contentState.qrName,
    style: styleState.style,
    ...proState,
    userId: saveState.userId,
    userTier: saveState.userTier,
    userTierLoading: saveState.userTierLoading,
    isSaving: saveState.isSaving,
    savedQRId: saveState.savedQRId,
    shortCode: saveState.shortCode,
    saveError: saveState.saveError,
    saveBlockedReason: saveState.saveBlockedReason,
    hasDownloaded: saveState.hasDownloaded,
    isDownloading: saveState.isDownloading,
  };

  // Compose actions
  const actions: QRStudioActions = {
    setStep: navActions.setStep,
    goBack: navActions.goBack,
    goForward: navActions.goForward,
    canGoForward: navActions.canGoForward,
    selectCategory: contentActions.selectCategory,
    selectType: contentActions.selectType,
    loadTemplate: contentActions.loadTemplate,
    clearTemplate: contentActions.clearTemplate,
    setContent: contentActions.setContent,
    setQrName: contentActions.setQrName,
    isContentValid: contentActions.isContentValid,
    setStyle: styleActions.setStyle,
    updateStyle: styleActions.updateStyle,
    ...proActions,
    saveQRCode: saveActions.saveQRCode,
    loadQRCode: saveActions.loadQRCode,
    reset,
    setHasDownloaded: saveActions.setHasDownloaded,
    setIsDownloading: saveActions.setIsDownloading,
    getFilename: contentActions.getFilename,
    clearSaveError: saveActions.clearSaveError,
  };

  return [state, actions];
}
