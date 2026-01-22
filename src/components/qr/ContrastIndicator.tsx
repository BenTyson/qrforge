'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getContrastRatio,
  getContrastLevel,
  getContrastInfo,
  isValidHexColor,
  type ContrastLevel,
} from '@/lib/qr/contrast';

interface ContrastIndicatorProps {
  foreground: string;
  background: string;
  gradientEndColor?: string; // For gradient mode - show worst of both ratios
  showDetails?: boolean; // Default collapsed
  className?: string;
}

function getStatusIcon(level: ContrastLevel, className?: string) {
  switch (level) {
    case 'excellent':
    case 'good':
      return <CheckCircle className={cn('w-4 h-4', className)} />;
    case 'poor':
      return <AlertTriangle className={cn('w-4 h-4', className)} />;
    case 'fail':
      return <XCircle className={cn('w-4 h-4', className)} />;
  }
}

export function ContrastIndicator({
  foreground,
  background,
  gradientEndColor,
  showDetails: initialShowDetails = false,
  className,
}: ContrastIndicatorProps) {
  const [showDetails, setShowDetails] = useState(initialShowDetails);

  const { ratio, level, info, isGradient, hasInvalidColor } = useMemo(() => {
    // Check if colors are valid
    const foregroundValid = isValidHexColor(foreground);
    const backgroundValid = isValidHexColor(background);
    const gradientEndValid = gradientEndColor ? isValidHexColor(gradientEndColor) : true;

    if (!foregroundValid || !backgroundValid || !gradientEndValid) {
      return {
        ratio: null,
        level: 'fail' as ContrastLevel,
        info: getContrastInfo('fail'),
        isGradient: !!gradientEndColor,
        hasInvalidColor: true,
      };
    }

    // Calculate contrast for foreground/start color
    const startRatio = getContrastRatio(foreground, background);

    // If gradient mode, calculate contrast for end color too
    let effectiveRatio = startRatio;
    if (gradientEndColor) {
      const endRatio = getContrastRatio(gradientEndColor, background);
      // Use the WORSE (lower) ratio to ensure entire QR is scannable
      if (startRatio !== null && endRatio !== null) {
        effectiveRatio = Math.min(startRatio, endRatio);
      } else if (startRatio === null) {
        effectiveRatio = endRatio;
      }
      // if endRatio is null, we already have startRatio as effectiveRatio
    }

    const l = getContrastLevel(effectiveRatio);
    const i = getContrastInfo(l);

    return {
      ratio: effectiveRatio,
      level: l,
      info: i,
      isGradient: !!gradientEndColor,
      hasInvalidColor: false,
    };
  }, [foreground, background, gradientEndColor]);

  return (
    <div className={cn('rounded-lg bg-slate-800/50 border border-slate-700 p-3', className)}>
      {/* Main indicator row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Contrast:</span>
          <span className="font-mono font-semibold text-white">
            {ratio !== null ? `${ratio.toFixed(1)}:1` : '—:1'}
          </span>
          {isGradient && (
            <span className="text-xs text-slate-500">(worst of gradient)</span>
          )}
        </div>

        {/* Status badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
            info.bgColorClass,
            info.colorClass
          )}
        >
          {getStatusIcon(level)}
          <span>{info.label}</span>
        </div>
      </div>

      {/* Expand/collapse button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 mt-2 transition-colors"
      >
        {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        What does this mean?
      </button>

      {/* Collapsible details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2 text-xs">
          {hasInvalidColor && (
            <p className="text-slate-400 italic mb-2">
              Enter valid hex colors (e.g., #000000 or #FFF) to see contrast rating.
            </p>
          )}
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-slate-400">
              <strong className="text-green-400">≥7:1 Excellent</strong> — Works in all conditions
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-slate-400">
              <strong className="text-primary">≥4.5:1 Good</strong> — Reliable in normal lighting
            </span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span className="text-slate-400">
              <strong className="text-yellow-400">≥3:1 Poor</strong> — May have scanning issues
            </span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-slate-400">
              <strong className="text-red-400">&lt;3:1 Fail</strong> — Will not scan reliably
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
