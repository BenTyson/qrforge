'use client';

import type { QRContentType } from '@/lib/qr/types';

export interface TypeOption {
  id: string;
  name: string;
  description: string;
  pro?: boolean;
}

export interface TypeCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  pro?: boolean;
  types: TypeOption[];
}

// Type categories with visual hierarchy
export const TYPE_CATEGORIES: TypeCategory[] = [
  {
    id: 'links',
    name: 'Website & Links',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    types: [
      { id: 'url', name: 'Website URL', description: 'Link to any website' },
      { id: 'apps', name: 'App Download', description: 'App Store & Play Store links' },
    ],
  },
  {
    id: 'social',
    name: 'Social Media',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    types: [
      { id: 'whatsapp', name: 'WhatsApp', description: 'Start a chat instantly' },
      { id: 'instagram', name: 'Instagram', description: 'Link to your profile' },
      { id: 'facebook', name: 'Facebook', description: 'Link to page or profile' },
    ],
  },
  {
    id: 'contact',
    name: 'Contact Info',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    types: [
      { id: 'vcard', name: 'Contact Card', description: 'Share contact details' },
      { id: 'email', name: 'Email', description: 'Pre-filled email' },
      { id: 'phone', name: 'Phone', description: 'Click to call' },
      { id: 'sms', name: 'SMS', description: 'Pre-filled text message' },
    ],
  },
  {
    id: 'utility',
    name: 'Utility',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" />
      </svg>
    ),
    types: [
      { id: 'wifi', name: 'WiFi', description: 'Share network credentials' },
      { id: 'text', name: 'Plain Text', description: 'Any text content' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    pro: true,
    types: [
      { id: 'menu', name: 'Restaurant Menu', description: 'Digital menu display', pro: true },
      { id: 'business', name: 'Business Card', description: 'Digital business card', pro: true },
      { id: 'links', name: 'Link List', description: 'Multiple links page', pro: true },
      { id: 'coupon', name: 'Coupon', description: 'Promotional offers', pro: true },
      { id: 'social', name: 'Social Profile', description: 'All social links', pro: true },
    ],
  },
  {
    id: 'media',
    name: 'Media Files',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    pro: true,
    types: [
      { id: 'pdf', name: 'PDF Document', description: 'Share documents', pro: true },
      { id: 'images', name: 'Image Gallery', description: 'Photo collection', pro: true },
      { id: 'video', name: 'Video', description: 'Video content', pro: true },
      { id: 'mp3', name: 'Audio', description: 'Music or podcasts', pro: true },
    ],
  },
];

// Color presets for style step
export const COLOR_PRESETS = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Inverted', fg: '#ffffff', bg: '#000000' },
  { name: 'Brand', fg: '#14b8a6', bg: '#0f172a' },
  { name: 'Ocean', fg: '#0ea5e9', bg: '#0c4a6e' },
  { name: 'Forest', fg: '#22c55e', bg: '#14532d' },
  { name: 'Sunset', fg: '#f97316', bg: '#431407' },
  { name: 'Berry', fg: '#ec4899', bg: '#500724' },
  { name: 'Royal', fg: '#a855f7', bg: '#3b0764' },
];

// Types that have landing page previews
export const PREVIEWABLE_TYPES: QRContentType[] = ['menu', 'business', 'links', 'coupon', 'social'];

// Wizard step types
export type WizardStep = 'type' | 'content' | 'style' | 'options' | 'download';

// Step configuration
export const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'type', label: 'Type' },
  { id: 'content', label: 'Content' },
  { id: 'style', label: 'Style' },
  { id: 'options', label: 'Options' },
  { id: 'download', label: 'Download' },
];
