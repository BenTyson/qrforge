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
      { id: 'linkedin', name: 'LinkedIn', description: 'Link to your profile' },
      { id: 'x', name: 'X (Twitter)', description: 'Link to your profile' },
      { id: 'tiktok', name: 'TikTok', description: 'Link to your profile' },
      { id: 'snapchat', name: 'Snapchat', description: 'Add me on Snapchat' },
      { id: 'threads', name: 'Threads', description: 'Link to your profile' },
      { id: 'youtube', name: 'YouTube', description: 'Share a video' },
      { id: 'pinterest', name: 'Pinterest', description: 'Link to your profile' },
      { id: 'spotify', name: 'Spotify', description: 'Share music or podcasts' },
      { id: 'reddit', name: 'Reddit', description: 'Link to profile or subreddit' },
      { id: 'twitch', name: 'Twitch', description: 'Link to your channel' },
      { id: 'discord', name: 'Discord', description: 'Share server invite' },
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
    id: 'reviews',
    name: 'Reviews & Feedback',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    types: [
      { id: 'google-review', name: 'Google Review', description: 'Collect Google reviews' },
      { id: 'feedback', name: 'Feedback Form', description: 'Collect customer feedback' },
    ],
  },
  {
    id: 'events',
    name: 'Events',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    types: [
      { id: 'event', name: 'Event / Calendar', description: 'Add to calendar invite' },
    ],
  },
  {
    id: 'location',
    name: 'Location',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    types: [
      { id: 'geo', name: 'Location / Map', description: 'Share a map location' },
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

// Color presets for style step - all have 7:1+ contrast ratio (Excellent)
export const COLOR_PRESETS = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },    // 21:1 - Black on white
  { name: 'Inverted', fg: '#ffffff', bg: '#000000' },   // 21:1 - White on black
  { name: 'Navy', fg: '#1e3a5f', bg: '#ffffff' },       // 10:1 - Dark navy on white
  { name: 'Forest', fg: '#14532d', bg: '#f0fdf4' },     // 12:1 - Dark green on mint
  { name: 'Ocean', fg: '#0c4a6e', bg: '#e0f2fe' },      // 9:1 - Dark blue on sky
  { name: 'Sunset', fg: '#7c2d12', bg: '#fff7ed' },     // 10:1 - Brown on cream
  { name: 'Berry', fg: '#701a45', bg: '#fce7f3' },      // 9:1 - Magenta on pink
  { name: 'Royal', fg: '#4c1d95', bg: '#f3e8ff' },      // 10:1 - Purple on lavender
  { name: 'Charcoal', fg: '#374151', bg: '#f9fafb' },   // 10:1 - Gray on off-white
  { name: 'Espresso', fg: '#451a03', bg: '#fffbeb' },   // 16:1 - Dark brown on amber
  { name: 'Slate', fg: '#0f172a', bg: '#e2e8f0' },      // 15:1 - Dark slate on light
  { name: 'Wine', fg: '#4a0420', bg: '#fff1f2' },       // 14:1 - Dark red on rose
  { name: 'Teal', fg: '#134e4a', bg: '#f0fdfa' },       // 11:1 - Dark teal on mint
  { name: 'Indigo', fg: '#312e81', bg: '#eef2ff' },     // 12:1 - Dark indigo on blue
];

// Types that have landing page previews
export const PREVIEWABLE_TYPES: QRContentType[] = ['menu', 'business', 'links', 'coupon', 'social', 'feedback'];

// Flattened type metadata for use in ArticleCTA and other components
export const QR_TYPE_METADATA = TYPE_CATEGORIES.flatMap(cat => cat.types)
  .reduce((acc, type) => {
    acc[type.id] = { name: type.name, description: type.description };
    return acc;
  }, {} as Record<string, { name: string; description: string }>);

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
