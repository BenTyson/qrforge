'use client';

import { useState, useCallback } from 'react';
import type { QRStyleOptions } from '@/lib/qr/types';

export const DEFAULT_STYLE: QRStyleOptions = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 4,
  width: 256,
};

export interface StyleState {
  style: QRStyleOptions;
}

export interface StyleActions {
  setStyle: (style: QRStyleOptions) => void;
  updateStyle: (updates: Partial<QRStyleOptions>) => void;
  resetStyle: () => void;
}

export function useStyleState(): [StyleState, StyleActions] {
  const [style, setStyle] = useState<QRStyleOptions>(DEFAULT_STYLE);

  const updateStyle = useCallback((updates: Partial<QRStyleOptions>) => {
    setStyle(prev => ({ ...prev, ...updates }));
  }, []);

  const resetStyle = useCallback(() => {
    setStyle(DEFAULT_STYLE);
  }, []);

  const state: StyleState = { style };

  const actions: StyleActions = { setStyle, updateStyle, resetStyle };

  return [state, actions];
}
