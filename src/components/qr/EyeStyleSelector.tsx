'use client';

import { useState } from 'react';
import { Lock, Check, Link2, Unlink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CornerSquareShape, CornerDotShape } from '@/lib/qr/types';

interface EyeStyleSelectorProps {
  cornerSquareValue: CornerSquareShape | undefined;
  cornerDotValue: CornerDotShape | undefined;
  onCornerSquareChange: (shape: CornerSquareShape) => void;
  onCornerDotChange: (shape: CornerDotShape) => void;
  canAccessPro: boolean;
}

// Corner square (outer) styles - matching qr-code-styling options
const CORNER_SQUARE_STYLES: {
  id: CornerSquareShape;
  name: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'square',
    name: 'Square',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    ),
  },
  {
    id: 'dot',
    name: 'Circle',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    ),
  },
  {
    id: 'rounded',
    name: 'Rounded',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    ),
  },
  {
    id: 'extraRounded',
    name: 'Extra Round',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="20" height="20" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    ),
  },
  {
    id: 'classy',
    name: 'Classy',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M2 12 L12 2 L22 12 L12 22 Z" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: 'classyRounded',
    name: 'Classy Round',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M4 12 Q4 4 12 4 Q20 4 20 12 Q20 20 12 20 Q4 20 4 12" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
  },
];

// Corner dot (inner) styles - matching qr-code-styling options
const CORNER_DOT_STYLES: {
  id: CornerDotShape;
  name: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'square',
    name: 'Square',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="6" y="6" width="12" height="12" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'dot',
    name: 'Circle',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <circle cx="12" cy="12" r="6" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'rounded',
    name: 'Rounded',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'extraRounded',
    name: 'Extra Round',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="6" y="6" width="12" height="12" rx="5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'classy',
    name: 'Classy',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M12 4 L20 12 L12 20 L4 12 Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'classyRounded',
    name: 'Classy Round',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M12 5 Q18 5 18 12 Q18 19 12 19 Q6 19 6 12 Q6 5 12 5" fill="currentColor" />
      </svg>
    ),
  },
];

export function EyeStyleSelector({
  cornerSquareValue,
  cornerDotValue,
  onCornerSquareChange,
  onCornerDotChange,
  canAccessPro,
}: EyeStyleSelectorProps) {
  const [linkedStyles, setLinkedStyles] = useState(true);
  const selectedSquare = cornerSquareValue || 'square';
  const selectedDot = cornerDotValue || 'square';

  const handleSquareChange = (shape: CornerSquareShape) => {
    onCornerSquareChange(shape);
    // If linked, also update dot to matching shape (if available)
    if (linkedStyles) {
      const matchingDot = CORNER_DOT_STYLES.find(d => d.id === shape);
      if (matchingDot) {
        onCornerDotChange(shape as CornerDotShape);
      }
    }
  };

  const handleDotChange = (shape: CornerDotShape) => {
    onCornerDotChange(shape);
  };

  const renderStyleButton = (
    style: { id: string; name: string; icon: React.ReactNode },
    isSelected: boolean,
    onClick: () => void,
    type: 'square' | 'dot'
  ) => {
    const isPro = style.id !== 'square';
    const isLocked = isPro && !canAccessPro;

    return (
      <button
        key={style.id}
        onClick={() => !isLocked && onClick()}
        className={cn(
          'relative w-10 h-10 rounded-lg border-2 transition-all duration-200',
          'flex items-center justify-center',
          'hover:scale-105',
          isSelected
            ? 'border-primary bg-primary/10'
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600',
          isLocked && 'cursor-not-allowed opacity-60'
        )}
        title={isLocked ? `Upgrade to Pro for ${style.name}` : style.name}
      >
        <div
          className={cn(
            'w-5 h-5',
            isSelected ? 'text-primary' : 'text-slate-400'
          )}
        >
          {style.icon}
        </div>

        {isSelected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-2 h-2 text-white" />
          </div>
        )}

        {isLocked && (
          <div className="absolute inset-0 rounded-lg bg-slate-900/50 flex items-center justify-center">
            <Lock className="w-3 h-3 text-slate-500" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Corner Style</h4>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">
          Pro
        </Badge>
      </div>

      {/* Link toggle */}
      <button
        onClick={() => setLinkedStyles(!linkedStyles)}
        className={cn(
          'flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-colors',
          linkedStyles
            ? 'bg-primary/20 text-primary'
            : 'bg-slate-800 text-slate-400 hover:text-white'
        )}
      >
        {linkedStyles ? (
          <>
            <Link2 className="w-3 h-3" />
            <span>Styles linked</span>
          </>
        ) : (
          <>
            <Unlink className="w-3 h-3" />
            <span>Independent styles</span>
          </>
        )}
      </button>

      {/* Outer corners (Corner Squares) */}
      <div className="space-y-2">
        <span className="text-xs text-slate-400">Outer Corners</span>
        <div className="flex flex-wrap gap-2">
          {CORNER_SQUARE_STYLES.map((style) =>
            renderStyleButton(
              style,
              selectedSquare === style.id,
              () => handleSquareChange(style.id),
              'square'
            )
          )}
        </div>
      </div>

      {/* Inner dots (Corner Dots) - only show if unlinked */}
      {!linkedStyles && (
        <div className="space-y-2">
          <span className="text-xs text-slate-400">Inner Dots</span>
          <div className="flex flex-wrap gap-2">
            {CORNER_DOT_STYLES.map((style) =>
              renderStyleButton(
                style,
                selectedDot === style.id,
                () => handleDotChange(style.id),
                'dot'
              )
            )}
          </div>
        </div>
      )}

      {/* Info text for free users */}
      {!canAccessPro && (
        <p className="text-xs text-slate-500">
          <span className="text-primary">Square</span> corners are free. Upgrade to Pro for all styles.
        </p>
      )}
    </div>
  );
}
