import type { QRContentType, QRStyleOptions } from '@/lib/qr/types';

export type TemplateCategory =
  | 'restaurant'
  | 'business'
  | 'marketing'
  | 'events'
  | 'social'
  | 'retail'
  | 'creative';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  qrType: QRContentType;
  tags: string[];
  tier: 'free' | 'pro';
  featured?: boolean;
  style: Partial<QRStyleOptions>;
}

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string; icon: string }[] = [
  { id: 'restaurant', label: 'Restaurant', icon: 'utensils' },
  { id: 'business', label: 'Business', icon: 'briefcase' },
  { id: 'marketing', label: 'Marketing', icon: 'megaphone' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'social', label: 'Social', icon: 'share-2' },
  { id: 'retail', label: 'Retail', icon: 'shopping-bag' },
  { id: 'creative', label: 'Creative', icon: 'palette' },
];

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  restaurant: 'Restaurant',
  business: 'Business',
  marketing: 'Marketing',
  events: 'Events',
  social: 'Social',
  retail: 'Retail',
  creative: 'Creative',
};
