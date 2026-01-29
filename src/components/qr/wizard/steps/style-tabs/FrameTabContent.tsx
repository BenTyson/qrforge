'use client';

import { FrameEditor } from '@/components/qr/FrameEditor';
import type { QRStyleOptions } from '@/lib/qr/types';

export interface FrameTabContentProps {
  style: QRStyleOptions;
  onStyleChange: (style: QRStyleOptions) => void;
  canAccessProTypes: boolean;
}

export function FrameTabContent({ style, onStyleChange, canAccessProTypes }: FrameTabContentProps) {
  return (
    <FrameEditor
      value={style.frame}
      onChange={(frame) => onStyleChange({ ...style, frame })}
      canAccessPro={canAccessProTypes}
    />
  );
}
