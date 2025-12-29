export type QRContentType =
  // Basic types
  | 'url'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'email'
  | 'phone'
  | 'sms'
  // Simple URL types
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'apps'
  // File upload types (Pro+)
  | 'pdf'
  | 'images'
  | 'video'
  | 'mp3'
  // Landing page types (Pro+)
  | 'menu'
  | 'business'
  | 'links'
  | 'coupon'
  | 'social';

export interface QRStyleOptions {
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  width: number;
  logoUrl?: string;    // URL to uploaded logo image
  logoSize?: number;   // Logo size as % of QR code (10-30, default 20)
}

export interface URLContent {
  type: 'url';
  url: string;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface WiFiContent {
  type: 'wifi';
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardContent {
  type: 'vcard';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  organization?: string;
  title?: string;
  url?: string;
}

export interface EmailContent {
  type: 'email';
  email: string;
  subject?: string;
  body?: string;
}

export interface PhoneContent {
  type: 'phone';
  phone: string;
}

export interface SMSContent {
  type: 'sms';
  phone: string;
  message?: string;
}

// === Simple URL Types ===

export interface WhatsAppContent {
  type: 'whatsapp';
  phone: string;
  message?: string;
}

export interface FacebookContent {
  type: 'facebook';
  profileUrl: string;
}

export interface InstagramContent {
  type: 'instagram';
  username: string;
}

export interface AppsContent {
  type: 'apps';
  appStoreUrl?: string;
  playStoreUrl?: string;
  fallbackUrl?: string;
}

// === File Upload Types (Pro+) ===

export interface PDFContent {
  type: 'pdf';
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

export interface ImagesContent {
  type: 'images';
  images: Array<{
    url: string;
    fileName: string;
    fileSize: number;
    caption?: string;
  }>;
  title?: string;
}

export interface VideoContent {
  type: 'video';
  videoUrl?: string;
  embedUrl?: string;
  title?: string;
  thumbnail?: string;
}

export interface MP3Content {
  type: 'mp3';
  audioUrl?: string;
  embedUrl?: string;
  title?: string;
  artist?: string;
  coverImage?: string;
}

// === Landing Page Types (Pro+) ===

export interface MenuContent {
  type: 'menu';
  restaurantName: string;
  categories: Array<{
    name: string;
    items: Array<{
      name: string;
      description?: string;
      price: string;
      image?: string;
      dietary?: ('vegetarian' | 'vegan' | 'gluten-free')[];
    }>;
  }>;
  logoUrl?: string;
  accentColor?: string;
}

export interface BusinessContent {
  type: 'business';
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  photoUrl?: string;
  socialLinks?: Array<{
    platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'github';
    url: string;
  }>;
  bio?: string;
  accentColor?: string;
}

export interface LinksContent {
  type: 'links';
  title: string;
  description?: string;
  avatarUrl?: string;
  links: Array<{
    title: string;
    url: string;
    icon?: string;
  }>;
  socialLinks?: Array<{
    platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin';
    url: string;
  }>;
  accentColor?: string;
}

export interface CouponContent {
  type: 'coupon';
  businessName: string;
  logoUrl?: string;
  headline: string;
  description: string;
  code?: string;
  terms?: string;
  validUntil?: string;
  accentColor?: string;
}

export interface SocialContent {
  type: 'social';
  name: string;
  bio?: string;
  avatarUrl?: string;
  links: Array<{
    platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin' | 'github' | 'twitch' | 'discord';
    handle: string;
    url: string;
  }>;
  accentColor?: string;
}

export type QRContent =
  // Basic types
  | URLContent
  | TextContent
  | WiFiContent
  | VCardContent
  | EmailContent
  | PhoneContent
  | SMSContent
  // Simple URL types
  | WhatsAppContent
  | FacebookContent
  | InstagramContent
  | AppsContent
  // File upload types
  | PDFContent
  | ImagesContent
  | VideoContent
  | MP3Content
  // Landing page types
  | MenuContent
  | BusinessContent
  | LinksContent
  | CouponContent
  | SocialContent;

export interface QRCodeData {
  id?: string;
  name: string;
  content: QRContent;
  style: QRStyleOptions;
  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_STYLE: QRStyleOptions = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 256,
};

export const QR_TYPE_LABELS: Record<QRContentType, string> = {
  // Basic types
  url: 'Website URL',
  text: 'Plain Text',
  wifi: 'WiFi Network',
  vcard: 'Contact Card',
  email: 'Email',
  phone: 'Phone Number',
  sms: 'SMS Message',
  // Simple URL types
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
  apps: 'App Download',
  // File upload types
  pdf: 'PDF Document',
  images: 'Image Gallery',
  video: 'Video',
  mp3: 'Audio/Music',
  // Landing page types
  menu: 'Restaurant Menu',
  business: 'Business Card',
  links: 'Link List',
  coupon: 'Coupon',
  social: 'Social Profiles',
};

export const QR_TYPE_ICONS: Record<QRContentType, string> = {
  // Basic types
  url: 'link',
  text: 'text',
  wifi: 'wifi',
  vcard: 'user',
  email: 'mail',
  phone: 'phone',
  sms: 'message-square',
  // Simple URL types
  whatsapp: 'message-circle',
  facebook: 'facebook',
  instagram: 'instagram',
  apps: 'smartphone',
  // File upload types
  pdf: 'file-text',
  images: 'images',
  video: 'video',
  mp3: 'music',
  // Landing page types
  menu: 'utensils',
  business: 'briefcase',
  links: 'list',
  coupon: 'ticket',
  social: 'share-2',
};

// Type categories for UI grouping
export const QR_TYPE_CATEGORIES = {
  basic: ['url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms'] as const,
  social: ['whatsapp', 'facebook', 'instagram', 'apps'] as const,
  media: ['pdf', 'images', 'video', 'mp3'] as const,
  landing: ['menu', 'business', 'links', 'coupon', 'social'] as const,
};

// Types requiring Pro+ subscription
export const PRO_ONLY_TYPES: QRContentType[] = [
  'pdf', 'images', 'video', 'mp3',
  'menu', 'business', 'links', 'coupon', 'social',
];

// Types that require dynamic QR codes (landing pages)
export const DYNAMIC_REQUIRED_TYPES: QRContentType[] = [
  'pdf', 'images', 'video', 'mp3',
  'menu', 'business', 'links', 'coupon', 'social',
];
