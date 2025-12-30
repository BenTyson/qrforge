'use client';

import { cn } from '@/lib/utils';
import type { WizardStep } from '../wizard';
import type { QRContentType } from '@/lib/qr/types';

// Type labels for display
const TYPE_LABELS: Record<string, string> = {
  url: 'Website URL',
  text: 'Plain Text',
  wifi: 'WiFi',
  vcard: 'Contact Card',
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
  apps: 'App Download',
  pdf: 'PDF Document',
  images: 'Image Gallery',
  video: 'Video',
  mp3: 'Audio',
  menu: 'Restaurant Menu',
  business: 'Business Card',
  links: 'Link List',
  coupon: 'Coupon',
  social: 'Social Profile',
};

interface StepConfig {
  id: WizardStep;
  label: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  {
    id: 'type',
    label: 'Type',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'content',
    label: 'Content',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
    id: 'download',
    label: 'Save',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
];

interface QRStudioSidebarProps {
  mode: 'create' | 'edit';
  currentStep: WizardStep;
  selectedType: QRContentType | null;
  onStepClick: (step: WizardStep) => void;
  isStepComplete: (step: WizardStep) => boolean;
  isStepClickable: (step: WizardStep) => boolean;
}

export function QRStudioSidebar({
  mode,
  currentStep,
  selectedType,
  onStepClick,
  isStepComplete,
  isStepClickable,
}: QRStudioSidebarProps) {
  // Filter out type step in edit mode
  const visibleSteps = mode === 'edit' ? STEPS.filter(s => s.id !== 'type') : STEPS;

  return (
    <aside className="w-60 border-r border-border bg-card/50 backdrop-blur flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <h2 className="font-semibold text-lg">
          {mode === 'create' ? 'Create QR Code' : 'Edit QR Code'}
        </h2>
        {mode === 'edit' && selectedType && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            {TYPE_LABELS[selectedType] || selectedType}
          </div>
        )}
      </div>

      {/* Steps */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleSteps.map((step, index) => {
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
              {/* Step indicator */}
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

              {/* Label */}
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

      {/* Footer with help */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {mode === 'edit' ? (
            'Changes are saved when you click Save.'
          ) : (
            'Complete each step to create your QR code.'
          )}
        </p>
      </div>
    </aside>
  );
}
