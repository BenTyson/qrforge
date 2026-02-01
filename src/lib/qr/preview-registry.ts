/**
 * Preview registry — maps dynamic QR types to their content-step preview components.
 *
 * These are the sidebar preview panels shown on the content step for types
 * that have rich landing-page previews (menu, business, links, etc.).
 */

import type { ComponentType } from 'react';
import type { QRContentType } from './types';

import { MenuPreview } from '@/components/menu/MenuPreview';
import { LinksPreview } from '@/components/links/LinksPreview';
import { BusinessPreview } from '@/components/business/BusinessPreview';
import { SocialPreview } from '@/components/social/SocialPreview';
import { CouponPreview } from '@/components/coupon/CouponPreview';
import { GalleryPreview } from '@/components/gallery/GalleryPreview';
import { PDFPreview } from '@/components/pdf/PDFPreview';
import { VideoPreview } from '@/components/video/VideoPreview';
import { AudioPreview } from '@/components/audio/AudioPreview';
import { FeedbackPreview } from '@/components/feedback/FeedbackPreview';
import { TextPreview } from '@/components/text/TextPreview';
import { GoogleReviewPreview } from '@/components/review/GoogleReviewPreview';
import { MultiReviewPreview } from '@/components/review/MultiReviewPreview';
import { WiFiPreview } from '@/components/wifi/WiFiPreview';
import { VCardPreview } from '@/components/vcard/VCardPreview';
import { SpotifyPreview } from '@/components/spotify/SpotifyPreview';
import { YouTubePreview } from '@/components/youtube/YouTubePreview';
import { EventPreview } from '@/components/event/EventPreview';
import { GeoPreview } from '@/components/location/GeoPreview';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PREVIEW_COMPONENTS: Partial<Record<QRContentType, ComponentType<{ content: any }>>> = {
  menu: MenuPreview,
  links: LinksPreview,
  business: BusinessPreview,
  social: SocialPreview,
  coupon: CouponPreview,
  images: GalleryPreview,
  pdf: PDFPreview,
  video: VideoPreview,
  mp3: AudioPreview,
  feedback: FeedbackPreview,
  text: TextPreview,
  'google-review': GoogleReviewPreview,
  'multi-review': MultiReviewPreview,
  wifi: WiFiPreview,
  vcard: VCardPreview,
  spotify: SpotifyPreview,
  youtube: YouTubePreview,
  event: EventPreview,
  geo: GeoPreview,
};

/**
 * Returns the content-step preview component for the given type, or undefined
 * if the type uses the standard QRStudioPreview (QR code rendering).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPreviewComponent(type: QRContentType): ComponentType<{ content: any }> | undefined {
  return PREVIEW_COMPONENTS[type];
}
