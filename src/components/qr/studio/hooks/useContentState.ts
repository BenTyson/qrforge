'use client';

import { useState, useCallback } from 'react';
import { isContentValid as checkContentValid } from '@/lib/qr/validation';
import type { QRContent, QRContentType } from '@/lib/qr/types';
import { QR_TYPE_CATEGORIES } from '@/lib/qr/types';
import type { Template } from '@/lib/templates/types';
import type { QRStyleOptions } from '@/lib/qr/types';
import { DEFAULT_STYLE } from './useStyleState';

export interface ContentState {
  selectedCategory: string | null;
  selectedType: QRContentType | null;
  content: QRContent | null;
  qrName: string;
  templateId: string | null;
  templateName: string;
}

export interface ContentActions {
  selectCategory: (category: string | null) => void;
  selectType: (type: QRContentType) => void;
  loadTemplate: (template: Template) => void;
  clearTemplate: () => void;
  setContent: (content: QRContent | null) => void;
  setQrName: (name: string) => void;
  isContentValid: () => boolean;
  getFilename: () => string;
  /** Reset content state to initial values */
  resetContent: () => void;
}

// Helper to get category for a QR type
function getCategoryForType(type: QRContentType): string | null {
  if (QR_TYPE_CATEGORIES.basic.includes(type as typeof QR_TYPE_CATEGORIES.basic[number])) {
    return 'basic';
  }
  if (QR_TYPE_CATEGORIES.social.includes(type as typeof QR_TYPE_CATEGORIES.social[number])) {
    return 'social';
  }
  if (QR_TYPE_CATEGORIES.media.includes(type as typeof QR_TYPE_CATEGORIES.media[number])) {
    return 'media';
  }
  if (QR_TYPE_CATEGORIES.landing.includes(type as typeof QR_TYPE_CATEGORIES.landing[number])) {
    return 'landing';
  }
  return null;
}

interface UseContentStateProps {
  mode: 'create' | 'edit';
  /** Called when a template is loaded to apply style */
  onStyleChange: (style: QRStyleOptions) => void;
  /** Called when a type is selected in create mode to advance step */
  onTypeSelected: () => void;
}

export function useContentState({ mode, onStyleChange, onTypeSelected }: UseContentStateProps): [ContentState, ContentActions] {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<QRContentType | null>(null);
  const [content, setContent] = useState<QRContent | null>(null);
  const [qrName, setQrName] = useState('');
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');

  const isContentValid = useCallback((): boolean => {
    return checkContentValid(content, selectedType);
  }, [content, selectedType]);

  const selectType = useCallback((type: QRContentType) => {
    setSelectedType(type);
    setContent(null); // Reset content when type changes
    if (mode === 'create') {
      onTypeSelected();
    }
  }, [mode, onTypeSelected]);

  const loadTemplate = useCallback((template: Template) => {
    setTemplateId(template.id);
    setTemplateName(template.name);
    setSelectedType(template.qrType);
    setSelectedCategory(getCategoryForType(template.qrType));
    onStyleChange({ ...DEFAULT_STYLE, ...template.style });
    setContent(null); // Reset content - user will fill in
  }, [onStyleChange]);

  const clearTemplate = useCallback(() => {
    setTemplateId(null);
    setTemplateName('');
  }, []);

  const getFilename = useCallback(() => {
    if (qrName.trim()) {
      return `qrwolf-${qrName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    }
    return `qrwolf-${selectedType || 'code'}`;
  }, [qrName, selectedType]);

  const resetContent = useCallback(() => {
    setSelectedCategory(null);
    setSelectedType(null);
    setContent(null);
    setQrName('');
    setTemplateId(null);
    setTemplateName('');
  }, []);

  const state: ContentState = {
    selectedCategory,
    selectedType,
    content,
    qrName,
    templateId,
    templateName,
  };

  const actions: ContentActions = {
    selectCategory: setSelectedCategory,
    selectType,
    loadTemplate,
    clearTemplate,
    setContent,
    setQrName,
    isContentValid,
    getFilename,
    resetContent,
  };

  return [state, actions];
}
