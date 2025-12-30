'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBulkState, BulkStep, MAX_ENTRIES } from './hooks/useBulkState';
import { BulkUploadStep } from './BulkUploadStep';
import { BulkReviewStep } from './BulkReviewStep';
import { Button } from '@/components/ui/button';
import { QRPreview } from '@/components/qr/QRPreview';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';

// Import reusable step components from wizard (direct imports to avoid barrel export overhead)
import { StyleStep } from '../wizard/steps/StyleStep';
import { OptionsStep } from '../wizard/steps/OptionsStep';

// Types
interface UserData {
  userId: string;
  tier: 'free' | 'pro' | 'business';
}

// Step configuration
interface StepConfig {
  id: BulkStep;
  label: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  {
    id: 'upload',
    label: 'Upload',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: 'style',
    label: 'Style',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: 'options',
    label: 'Options',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    id: 'review',
    label: 'Review',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export function BulkStudio() {
  const router = useRouter();
  const [state, actions] = useBulkState();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobilePreviewExpanded, setMobilePreviewExpanded] = useState(false);

  // Load user data
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        router.push('/login');
        return;
      }

      // Get user profile for tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (!isMounted) return;

      const tier = profile?.subscription_tier || 'free';

      // Bulk is business-only feature
      if (tier !== 'business') {
        router.push('/plans?feature=bulk');
        return;
      }

      setUserData({
        userId: user.id,
        tier: tier as 'free' | 'pro' | 'business',
      });
      setIsLoading(false);
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Check if step is complete
  const isStepComplete = useCallback((step: BulkStep): boolean => {
    switch (step) {
      case 'upload':
        return state.entries.length > 0 && !state.parseError;
      case 'style':
        return true;
      case 'options':
        if (state.passwordEnabled && state.password.length < 4) {
          return false;
        }
        return true;
      case 'review':
        return state.savedCount > 0;
      default:
        return false;
    }
  }, [state.entries.length, state.parseError, state.passwordEnabled, state.password, state.savedCount]);

  // Check if step is clickable
  const isStepClickable = useCallback((step: BulkStep): boolean => {
    const stepOrder: BulkStep[] = ['upload', 'style', 'options', 'review'];
    const targetIndex = stepOrder.indexOf(step);
    const currentIndex = stepOrder.indexOf(state.currentStep);

    // Can always go back
    if (targetIndex <= currentIndex) return true;

    // Can only go forward if current step is complete
    if (targetIndex === currentIndex + 1) {
      return actions.canProceed();
    }

    return false;
  }, [state.currentStep, actions]);

  // Generate preview content for first entry
  const previewContent: QRContent | null = state.entries.length > 0
    ? { type: 'url', url: state.entries[0].url }
    : null;

  // Handle exit
  const handleExit = useCallback(() => {
    router.push('/qr-codes');
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canAccessProTypes = userData?.tier === 'pro' || userData?.tier === 'business';

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
          <h1 className="text-lg font-semibold">Bulk Generate QR Codes</h1>
        </div>

        <div className="flex items-center gap-2">
          {state.isSaving && (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Saving {state.savedCount} / {state.entries.length}...
            </span>
          )}
          {state.saveError && (
            <span className="text-sm text-red-500">{state.saveError}</span>
          )}
          <Button variant="outline" size="sm" onClick={handleExit}>
            Cancel
          </Button>
        </div>
      </header>

      {/* Mobile preview */}
      <div className="lg:hidden">
        <BulkMiniPreview
          content={previewContent}
          style={state.style as QRStyleOptions}
          entryCount={state.entries.length}
          isExpanded={mobilePreviewExpanded}
          onToggle={() => setMobilePreviewExpanded(!mobilePreviewExpanded)}
        />
      </div>

      {/* Main layout */}
      <div className="flex-1 flex">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <BulkSidebar
              currentStep={state.currentStep}
              entryCount={state.entries.length}
              onStepClick={actions.setStep}
              isStepComplete={isStepComplete}
              isStepClickable={isStepClickable}
            />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
          <div className="max-w-3xl mx-auto p-6 lg:p-8">
            {state.currentStep === 'upload' && (
              <BulkUploadStep
                rawInput={state.rawInput}
                entries={state.entries}
                parseError={state.parseError}
                onInputChange={actions.parseInput}
                onRemoveEntry={actions.removeEntry}
                onClear={actions.clearEntries}
                onContinue={actions.nextStep}
                canProceed={actions.canProceed()}
                maxEntries={MAX_ENTRIES}
              />
            )}

            {state.currentStep === 'style' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-1">Style Your QR Codes</h2>
                  <p className="text-muted-foreground text-sm">
                    These settings will apply to all {state.entries.length} QR codes
                  </p>
                </div>
                <StyleStep
                  content={previewContent}
                  style={state.style as QRStyleOptions}
                  onStyleChange={(newStyle) => actions.setStyle(newStyle)}
                  onContinue={actions.nextStep}
                  canAccessProTypes={canAccessProTypes}
                />
              </div>
            )}

            {state.currentStep === 'options' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-1">Configure Options</h2>
                  <p className="text-muted-foreground text-sm">
                    These settings will apply to all {state.entries.length} QR codes
                  </p>
                </div>
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
                  activeUntil=""
                  onActiveUntilChange={() => {}}
                  canAccessProTypes={canAccessProTypes}
                  userTier={userData?.tier || null}
                  onContinue={actions.nextStep}
                />
              </div>
            )}

            {state.currentStep === 'review' && userData && (
              <BulkReviewStep
                entries={state.entries}
                style={state.style as QRStyleOptions}
                expiresAt={state.expiresAt}
                passwordEnabled={state.passwordEnabled}
                password={state.password}
                scheduledEnabled={state.scheduledEnabled}
                activeFrom={state.activeFrom}
                showLandingPage={state.showLandingPage}
                landingPageTitle={state.landingPageTitle}
                landingPageDescription={state.landingPageDescription}
                landingPageButtonText={state.landingPageButtonText}
                landingPageTheme={state.landingPageTheme}
                userId={userData.userId}
                isSaving={state.isSaving}
                savedCount={state.savedCount}
                saveError={state.saveError}
                onEntryStatusChange={actions.setEntryStatus}
                onSetIsSaving={actions.setIsSaving}
                onSetSavedCount={actions.setSavedCount}
                onSetSaveError={actions.setSaveError}
                onDone={() => router.push('/qr-codes')}
              />
            )}
          </div>

          {/* Mobile bottom navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background p-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={actions.prevStep}
              disabled={state.currentStep === 'upload'}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={actions.nextStep}
              disabled={!actions.canProceed() || state.currentStep === 'review'}
            >
              Continue
            </Button>
          </div>
        </main>

        {/* Preview panel - hidden on mobile */}
        <div className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <BulkPreviewPanel
              content={previewContent}
              style={state.style as QRStyleOptions}
              entryCount={state.entries.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar component
interface BulkSidebarProps {
  currentStep: BulkStep;
  entryCount: number;
  onStepClick: (step: BulkStep) => void;
  isStepComplete: (step: BulkStep) => boolean;
  isStepClickable: (step: BulkStep) => boolean;
}

function BulkSidebar({
  currentStep,
  entryCount,
  onStepClick,
  isStepComplete,
  isStepClickable,
}: BulkSidebarProps) {
  return (
    <aside className="w-60 border-r border-border bg-card/50 backdrop-blur flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <h2 className="font-semibold text-lg">Bulk Generate</h2>
        {entryCount > 0 && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            {entryCount} URLs
          </div>
        )}
      </div>

      {/* Steps */}
      <nav className="flex-1 p-4 space-y-1">
        {STEPS.map((step) => {
          const isCurrent = currentStep === step.id;
          const isComplete = isStepComplete(step.id);
          const isClickable = isStepClickable(step.id);

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                isCurrent && 'bg-primary/10 text-primary',
                !isCurrent && isComplete && 'text-muted-foreground hover:bg-secondary/50',
                !isCurrent && !isComplete && isClickable && 'text-muted-foreground hover:bg-secondary/50',
                !isClickable && 'opacity-40 cursor-not-allowed',
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  isCurrent && 'bg-primary text-primary-foreground',
                  !isCurrent && isComplete && 'bg-primary/20 text-primary',
                  !isCurrent && !isComplete && 'bg-secondary text-muted-foreground',
                )}
              >
                {isComplete && !isCurrent ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              <span className={cn(
                'font-medium text-sm',
                isCurrent && 'text-primary',
              )}>
                {step.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Complete each step to generate your QR codes.
        </p>
      </div>
    </aside>
  );
}

// Preview panel component
interface BulkPreviewPanelProps {
  content: QRContent | null;
  style: QRStyleOptions;
  entryCount: number;
}

function BulkPreviewPanel({
  content,
  style,
  entryCount,
}: BulkPreviewPanelProps) {
  return (
    <aside className="w-80 border-l border-border bg-card/30 backdrop-blur flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Sample Preview
        </h3>
        {entryCount > 0 && (
          <p className="text-sm font-medium mt-1">
            First of {entryCount} codes
          </p>
        )}
      </div>

      {/* Preview */}
      <div className="flex-1 p-5 flex flex-col items-center justify-center">
        <div className="w-full max-w-[240px] aspect-square">
          <QRPreview
            content={content}
            style={style}
            className="w-full h-full rounded-xl shadow-lg"
            showPlaceholder={true}
          />
        </div>

        {entryCount > 0 && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span className="text-sm font-medium text-primary">
              {entryCount} QR codes ready
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          All codes will share the same style and options
        </p>
      </div>
    </aside>
  );
}

// Mobile mini preview
interface BulkMiniPreviewProps {
  content: QRContent | null;
  style: QRStyleOptions;
  entryCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function BulkMiniPreview({
  content,
  style,
  entryCount,
  isExpanded,
  onToggle,
}: BulkMiniPreviewProps) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center gap-3"
      >
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <QRPreview
            content={content}
            style={style}
            className="w-full h-full"
            showPlaceholder={true}
          />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">Preview</p>
          <p className="text-xs text-muted-foreground">
            {entryCount > 0 ? `${entryCount} QR codes` : 'No entries yet'}
          </p>
        </div>
        <svg
          className={cn(
            'w-5 h-5 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="w-48 h-48 mx-auto">
            <QRPreview
              content={content}
              style={style}
              className="w-full h-full rounded-xl shadow-lg"
              showPlaceholder={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
