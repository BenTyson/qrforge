'use client';

import { Lock, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ModuleShape } from '@/lib/qr/types';

interface PatternSelectorProps {
  value: ModuleShape | undefined;
  onChange: (shape: ModuleShape) => void;
  canAccessPro: boolean;
}

// Pattern definitions with visual representations (6 patterns from qr-code-styling)
const PATTERNS: {
  id: ModuleShape;
  name: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'square',
    name: 'Square',
    description: 'Classic square modules',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" fill="currentColor" />
        <rect x="9" y="2" width="6" height="6" fill="currentColor" />
        <rect x="16" y="2" width="6" height="6" fill="currentColor" />
        <rect x="2" y="9" width="6" height="6" fill="currentColor" />
        <rect x="16" y="9" width="6" height="6" fill="currentColor" />
        <rect x="2" y="16" width="6" height="6" fill="currentColor" />
        <rect x="9" y="16" width="6" height="6" fill="currentColor" />
        <rect x="16" y="16" width="6" height="6" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'dots',
    name: 'Dots',
    description: 'Circular dot modules',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <circle cx="5" cy="5" r="3" fill="currentColor" />
        <circle cx="12" cy="5" r="3" fill="currentColor" />
        <circle cx="19" cy="5" r="3" fill="currentColor" />
        <circle cx="5" cy="12" r="3" fill="currentColor" />
        <circle cx="19" cy="12" r="3" fill="currentColor" />
        <circle cx="5" cy="19" r="3" fill="currentColor" />
        <circle cx="12" cy="19" r="3" fill="currentColor" />
        <circle cx="19" cy="19" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'rounded',
    name: 'Rounded',
    description: 'Rounded square corners',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="16" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="2" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="16" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="2" y="16" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="16" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="16" y="16" width="6" height="6" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'extraRounded',
    name: 'Extra Round',
    description: 'More rounded corners',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" rx="2.5" fill="currentColor" />
        <rect x="9" y="2" width="6" height="6" rx="2.5" fill="currentColor" />
        <rect x="16" y="2" width="6" height="6" rx="2.5" fill="currentColor" />
        <rect x="2" y="9" width="6" height="6" rx="2.5" fill="currentColor" />
        <rect x="16" y="9" width="6" height="6" rx="2.5" fill="currentColor" />
        <rect x="2" y="16" width="6" height="6" rx="2.5" fill="currentColor" />
        <rect x="9" y="16" width="6" height="6" rx="2.5" fill="currentColor" />
        <rect x="16" y="16" width="6" height="6" rx="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'classy',
    name: 'Classy',
    description: 'Elegant square style',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M2 5 L5 2 L8 5 L5 8 Z" fill="currentColor" transform="translate(0, -1)" />
        <path d="M2 5 L5 2 L8 5 L5 8 Z" fill="currentColor" transform="translate(7, -1)" />
        <path d="M2 5 L5 2 L8 5 L5 8 Z" fill="currentColor" transform="translate(14, -1)" />
        <path d="M2 5 L5 2 L8 5 L5 8 Z" fill="currentColor" transform="translate(0, 6)" />
        <path d="M2 5 L5 2 L8 5 L5 8 Z" fill="currentColor" transform="translate(14, 6)" />
        <path d="M2 5 L5 2 L8 5 L5 8 Z" fill="currentColor" transform="translate(0, 13)" />
        <path d="M2 5 L5 2 L8 5 L5 8 Z" fill="currentColor" transform="translate(7, 13)" />
        <path d="M2 5 L5 2 L8 5 L5 8 Z" fill="currentColor" transform="translate(14, 13)" />
      </svg>
    ),
  },
  {
    id: 'classyRounded',
    name: 'Classy Round',
    description: 'Classy with soft edges',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" rx="1" ry="1" fill="currentColor" transform="rotate(45 5 5)" />
        <rect x="9" y="2" width="6" height="6" rx="1" ry="1" fill="currentColor" transform="rotate(45 12 5)" />
        <rect x="16" y="2" width="6" height="6" rx="1" ry="1" fill="currentColor" transform="rotate(45 19 5)" />
        <rect x="2" y="9" width="6" height="6" rx="1" ry="1" fill="currentColor" transform="rotate(45 5 12)" />
        <rect x="16" y="9" width="6" height="6" rx="1" ry="1" fill="currentColor" transform="rotate(45 19 12)" />
        <rect x="2" y="16" width="6" height="6" rx="1" ry="1" fill="currentColor" transform="rotate(45 5 19)" />
        <rect x="9" y="16" width="6" height="6" rx="1" ry="1" fill="currentColor" transform="rotate(45 12 19)" />
        <rect x="16" y="16" width="6" height="6" rx="1" ry="1" fill="currentColor" transform="rotate(45 19 19)" />
      </svg>
    ),
  },
];

export function PatternSelector({
  value,
  onChange,
  canAccessPro,
}: PatternSelectorProps) {
  const selectedPattern = value || 'square';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Module Pattern</h4>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">
          Pro
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PATTERNS.map((pattern, index) => {
          const isSelected = selectedPattern === pattern.id;
          const isPro = pattern.id !== 'square';
          const isLocked = isPro && !canAccessPro;

          return (
            <button
              key={pattern.id}
              onClick={() => {
                if (!isLocked) {
                  onChange(pattern.id);
                }
              }}
              className={cn(
                'group relative aspect-square rounded-lg border-2 transition-all duration-200',
                'flex flex-col items-center justify-center p-2',
                'hover:scale-[1.02] hover:-translate-y-0.5',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600',
                isLocked && 'cursor-not-allowed opacity-75'
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              title={isLocked ? `Upgrade to Pro for ${pattern.name}` : pattern.name}
            >
              {/* Pattern Icon */}
              <div
                className={cn(
                  'w-8 h-8 transition-colors',
                  isSelected ? 'text-primary' : 'text-slate-400 group-hover:text-slate-300'
                )}
              >
                {pattern.icon}
              </div>

              {/* Pattern Name */}
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium truncate max-w-full',
                  isSelected ? 'text-primary' : 'text-slate-400'
                )}
              >
                {pattern.name}
              </span>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}

              {/* Pro Lock Overlay */}
              {isLocked && (
                <div className="absolute inset-0 rounded-lg bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info text for free users */}
      {!canAccessPro && (
        <p className="text-xs text-slate-500">
          <span className="text-primary">Square</span> pattern is free. Upgrade to Pro for all patterns.
        </p>
      )}
    </div>
  );
}
