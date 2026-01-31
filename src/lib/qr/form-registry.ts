/**
 * Form registry — maps QRContentType to its form component.
 *
 * Adding a new QR type only requires adding one entry here instead
 * of editing the switch statement in QRStudio.tsx.
 */

import type { ComponentType } from 'react';
import type { QRContent, QRContentType } from './types';

export interface QRFormProps<T = Partial<QRContent>> {
  content: T;
  onChange: (content: QRContent | null) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormComponent = ComponentType<QRFormProps<any>>;

// Lazy-loaded form components — keeps the main bundle lean
const FORM_REGISTRY: Record<string, () => Promise<{ default: FormComponent }>> = {
  whatsapp:       () => import('@/components/qr/forms/WhatsAppForm').then(m => ({ default: m.WhatsAppForm as FormComponent })),
  facebook:       () => import('@/components/qr/forms/FacebookForm').then(m => ({ default: m.FacebookForm as FormComponent })),
  instagram:      () => import('@/components/qr/forms/InstagramForm').then(m => ({ default: m.InstagramForm as FormComponent })),
  linkedin:       () => import('@/components/qr/forms/LinkedInForm').then(m => ({ default: m.LinkedInForm as FormComponent })),
  x:              () => import('@/components/qr/forms/XForm').then(m => ({ default: m.XForm as FormComponent })),
  tiktok:         () => import('@/components/qr/forms/TikTokForm').then(m => ({ default: m.TikTokForm as FormComponent })),
  snapchat:       () => import('@/components/qr/forms/SnapchatForm').then(m => ({ default: m.SnapchatForm as FormComponent })),
  threads:        () => import('@/components/qr/forms/ThreadsForm').then(m => ({ default: m.ThreadsForm as FormComponent })),
  youtube:        () => import('@/components/qr/forms/YouTubeForm').then(m => ({ default: m.YouTubeForm as FormComponent })),
  pinterest:      () => import('@/components/qr/forms/PinterestForm').then(m => ({ default: m.PinterestForm as FormComponent })),
  spotify:        () => import('@/components/qr/forms/SpotifyForm').then(m => ({ default: m.SpotifyForm as FormComponent })),
  reddit:         () => import('@/components/qr/forms/RedditForm').then(m => ({ default: m.RedditForm as FormComponent })),
  twitch:         () => import('@/components/qr/forms/TwitchForm').then(m => ({ default: m.TwitchForm as FormComponent })),
  discord:        () => import('@/components/qr/forms/DiscordForm').then(m => ({ default: m.DiscordForm as FormComponent })),
  apps:           () => import('@/components/qr/forms/AppsForm').then(m => ({ default: m.AppsForm as FormComponent })),
  'google-review': () => import('@/components/qr/forms/GoogleReviewForm').then(m => ({ default: m.GoogleReviewForm as FormComponent })),
  feedback:       () => import('@/components/qr/forms/FeedbackForm').then(m => ({ default: m.FeedbackForm as FormComponent })),
  event:          () => import('@/components/qr/forms/EventForm').then(m => ({ default: m.EventForm as FormComponent })),
  geo:            () => import('@/components/qr/forms/GeoForm').then(m => ({ default: m.GeoForm as FormComponent })),
  pdf:            () => import('@/components/qr/forms/PDFForm').then(m => ({ default: m.PDFForm as FormComponent })),
  images:         () => import('@/components/qr/forms/ImagesForm').then(m => ({ default: m.ImagesForm as FormComponent })),
  video:          () => import('@/components/qr/forms/VideoForm').then(m => ({ default: m.VideoForm as FormComponent })),
  mp3:            () => import('@/components/qr/forms/MP3Form').then(m => ({ default: m.MP3Form as FormComponent })),
  menu:           () => import('@/components/qr/forms/MenuForm').then(m => ({ default: m.MenuForm as FormComponent })),
  business:       () => import('@/components/qr/forms/BusinessForm').then(m => ({ default: m.BusinessForm as FormComponent })),
  links:          () => import('@/components/qr/forms/LinksForm').then(m => ({ default: m.LinksForm as FormComponent })),
  coupon:         () => import('@/components/qr/forms/CouponForm').then(m => ({ default: m.CouponForm as FormComponent })),
  social:         () => import('@/components/qr/forms/SocialForm').then(m => ({ default: m.SocialForm as FormComponent })),
};

/**
 * Eagerly-imported form component map for synchronous rendering in ContentStep.
 * Uses the same keys as QRContentType. Basic types (url, text, wifi, vcard, email, phone, sms)
 * are rendered inline — only "pro" / complex types go through this registry.
 */
import { WhatsAppForm } from '@/components/qr/forms/WhatsAppForm';
import { FacebookForm } from '@/components/qr/forms/FacebookForm';
import { InstagramForm } from '@/components/qr/forms/InstagramForm';
import { LinkedInForm } from '@/components/qr/forms/LinkedInForm';
import { XForm } from '@/components/qr/forms/XForm';
import { TikTokForm } from '@/components/qr/forms/TikTokForm';
import { SnapchatForm } from '@/components/qr/forms/SnapchatForm';
import { ThreadsForm } from '@/components/qr/forms/ThreadsForm';
import { YouTubeForm } from '@/components/qr/forms/YouTubeForm';
import { PinterestForm } from '@/components/qr/forms/PinterestForm';
import { SpotifyForm } from '@/components/qr/forms/SpotifyForm';
import { RedditForm } from '@/components/qr/forms/RedditForm';
import { TwitchForm } from '@/components/qr/forms/TwitchForm';
import { DiscordForm } from '@/components/qr/forms/DiscordForm';
import { AppsForm } from '@/components/qr/forms/AppsForm';
import { GoogleReviewForm } from '@/components/qr/forms/GoogleReviewForm';
import { FeedbackForm } from '@/components/qr/forms/FeedbackForm';
import { EventForm } from '@/components/qr/forms/EventForm';
import { GeoForm } from '@/components/qr/forms/GeoForm';
import { PDFForm } from '@/components/qr/forms/PDFForm';
import { ImagesForm } from '@/components/qr/forms/ImagesForm';
import { VideoForm } from '@/components/qr/forms/VideoForm';
import { MP3Form } from '@/components/qr/forms/MP3Form';
import { MenuForm } from '@/components/qr/forms/MenuForm';
import { BusinessForm } from '@/components/qr/forms/BusinessForm';
import { LinksForm } from '@/components/qr/forms/LinksForm';
import { CouponForm } from '@/components/qr/forms/CouponForm';
import { SocialForm } from '@/components/qr/forms/SocialForm';

const FORM_COMPONENTS: Partial<Record<QRContentType, FormComponent>> = {
  whatsapp: WhatsAppForm,
  facebook: FacebookForm,
  instagram: InstagramForm,
  linkedin: LinkedInForm,
  x: XForm,
  tiktok: TikTokForm,
  snapchat: SnapchatForm,
  threads: ThreadsForm,
  youtube: YouTubeForm,
  pinterest: PinterestForm,
  spotify: SpotifyForm,
  reddit: RedditForm,
  twitch: TwitchForm,
  discord: DiscordForm,
  apps: AppsForm,
  'google-review': GoogleReviewForm,
  feedback: FeedbackForm,
  event: EventForm,
  geo: GeoForm,
  pdf: PDFForm,
  images: ImagesForm,
  video: VideoForm,
  mp3: MP3Form,
  menu: MenuForm,
  business: BusinessForm,
  links: LinksForm,
  coupon: CouponForm,
  social: SocialForm,
};

/**
 * Returns the form component for the given content type, or undefined for
 * basic types (url, text, wifi, vcard, email, phone, sms) which use inline forms.
 */
export function getFormComponent(type: QRContentType): FormComponent | undefined {
  return FORM_COMPONENTS[type];
}

/**
 * Returns the lazy form loader. Useful if you want code-split loading.
 */
export function getFormLoader(type: QRContentType) {
  return FORM_REGISTRY[type];
}

/** The basic types whose forms are rendered inline in ContentStep */
export const BASIC_FORM_TYPES: QRContentType[] = ['url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms'];
