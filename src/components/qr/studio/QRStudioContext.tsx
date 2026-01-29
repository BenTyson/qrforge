'use client';

import { createContext, useContext } from 'react';
import type { QRStudioState, QRStudioActions } from './hooks/useQRStudioState';

interface QRStudioContextValue {
  state: QRStudioState;
  actions: QRStudioActions;
  canAccessProTypes: boolean;
}

const QRStudioContext = createContext<QRStudioContextValue | null>(null);

export function QRStudioProvider({
  state,
  actions,
  canAccessProTypes,
  children,
}: QRStudioContextValue & { children: React.ReactNode }) {
  return (
    <QRStudioContext.Provider value={{ state, actions, canAccessProTypes }}>
      {children}
    </QRStudioContext.Provider>
  );
}

export function useQRStudio(): QRStudioContextValue {
  const ctx = useContext(QRStudioContext);
  if (!ctx) {
    throw new Error('useQRStudio must be used within a QRStudioProvider');
  }
  return ctx;
}
