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
  | 'linkedin'
  | 'x'
  | 'tiktok'
  | 'snapchat'
  | 'threads'
  | 'youtube'
  | 'pinterest'
  | 'spotify'
  | 'reddit'
  | 'twitch'
  | 'discord'
  | 'apps'
  // Reviews (free tier)
  | 'google-review'
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
  | 'social'
  // Feedback (free tier)
  | 'feedback'
  // Events (free tier)
  | 'event'
  // Location (free tier)
  | 'geo';

export interface GradientOptions {
  enabled: boolean;
  type: 'linear' | 'radial';
  startColor: string;
  endColor: string;
  angle?: number; // For linear gradient, in degrees (0-360)
}

// Logo shape options
export type LogoShape = 'square' | 'rounded' | 'circle';

// Module patterns (6 options from qr-code-styling)
export type ModuleShape =
  | 'square'       // Standard square modules (default)
  | 'dots'         // Circular dots
  | 'rounded'      // Rounded squares
  | 'extraRounded' // More pronounced rounding
  | 'classy'       // Classy square pattern
  | 'classyRounded'; // Classy with rounded corners

// Corner square styles (finder pattern outer)
export type CornerSquareShape =
  | 'square'       // Standard square (default)
  | 'dot'          // Circular
  | 'extraRounded' // Extra rounded corners
  | 'dots'         // Dots style
  | 'rounded'      // Rounded corners
  | 'classy'       // Classy style
  | 'classyRounded'; // Classy rounded

// Corner dot styles (finder pattern inner)
export type CornerDotShape =
  | 'square'       // Standard square (default)
  | 'dot'          // Circular dot
  | 'dots'         // Dots style
  | 'rounded'      // Rounded
  | 'extraRounded' // Extra rounded
  | 'classy'       // Classy style
  | 'classyRounded'; // Classy rounded

// Frame configuration (decorative border)
export interface FrameOptions {
  enabled: boolean;
  thickness: number;       // 10-50px
  color: string;           // Hex color
  radius: string;          // '0%' to '50%' (corner rounding)
  backgroundColor?: string;
  text?: {
    top?: string;
    bottom?: string;
  };
  textStyle?: {
    fontColor: string;
    fontSize: number;      // 10-24px
  };
}

export interface QRStyleOptions {
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  width: number;
  logoUrl?: string;    // URL to uploaded logo image
  logoSize?: number;   // Logo size as % of QR code (10-35, default 20)
  logoShape?: LogoShape;  // Logo mask shape (default: 'square')
  logoMargin?: number;    // Logo margin in px (0-20, default: 4)
  logoBackground?: { enabled: boolean; color: string }; // Logo background fill
  gradient?: GradientOptions; // Optional gradient for foreground
  // Advanced pattern options (Pro feature)
  moduleShape?: ModuleShape;              // Data dot shape
  cornerSquareShape?: CornerSquareShape;  // Finder pattern outer shape
  cornerDotShape?: CornerDotShape;        // Finder pattern inner shape
  frame?: FrameOptions;                   // Decorative frame (Pro feature)
}

// Pro-only style features
export const PRO_STYLE_FEATURES = [
  'moduleShape',
  'cornerSquareShape',
  'cornerDotShape',
  'frame',
  'gradient',
  'logoUrl',
  'logoShape',
  'logoMargin',
  'logoBackground',
] as const;

// Patterns that may benefit from higher error correction for reliable scanning
export const HIGH_EC_PATTERNS: ModuleShape[] = [];

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

export interface LinkedInContent {
  type: 'linkedin';
  username: string;
}

export interface XContent {
  type: 'x';
  username: string;
}

export interface TikTokContent {
  type: 'tiktok';
  username: string;
}

export interface SnapchatContent {
  type: 'snapchat';
  username: string;
}

export interface ThreadsContent {
  type: 'threads';
  username: string;
}

export interface YouTubeContent {
  type: 'youtube';
  videoId: string;      // Extracted video ID
  videoUrl?: string;    // Original URL for display
}

export interface PinterestContent {
  type: 'pinterest';
  username: string;
}

export interface SpotifyContent {
  type: 'spotify';
  spotifyUrl: string;       // Original URL for display
  spotifyId: string;        // Extracted ID (track/album/playlist/artist ID)
  contentType: 'track' | 'album' | 'playlist' | 'artist' | 'show' | 'episode';
}

export interface RedditContent {
  type: 'reddit';
  username?: string;        // For user profiles (u/username)
  subreddit?: string;       // For subreddits (r/subreddit)
  contentType: 'user' | 'subreddit';
}

export interface TwitchContent {
  type: 'twitch';
  username: string;
}

export interface DiscordContent {
  type: 'discord';
  inviteCode: string;
}

export interface AppsContent {
  type: 'apps';
  appStoreUrl?: string;
  playStoreUrl?: string;
  fallbackUrl?: string;
}

// === Reviews ===

export interface GoogleReviewContent {
  type: 'google-review';
  placeId: string;        // Google Place ID (e.g., ChIJ...)
  businessName: string;   // For landing page display
  accentColor?: string;   // Landing page accent color
}

export interface EventContent {
  type: 'event';
  title: string;
  description?: string;
  startDate: string;      // ISO 8601 datetime
  endDate: string;        // ISO 8601 datetime
  location?: string;
  allDay?: boolean;
  timezone?: string;      // e.g., 'America/New_York'
  url?: string;           // Event website
  accentColor?: string;   // Landing page accent color
}

export interface FeedbackContent {
  type: 'feedback';
  businessName: string;
  formTitle?: string;           // default: "How was your experience?"
  ratingType: 'stars' | 'emoji' | 'numeric';
  commentEnabled: boolean;
  emailEnabled: boolean;
  thankYouMessage?: string;     // default: "Thank you for your feedback!"
  accentColor?: string;         // default: #f59e0b (amber)
  ctaUrl?: string;              // Optional CTA button URL on thank-you screen
  ctaLabel?: string;            // Optional CTA button label (default: "Visit Our Website")
}

export interface GeoContent {
  type: 'geo';
  latitude: number;       // -90 to 90
  longitude: number;      // -180 to 180
  locationName?: string;  // Display name
  address?: string;       // Full address text
  accentColor?: string;   // Landing page accent color
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
    platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'github' | 'facebook' | 'twitch' | 'discord';
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
    platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'github' | 'facebook' | 'twitch' | 'discord';
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
  | LinkedInContent
  | XContent
  | TikTokContent
  | SnapchatContent
  | ThreadsContent
  | YouTubeContent
  | PinterestContent
  | SpotifyContent
  | RedditContent
  | TwitchContent
  | DiscordContent
  | AppsContent
  // Reviews & Feedback
  | GoogleReviewContent
  | FeedbackContent
  // Events
  | EventContent
  // Location
  | GeoContent
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
  margin: 4,
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
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  threads: 'Threads',
  youtube: 'YouTube Video',
  pinterest: 'Pinterest',
  spotify: 'Spotify',
  reddit: 'Reddit',
  twitch: 'Twitch',
  discord: 'Discord',
  apps: 'App Download',
  // Reviews & Feedback
  'google-review': 'Google Review',
  feedback: 'Feedback Form',
  // Events
  event: 'Event / Calendar',
  // Location
  geo: 'Location',
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
  linkedin: 'linkedin',
  x: 'twitter',
  tiktok: 'music',
  snapchat: 'ghost',
  threads: 'at-sign',
  youtube: 'play-circle',
  pinterest: 'pin',
  spotify: 'music',
  reddit: 'message-circle',
  twitch: 'tv',
  discord: 'message-circle',
  apps: 'smartphone',
  // Reviews & Feedback
  'google-review': 'star',
  feedback: 'clipboard-check',
  // Events
  event: 'calendar',
  // Location
  geo: 'map-pin',
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
  social: ['whatsapp', 'facebook', 'instagram', 'linkedin', 'x', 'tiktok', 'snapchat', 'threads', 'youtube', 'pinterest', 'spotify', 'reddit', 'twitch', 'discord', 'apps'] as const,
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
  'google-review',
  'feedback',
  'youtube',
  'spotify',
  'event',
  'geo',
  'pdf', 'images', 'video', 'mp3',
  'menu', 'business', 'links', 'coupon', 'social',
];
