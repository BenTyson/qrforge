'use client';

import { useState, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import type { QRStyleOptions } from '@/lib/qr/types';

// Types
export type BulkStep = 'upload' | 'style' | 'options' | 'review';

export interface BulkEntry {
  id: string;
  name: string;
  url: string;
  status: 'pending' | 'generating' | 'done' | 'error';
  error?: string;
  previewUrl?: string;
}

export type { QRStyleOptions };

export interface BulkState {
  currentStep: BulkStep;

  // Upload
  entries: BulkEntry[];
  rawInput: string;
  parseError: string | null;
  parseHint: string | null;

  // Style (shared across all)
  style: QRStyleOptions;

  // Options (shared across all)
  expiresAt: string;
  passwordEnabled: boolean;
  password: string;
  scheduledEnabled: boolean;
  activeFrom: string;
  activeUntil: string;
  showLandingPage: boolean;
  landingPageTitle: string;
  landingPageDescription: string;
  landingPageButtonText: string;
  landingPageTheme: 'dark' | 'light';

  // Generation
  isGenerating: boolean;
  isSaving: boolean;
  generationProgress: number;
  savedCount: number;
  saveError: string | null;
}

export interface BulkActions {
  // Navigation
  setStep: (step: BulkStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceed: () => boolean;

  // Upload
  setRawInput: (input: string) => void;
  parseInput: (input: string) => void;
  removeEntry: (id: string) => void;
  clearEntries: () => void;

  // Style
  setStyle: (style: Partial<QRStyleOptions>) => void;
  setForegroundColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setErrorCorrectionLevel: (level: 'L' | 'M' | 'Q' | 'H') => void;
  setMargin: (margin: number) => void;
  setLogoUrl: (url: string | undefined) => void;
  setLogoSize: (size: number) => void;

  // Options
  setExpiresAt: (date: string) => void;
  setPasswordEnabled: (enabled: boolean) => void;
  setPassword: (password: string) => void;
  setScheduledEnabled: (enabled: boolean) => void;
  setActiveFrom: (date: string) => void;
  setActiveUntil: (date: string) => void;
  setShowLandingPage: (show: boolean) => void;
  setLandingPageTitle: (title: string) => void;
  setLandingPageDescription: (desc: string) => void;
  setLandingPageButtonText: (text: string) => void;
  setLandingPageTheme: (theme: 'dark' | 'light') => void;

  // Generation
  setEntryStatus: (id: string, status: BulkEntry['status'], previewUrl?: string, error?: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  setSavedCount: (count: number) => void;
  setSaveError: (error: string | null) => void;

  // Reset
  reset: () => void;
}

const STEPS: BulkStep[] = ['upload', 'style', 'options', 'review'];
const MAX_ENTRIES = 100;

const DEFAULT_STYLE: QRStyleOptions = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 2,  // Match normal QR studio default
  width: 256,
  logoUrl: undefined,
  logoSize: 20,
};

const initialState: BulkState = {
  currentStep: 'upload',
  entries: [],
  rawInput: '',
  parseError: null,
  parseHint: null,
  style: DEFAULT_STYLE,
  expiresAt: '',
  passwordEnabled: false,
  password: '',
  scheduledEnabled: false,
  activeFrom: '',
  activeUntil: '',
  showLandingPage: true,
  landingPageTitle: '',
  landingPageDescription: '',
  landingPageButtonText: 'Visit Link',
  landingPageTheme: 'dark',
  isGenerating: false,
  isSaving: false,
  generationProgress: 0,
  savedCount: 0,
  saveError: null,
};

// URL validation helper
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Detect if input looks like JSON
function looksLikeJSON(input: string): boolean {
  const trimmed = input.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
}

// Detect if input looks like it might be binary/Excel
function looksLikeBinary(input: string): boolean {
  // Check for common binary file signatures or unusual characters
  const nonPrintable = input.slice(0, 100).split('').filter(c => {
    const code = c.charCodeAt(0);
    return code < 32 && code !== 9 && code !== 10 && code !== 13;
  });
  return nonPrintable.length > 5;
}

// Check if lines look like URLs only (no names)
function looksLikeURLsOnly(lines: string[]): boolean {
  const urlPattern = /^(https?:\/\/|www\.)/i;
  const urlOnlyLines = lines.filter(line => {
    const trimmed = line.trim();
    return urlPattern.test(trimmed) && !trimmed.includes(',') && !trimmed.includes('\t');
  });
  return urlOnlyLines.length > lines.length * 0.7; // More than 70% look like URLs only
}

// CSV parsing helper
function parseCSVInput(input: string): { entries: BulkEntry[]; error: string | null; hint?: string } {
  // Check for wrong file types first
  if (looksLikeBinary(input)) {
    return {
      entries: [],
      error: 'This file appears to be in a binary format (possibly Excel .xlsx).',
      hint: 'Please save your spreadsheet as a CSV file, or copy and paste the data directly.'
    };
  }

  if (looksLikeJSON(input)) {
    return {
      entries: [],
      error: 'JSON format detected. Please use CSV format instead.',
      hint: 'Each line should be: Name, URL (e.g., "My Website, https://example.com")'
    };
  }

  const lines = input
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return { entries: [], error: null };
  }

  // Check if it looks like URLs without names
  if (looksLikeURLsOnly(lines)) {
    return {
      entries: [],
      error: 'It looks like you pasted URLs without names.',
      hint: 'Each line needs a name AND a URL separated by a comma.\nExample: My Website, https://example.com'
    };
  }

  if (lines.length > MAX_ENTRIES) {
    return {
      entries: [],
      error: `Maximum ${MAX_ENTRIES} entries allowed. You have ${lines.length}.`,
      hint: 'Please reduce the number of entries and try again.'
    };
  }

  // Check if first line looks like a header row
  const firstLine = lines[0].toLowerCase();
  const isHeaderRow = (firstLine.includes('name') && firstLine.includes('url')) ||
                      (firstLine.includes('title') && firstLine.includes('link'));

  const dataLines = isHeaderRow ? lines.slice(1) : lines;

  if (dataLines.length === 0) {
    return {
      entries: [],
      error: 'No data found after header row.',
      hint: 'Add your entries below the header row.'
    };
  }

  const entries: BulkEntry[] = [];
  const errors: string[] = [];

  dataLines.forEach((line, index) => {
    const lineNum = isHeaderRow ? index + 2 : index + 1;

    // Support both comma and tab delimiters
    const parts = line.includes('\t')
      ? line.split('\t').map(p => p.trim())
      : line.split(',').map(p => p.trim());

    if (parts.length < 2) {
      errors.push(`Line ${lineNum}: Missing comma separator between name and URL`);
      return;
    }

    const [name, url] = parts;

    if (!name) {
      errors.push(`Line ${lineNum}: Name is empty`);
      return;
    }

    if (!url) {
      errors.push(`Line ${lineNum}: URL is empty`);
      return;
    }

    // Auto-add https:// if no protocol
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = `https://${url}`;
    }

    if (!isValidUrl(normalizedUrl)) {
      errors.push(`Line ${lineNum}: Invalid URL "${url}"`);
      return;
    }

    entries.push({
      id: nanoid(8),
      name,
      url: normalizedUrl,
      status: 'pending',
    });
  });

  if (errors.length > 0) {
    const errorList = errors.slice(0, 5).join('\n') +
      (errors.length > 5 ? `\n...and ${errors.length - 5} more errors` : '');
    return {
      entries: [],
      error: errorList,
      hint: 'Format each line as: Name, URL'
    };
  }

  return { entries, error: null };
}

export function useBulkState(): [BulkState, BulkActions] {
  const [state, setState] = useState<BulkState>(initialState);

  // Navigation actions
  const setStep = useCallback((step: BulkStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const currentIndex = STEPS.indexOf(prev.currentStep);
      if (currentIndex < STEPS.length - 1) {
        return { ...prev, currentStep: STEPS[currentIndex + 1] };
      }
      return prev;
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => {
      const currentIndex = STEPS.indexOf(prev.currentStep);
      if (currentIndex > 0) {
        return { ...prev, currentStep: STEPS[currentIndex - 1] };
      }
      return prev;
    });
  }, []);

  const canProceed = useCallback(() => {
    switch (state.currentStep) {
      case 'upload':
        return state.entries.length > 0 && !state.parseError;
      case 'style':
        return true; // Style always has valid defaults
      case 'options':
        // Password validation if enabled
        if (state.passwordEnabled && state.password.length < 4) {
          return false;
        }
        return true;
      case 'review':
        return state.entries.length > 0 && !state.isSaving;
      default:
        return false;
    }
  }, [state.currentStep, state.entries.length, state.parseError, state.passwordEnabled, state.password, state.isSaving]);

  // Upload actions
  const setRawInput = useCallback((input: string) => {
    setState(prev => ({ ...prev, rawInput: input }));
  }, []);

  const parseInput = useCallback((input: string) => {
    const { entries, error, hint } = parseCSVInput(input);
    setState(prev => ({
      ...prev,
      rawInput: input,
      entries,
      parseError: error,
      parseHint: hint || null,
    }));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== id),
    }));
  }, []);

  const clearEntries = useCallback(() => {
    setState(prev => ({
      ...prev,
      entries: [],
      rawInput: '',
      parseError: null,
      parseHint: null,
    }));
  }, []);

  // Style actions
  const setStyle = useCallback((style: Partial<QRStyleOptions>) => {
    setState(prev => ({
      ...prev,
      style: { ...prev.style, ...style },
    }));
  }, []);

  const setForegroundColor = useCallback((color: string) => {
    setState(prev => ({
      ...prev,
      style: { ...prev.style, foregroundColor: color },
    }));
  }, []);

  const setBackgroundColor = useCallback((color: string) => {
    setState(prev => ({
      ...prev,
      style: { ...prev.style, backgroundColor: color },
    }));
  }, []);

  const setErrorCorrectionLevel = useCallback((level: 'L' | 'M' | 'Q' | 'H') => {
    setState(prev => ({
      ...prev,
      style: { ...prev.style, errorCorrectionLevel: level },
    }));
  }, []);

  const setMargin = useCallback((margin: number) => {
    setState(prev => ({
      ...prev,
      style: { ...prev.style, margin },
    }));
  }, []);

  const setLogoUrl = useCallback((url: string | undefined) => {
    setState(prev => ({
      ...prev,
      style: { ...prev.style, logoUrl: url },
    }));
  }, []);

  const setLogoSize = useCallback((size: number) => {
    setState(prev => ({
      ...prev,
      style: { ...prev.style, logoSize: size },
    }));
  }, []);

  // Options actions
  const setExpiresAt = useCallback((date: string) => {
    setState(prev => ({ ...prev, expiresAt: date }));
  }, []);

  const setPasswordEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      passwordEnabled: enabled,
      password: enabled ? prev.password : '',
    }));
  }, []);

  const setPassword = useCallback((password: string) => {
    setState(prev => ({ ...prev, password }));
  }, []);

  const setScheduledEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      scheduledEnabled: enabled,
      activeFrom: enabled ? prev.activeFrom : '',
    }));
  }, []);

  const setActiveFrom = useCallback((date: string) => {
    setState(prev => ({ ...prev, activeFrom: date }));
  }, []);

  const setActiveUntil = useCallback((date: string) => {
    setState(prev => ({ ...prev, activeUntil: date }));
  }, []);

  const setShowLandingPage = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showLandingPage: show }));
  }, []);

  const setLandingPageTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, landingPageTitle: title }));
  }, []);

  const setLandingPageDescription = useCallback((desc: string) => {
    setState(prev => ({ ...prev, landingPageDescription: desc }));
  }, []);

  const setLandingPageButtonText = useCallback((text: string) => {
    setState(prev => ({ ...prev, landingPageButtonText: text }));
  }, []);

  const setLandingPageTheme = useCallback((theme: 'dark' | 'light') => {
    setState(prev => ({ ...prev, landingPageTheme: theme }));
  }, []);

  // Generation actions
  const setEntryStatus = useCallback((
    id: string,
    status: BulkEntry['status'],
    previewUrl?: string,
    error?: string
  ) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.map(entry =>
        entry.id === id
          ? { ...entry, status, previewUrl, error }
          : entry
      ),
    }));
  }, []);

  const setIsGenerating = useCallback((generating: boolean) => {
    setState(prev => ({ ...prev, isGenerating: generating }));
  }, []);

  const setIsSaving = useCallback((saving: boolean) => {
    setState(prev => ({ ...prev, isSaving: saving }));
  }, []);

  const setGenerationProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, generationProgress: progress }));
  }, []);

  const setSavedCount = useCallback((count: number) => {
    setState(prev => ({ ...prev, savedCount: count }));
  }, []);

  const setSaveError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, saveError: error }));
  }, []);

  // Reset
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const actions: BulkActions = useMemo(() => ({
    setStep,
    nextStep,
    prevStep,
    canProceed,
    setRawInput,
    parseInput,
    removeEntry,
    clearEntries,
    setStyle,
    setForegroundColor,
    setBackgroundColor,
    setErrorCorrectionLevel,
    setMargin,
    setLogoUrl,
    setLogoSize,
    setExpiresAt,
    setPasswordEnabled,
    setPassword,
    setScheduledEnabled,
    setActiveFrom,
    setActiveUntil,
    setShowLandingPage,
    setLandingPageTitle,
    setLandingPageDescription,
    setLandingPageButtonText,
    setLandingPageTheme,
    setEntryStatus,
    setIsGenerating,
    setIsSaving,
    setGenerationProgress,
    setSavedCount,
    setSaveError,
    reset,
  }), [
    setStep, nextStep, prevStep, canProceed,
    setRawInput, parseInput, removeEntry, clearEntries,
    setStyle, setForegroundColor, setBackgroundColor, setErrorCorrectionLevel,
    setMargin, setLogoUrl, setLogoSize,
    setExpiresAt, setPasswordEnabled, setPassword, setScheduledEnabled,
    setActiveFrom, setActiveUntil, setShowLandingPage, setLandingPageTitle,
    setLandingPageDescription, setLandingPageButtonText, setLandingPageTheme,
    setEntryStatus, setIsGenerating, setIsSaving, setGenerationProgress,
    setSavedCount, setSaveError, reset,
  ]);

  return [state, actions];
}

export { DEFAULT_STYLE, MAX_ENTRIES, STEPS };
