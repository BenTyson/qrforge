'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQRStudioState } from './hooks/useQRStudioState';
import { QRStudioSidebar } from './QRStudioSidebar';
import { QRStudioPreview, QRStudioMiniPreview } from './QRStudioPreview';
import { QRStudioProvider } from './QRStudioContext';
import { Button } from '@/components/ui/button';
import { cn, getAppUrl } from '@/lib/utils';
import { generateQRDataURL, downloadQRPNG, generateQRSVG, downloadQRSVG } from '@/lib/qr/generator';
import { PDFOptionsModal } from '@/components/qr/PDFOptionsModal';
import { EmbedCodeModal } from '@/components/qr/EmbedCodeModal';
import type {
  QRContent,
  QRContentType,
} from '@/lib/qr/types';
import { PRO_ONLY_TYPES } from '@/lib/qr/types';
import { getTemplateById } from '@/lib/templates';
import { getPreviewComponent } from '@/lib/qr/preview-registry';
// Import step components from wizard
import {
  TypeStep,
  StyleStep,
  OptionsStep,
  WIZARD_STEPS,
} from '../wizard';
import type { WizardStep } from '../wizard';

// Import extracted step components
import { ContentStep } from './steps/ContentStep';
import { DownloadStep } from './steps/DownloadStep';

interface QRStudioProps {
  mode: 'create' | 'edit';
  qrCodeId?: string;
}

export function QRStudio({ mode, qrCodeId }: QRStudioProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, actions] = useQRStudioState({ mode, qrCodeId });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [mobilePreviewExpanded, setMobilePreviewExpanded] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfSvgContent, setPdfSvgContent] = useState<string | null>(null);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedSvgContent, setEmbedSvgContent] = useState<string | null>(null);
  const [embedDataURL, setEmbedDataURL] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(mode === 'create');
  const [templateLoaded, setTemplateLoaded] = useState(false);

  // Load template or prefill URL from query params in create mode
  useEffect(() => {
    if (mode !== 'create' || templateLoaded) return;

    const templateParam = searchParams.get('template');
    const prefillUrl = searchParams.get('prefill_url');

    if (templateParam) {
      const template = getTemplateById(templateParam);
      if (template) {
        actions.loadTemplate(template);
      }
    } else if (prefillUrl) {
      actions.selectCategory('basic');
      actions.selectType('url');
      // selectType resets content to null, but React batches state updates
      // so the last setContent call wins within the same batch
      actions.setContent({ type: 'url', url: prefillUrl });
    }
    setTemplateLoaded(true);
  }, [mode, searchParams, templateLoaded, actions]);

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

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.currentStep]);

  // Check if step is complete (user has passed through it)
  const isStepComplete = useCallback((step: WizardStep): boolean => {
    const stepOrder: WizardStep[] = mode === 'edit'
      ? ['content', 'style', 'options', 'download']
      : ['type', 'content', 'style', 'options', 'download'];

    const currentIndex = stepOrder.indexOf(state.currentStep);
    const stepIndex = stepOrder.indexOf(step);

    // A step is complete only if the user has moved past it
    if (stepIndex >= currentIndex) {
      return false; // Current step or future steps are not complete
    }

    // For past steps, also verify they have valid data
    switch (step) {
      case 'type':
        return !!state.selectedType;
      case 'content':
        return actions.isContentValid();
      case 'style':
      case 'options':
        return true; // Past style/options steps are complete (they have defaults)
      case 'download':
        return state.hasDownloaded;
      default:
        return false;
    }
  }, [state.selectedType, state.currentStep, state.hasDownloaded, actions, mode]);

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
      const qrContent: QRContent = {
        type: 'url',
        url: `${getAppUrl()}/r/${code}`,
      };

      const dataURL = await generateQRDataURL(qrContent, { ...state.style, width: 1024 });
      await downloadQRPNG(dataURL, actions.getFilename());
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

      const qrContent: QRContent = {
        type: 'url',
        url: `${getAppUrl()}/r/${code}`,
      };

      const svg = await generateQRSVG(qrContent, state.style);
      downloadQRSVG(svg, actions.getFilename());
      actions.setHasDownloaded(true);
    } finally {
      actions.setIsDownloading(false);
    }
  }, [state, actions]);

  const handleDownloadPDF = useCallback(async () => {
    if (!state.content || !state.selectedType) return;

    // PDF requires Pro tier (like SVG)
    if (!state.userTier || state.userTier === 'free') return;

    try {
      let code = state.shortCode;
      if (!state.savedQRId) {
        const result = await actions.saveQRCode();
        if (!result) return;
        code = result.shortCode;
      }

      const qrContent: QRContent = {
        type: 'url',
        url: `${getAppUrl()}/r/${code}`,
      };

      const svg = await generateQRSVG(qrContent, state.style);
      setPdfSvgContent(svg);
      setShowPDFModal(true);
    } catch (err) {
      console.error('Failed to prepare PDF:', err);
    }
  }, [state, actions]);

  const handleShowEmbed = useCallback(async () => {
    if (!state.content || !state.selectedType) return;

    try {
      let code = state.shortCode;
      if (!state.savedQRId) {
        const result = await actions.saveQRCode();
        if (!result) return;
        code = result.shortCode;
      }

      const qrContent: QRContent = {
        type: 'url',
        url: `${getAppUrl()}/r/${code}`,
      };

      const [svg, dataURL] = await Promise.all([
        generateQRSVG(qrContent, state.style),
        generateQRDataURL(qrContent, { ...state.style, width: 256 }),
      ]);

      setEmbedSvgContent(svg);
      setEmbedDataURL(dataURL);
      setShowEmbedModal(true);
    } catch (err) {
      console.error('Failed to prepare embed:', err);
    }
  }, [state, actions]);

  // Handle save (for edit mode - redirects to dashboard after save)
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

  // Handle save from download step (no redirect - stays on download step to allow downloads)
  const handleSaveFromDownloadStep = useCallback(async () => {
    if (!state.userId) {
      router.push('/signup');
      return;
    }
    await actions.saveQRCode();
    // Don't redirect - let user stay on download step to download their QR code
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

  const isUserTierLoading = state.userTierLoading;
  const canAccessProTypes = state.userTier === 'pro' || state.userTier === 'business';

  return (
    <QRStudioProvider state={state} actions={actions} canAccessProTypes={canAccessProTypes}>
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
          {(state.saveError || state.saveBlockedReason) && (
            <span className={cn(
              "text-sm flex items-center gap-2",
              state.saveError ? "text-red-500" : "text-yellow-500"
            )}>
              {state.saveError || state.saveBlockedReason}
              <button
                onClick={() => actions.clearSaveError()}
                className="p-0.5 hover:bg-red-500/20 rounded"
                aria-label="Dismiss message"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExit}
          >
            Cancel
          </Button>
          {/* Only show save button in edit mode - create mode saves at final step */}
          {mode === 'edit' && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!actions.isContentValid() || state.isSaving || !state.userId}
            >
              {state.isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </header>

      {/* Mobile preview - only show on mobile */}
      <div className="lg:hidden">
        <QRStudioMiniPreview
          isExpanded={mobilePreviewExpanded}
          onToggle={() => setMobilePreviewExpanded(!mobilePreviewExpanded)}
        />
      </div>

      {/* Mobile step indicator */}
      <div className="lg:hidden px-4 py-3 border-b border-border bg-background/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {WIZARD_STEPS.findIndex(s => s.id === state.currentStep) + 1} of {WIZARD_STEPS.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {WIZARD_STEPS.find(s => s.id === state.currentStep)?.label}
          </span>
        </div>
        <div className="flex gap-1.5">
          {WIZARD_STEPS.map((step, index) => {
            const currentIndex = WIZARD_STEPS.findIndex(s => s.id === state.currentStep);
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div
                key={step.id}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  isComplete && 'bg-primary',
                  isCurrent && 'bg-primary/50',
                  !isComplete && !isCurrent && 'bg-muted'
                )}
              />
            );
          })}
        </div>
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
                  // Don't redirect to /plans while userTier is loading - Pro users would be wrongly redirected
                  if (PRO_ONLY_TYPES.includes(typeId as QRContentType) && !canAccessProTypes && !isUserTierLoading) {
                    router.push('/plans');
                    return;
                  }
                  // If still loading and Pro type selected, just select it - access will be validated on save
                  actions.selectType(typeId as QRContentType);
                }}
                canAccessProTypes={canAccessProTypes || isUserTierLoading}
                userTier={state.userTier}
              />
            )}

            {state.currentStep === 'content' && state.selectedType && (
              <ContentStep onContinue={actions.goForward} />
            )}

            {state.currentStep === 'style' && (
              <StyleStep
                style={state.style}
                onStyleChange={actions.setStyle}
                onContinue={actions.goForward}
                canAccessProTypes={canAccessProTypes}
              />
            )}

            {state.currentStep === 'options' && (
              <OptionsStep onContinue={actions.goForward} />
            )}

            {state.currentStep === 'download' && (
              <DownloadStep
                onSave={handleSaveFromDownloadStep}
                onDownloadPNG={handleDownloadPNG}
                onDownloadSVG={handleDownloadSVG}
                onDownloadPDF={handleDownloadPDF}
                onEmbed={handleShowEmbed}
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
            {(() => {
              const PreviewComp = state.selectedType && state.currentStep === 'content'
                ? getPreviewComponent(state.selectedType)
                : undefined;
              if (PreviewComp) {
                return (
                  <div className="h-full flex items-start justify-center p-6 bg-secondary/20">
                    <PreviewComp content={state.content || {}} />
                  </div>
                );
              }
              return (
                <QRStudioPreview
                  canDownload={state.currentStep === 'download'}
                  onDownloadPNG={handleDownloadPNG}
                  onDownloadSVG={handleDownloadSVG}
                  className="h-full"
                />
              );
            })()}
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

      {showPDFModal && pdfSvgContent && (
        <PDFOptionsModal
          open={showPDFModal}
          onClose={() => setShowPDFModal(false)}
          svgContent={pdfSvgContent}
          qrName={state.qrName || 'QR Code'}
        />
      )}

      {showEmbedModal && embedSvgContent && embedDataURL && (
        <EmbedCodeModal
          open={showEmbedModal}
          onClose={() => setShowEmbedModal(false)}
          svgContent={embedSvgContent}
          svgDataURL={embedDataURL}
          qrName={state.qrName || 'QR Code'}
          qrId={state.savedQRId}
          userTier={state.userTier}
        />
      )}
    </div>
    </QRStudioProvider>
  );
}
