'use client';

import { useState, useCallback } from 'react';
import type { WizardStep } from '../../wizard';

interface UseNavigationProps {
  mode: 'create' | 'edit';
  canGoForwardCheck: () => boolean;
}

export interface NavigationState {
  currentStep: WizardStep;
}

export interface NavigationActions {
  setStep: (step: WizardStep) => void;
  goBack: () => void;
  goForward: () => void;
  canGoForward: () => boolean;
}

export function useNavigation({ mode, canGoForwardCheck }: UseNavigationProps): [NavigationState, NavigationActions] {
  const [currentStep, setCurrentStep] = useState<WizardStep>(mode === 'edit' ? 'content' : 'type');

  const canGoForward = useCallback((): boolean => {
    return canGoForwardCheck();
  }, [canGoForwardCheck]);

  const goForward = useCallback(() => {
    if (!canGoForward()) return;

    const stepOrder: WizardStep[] = mode === 'edit'
      ? ['content', 'style', 'options', 'download']
      : ['type', 'content', 'style', 'options', 'download'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep, canGoForward, mode]);

  const goBack = useCallback(() => {
    const stepOrder: WizardStep[] = mode === 'edit'
      ? ['content', 'style', 'options', 'download']
      : ['type', 'content', 'style', 'options', 'download'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep, mode]);

  const setStep = useCallback((step: WizardStep) => {
    // In edit mode, allow jumping to any step (except type)
    if (mode === 'edit') {
      if (step !== 'type') {
        setCurrentStep(step);
      }
      return;
    }
    // In create mode, only allow going back or to the next valid step
    setCurrentStep(step);
  }, [mode]);

  const state: NavigationState = { currentStep };

  const actions: NavigationActions = {
    setStep,
    goBack,
    goForward,
    canGoForward,
  };

  return [state, actions];
}
