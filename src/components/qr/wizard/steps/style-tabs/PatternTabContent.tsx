'use client';

import { PatternSelector } from '@/components/qr/PatternSelector';
import { EyeStyleSelector } from '@/components/qr/EyeStyleSelector';
import type { QRStyleOptions } from '@/lib/qr/types';

export interface PatternTabContentProps {
  style: QRStyleOptions;
  onStyleChange: (style: QRStyleOptions) => void;
  canAccessProTypes: boolean;
}

export function PatternTabContent({ style, onStyleChange, canAccessProTypes }: PatternTabContentProps) {
  return (
    <div className="space-y-6">
      {/* Module Pattern */}
      <PatternSelector
        value={style.moduleShape}
        onChange={(shape) => onStyleChange({ ...style, moduleShape: shape })}
        canAccessPro={canAccessProTypes}
      />

      {/* Eye Style */}
      <EyeStyleSelector
        cornerSquareValue={style.cornerSquareShape}
        cornerDotValue={style.cornerDotShape}
        onCornerSquareChange={(shape) => onStyleChange({ ...style, cornerSquareShape: shape })}
        onCornerDotChange={(shape) => onStyleChange({ ...style, cornerDotShape: shape })}
        canAccessPro={canAccessProTypes}
      />
    </div>
  );
}
