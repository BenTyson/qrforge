/**
 * Unified validation module — single source of truth for QR content validation.
 *
 * Three tiers:
 *  - hasMinimalContent()  — loosest check, used by QRPreview to gate generation
 *  - isContentValid()     — UI gating (Continue button, save button)
 *  - validateContent()    — strictest, returns error messages (API / save)
 */

import type {
  QRContent,
  QRContentType,
  URLContent,
  TextContent,
  WiFiContent,
  VCardContent,
  EmailContent,
  PhoneContent,
  SMSContent,
  WhatsAppContent,
  FacebookContent,
  InstagramContent,
  LinkedInContent,
  XContent,
  TikTokContent,
  SnapchatContent,
  ThreadsContent,
  YouTubeContent,
  PinterestContent,
  SpotifyContent,
  RedditContent,
  TwitchContent,
  DiscordContent,
  AppsContent,
  GoogleReviewContent,
  MultiReviewContent,
  FeedbackContent,
  EventContent,
  GeoContent,
  PDFContent,
  ImagesContent,
  VideoContent,
  MP3Content,
  MenuContent,
  BusinessContent,
  LinksContent,
  CouponContent,
  SocialContent,
} from './types';

// ---------------------------------------------------------------------------
// hasMinimalContent – loosest check (preview gating)
// Returns true when there is *any* plausible data worth rendering a preview for.
// ---------------------------------------------------------------------------

export function hasMinimalContent(content: QRContent): boolean {
  switch (content.type) {
    case 'url':
      return !!content.url && content.url.length > 0;
    case 'text':
      return !!content.text && content.text.length > 0;
    case 'wifi':
      return !!content.ssid && content.ssid.length > 0;
    case 'vcard':
      return (!!content.firstName && content.firstName.length > 0) ||
             (!!content.lastName && content.lastName.length > 0);
    case 'email':
      return !!content.email && content.email.length > 0;
    case 'phone':
      return !!content.phone && content.phone.length > 0;
    case 'sms':
      return !!content.phone && content.phone.length > 0;
    case 'whatsapp':
      return !!content.phone && content.phone.length > 0;
    case 'facebook':
      return !!content.profileUrl && content.profileUrl.length > 0;
    case 'instagram':
    case 'linkedin':
    case 'x':
    case 'tiktok':
    case 'snapchat':
    case 'threads':
    case 'pinterest':
    case 'twitch':
      return !!content.username && content.username.length > 0;
    case 'youtube':
      return !!content.videoId && content.videoId.length > 0;
    case 'spotify':
      return !!content.spotifyId && content.spotifyId.length > 0;
    case 'reddit':
      return (!!content.username && content.username.length > 0) ||
             (!!content.subreddit && content.subreddit.length > 0);
    case 'discord':
      return !!content.inviteCode && content.inviteCode.length > 0;
    case 'apps':
      return (!!content.appStoreUrl && content.appStoreUrl.length > 0) ||
             (!!content.playStoreUrl && content.playStoreUrl.length > 0) ||
             (!!content.fallbackUrl && content.fallbackUrl.length > 0);
    case 'google-review':
      return !!content.placeId && content.placeId.length >= 20 &&
             !!content.businessName && content.businessName.length > 0;
    case 'multi-review':
      return !!content.businessName && content.businessName.length > 0 &&
             !!content.platforms && content.platforms.length > 0 &&
             content.platforms.some(p => !!p.url && p.url.length > 0);
    case 'feedback':
      return !!content.businessName && content.businessName.length > 0;
    case 'event': {
      if (!content.title || content.title.length === 0) return false;
      if (!content.startDate || content.startDate.length === 0) return false;
      if (!content.endDate || content.endDate.length === 0) return false;
      const start = new Date(content.startDate);
      const end = new Date(content.endDate);
      return end > start;
    }
    case 'geo':
      return content.latitude !== undefined && content.longitude !== undefined &&
             content.latitude >= -90 && content.latitude <= 90 &&
             content.longitude >= -180 && content.longitude <= 180;
    case 'pdf':
      return (!!content.fileUrl && content.fileUrl.length > 0) || (!!content.fileName && content.fileName.length > 0);
    case 'images':
      return !!content.images && content.images.length > 0;
    case 'video':
      return (!!content.videoUrl && content.videoUrl.length > 0) || (!!content.embedUrl && content.embedUrl.length > 0);
    case 'mp3':
      return (!!content.audioUrl && content.audioUrl.length > 0) || (!!content.embedUrl && content.embedUrl.length > 0);
    case 'menu':
      return !!content.restaurantName && content.restaurantName.length > 0;
    case 'business':
      return !!content.name && content.name.length > 0;
    case 'links':
      return !!content.title && content.title.length > 0;
    case 'coupon':
      return (!!content.businessName && content.businessName.length > 0) && (!!content.headline && content.headline.length > 0);
    case 'social':
      return !!content.name && content.name.length > 0;
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// isContentValid – medium strictness (UI gating: Continue button)
// Same as what useQRStudioState.isContentValid was doing inline.
// ---------------------------------------------------------------------------

export function isContentValid(content: QRContent | null, selectedType: QRContentType | null): boolean {
  if (!content || !selectedType) return false;

  switch (selectedType) {
    case 'url':
      return !!(content as URLContent).url?.trim();
    case 'text':
      return !!(content as TextContent).text?.trim();
    case 'wifi':
      return !!(content as WiFiContent).ssid?.trim();
    case 'vcard':
      return !!((content as VCardContent).firstName?.trim() || (content as VCardContent).lastName?.trim());
    case 'email':
      return !!(content as EmailContent).email?.trim();
    case 'phone':
      return !!(content as PhoneContent).phone?.trim();
    case 'sms':
      return !!(content as SMSContent).phone?.trim();
    case 'whatsapp':
      return !!(content as WhatsAppContent).phone?.trim();
    case 'facebook':
      return !!(content as FacebookContent).profileUrl?.trim();
    case 'instagram':
      return !!(content as InstagramContent).username?.trim();
    case 'linkedin':
      return !!(content as LinkedInContent).username?.trim();
    case 'x':
      return !!(content as XContent).username?.trim();
    case 'tiktok':
      return !!(content as TikTokContent).username?.trim();
    case 'snapchat':
      return !!(content as SnapchatContent).username?.trim();
    case 'threads':
      return !!(content as ThreadsContent).username?.trim();
    case 'youtube':
      return !!(content as YouTubeContent).videoId?.trim();
    case 'pinterest':
      return !!(content as PinterestContent).username?.trim();
    case 'spotify':
      return !!(content as SpotifyContent).spotifyId?.trim();
    case 'reddit': {
      const redditContent = content as RedditContent;
      if (redditContent.contentType === 'subreddit') {
        return !!redditContent.subreddit?.trim();
      }
      return !!redditContent.username?.trim();
    }
    case 'twitch':
      return !!(content as TwitchContent).username?.trim();
    case 'discord':
      return !!(content as DiscordContent).inviteCode?.trim();
    case 'apps': {
      const appsContent = content as AppsContent;
      return !!(appsContent.appStoreUrl?.trim() || appsContent.playStoreUrl?.trim() || appsContent.fallbackUrl?.trim());
    }
    case 'google-review': {
      const reviewContent = content as GoogleReviewContent;
      return !!(
        reviewContent.placeId?.trim() &&
        reviewContent.placeId.length >= 20 &&
        reviewContent.businessName?.trim()
      );
    }
    case 'multi-review': {
      const multiReview = content as MultiReviewContent;
      return !!(
        multiReview.businessName?.trim() &&
        multiReview.platforms?.length > 0 &&
        multiReview.platforms.some(p => p.url?.trim())
      );
    }
    case 'feedback':
      return !!(content as FeedbackContent).businessName?.trim();
    case 'event': {
      const eventContent = content as EventContent;
      if (!eventContent.title?.trim()) return false;
      if (!eventContent.startDate?.trim()) return false;
      if (!eventContent.endDate?.trim()) return false;
      const start = new Date(eventContent.startDate);
      const end = new Date(eventContent.endDate);
      return end > start;
    }
    case 'geo': {
      const geoContent = content as GeoContent;
      return geoContent.latitude !== undefined && geoContent.longitude !== undefined &&
             geoContent.latitude >= -90 && geoContent.latitude <= 90 &&
             geoContent.longitude >= -180 && geoContent.longitude <= 180;
    }
    case 'pdf':
      return !!(content as PDFContent).fileUrl?.trim() || !!(content as PDFContent).fileName?.trim();
    case 'images':
      return (content as ImagesContent).images?.length > 0;
    case 'video':
      return !!(content as VideoContent).videoUrl?.trim() || !!(content as VideoContent).embedUrl?.trim();
    case 'mp3':
      return !!(content as MP3Content).audioUrl?.trim() || !!(content as MP3Content).embedUrl?.trim();
    case 'menu': {
      const menu = content as MenuContent;
      return !!(
        menu.restaurantName?.trim() &&
        menu.categories?.length > 0 &&
        menu.categories[0]?.items?.length > 0
      );
    }
    case 'business': {
      const biz = content as BusinessContent;
      return !!(
        biz.name?.trim() &&
        (biz.email?.trim() || biz.phone?.trim() || biz.website?.trim())
      );
    }
    case 'links': {
      const links = content as LinksContent;
      return !!(
        links.title?.trim() &&
        links.links?.length > 0 &&
        links.links.some(link => link.url?.trim() && link.title?.trim())
      );
    }
    case 'coupon': {
      const coupon = content as CouponContent;
      return !!(
        coupon.businessName?.trim() &&
        coupon.headline?.trim() &&
        (coupon.code?.trim() || coupon.description?.trim())
      );
    }
    case 'social': {
      const social = content as SocialContent;
      return !!(
        social.name?.trim() &&
        social.links?.length > 0 &&
        social.links.some(link => link.url?.trim())
      );
    }
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// validateContent – strictest check with error messages (API / save)
// ---------------------------------------------------------------------------

export function validateContent(content: QRContent): { valid: boolean; error?: string } {
  switch (content.type) {
    case 'url':
      if (!content.url) return { valid: false, error: 'URL is required' };
      try {
        new URL(content.url);
        return { valid: true };
      } catch {
        if (content.url.includes('.')) {
          return { valid: true };
        }
        return { valid: false, error: 'Invalid URL format' };
      }

    case 'text':
      if (!content.text) return { valid: false, error: 'Text is required' };
      if (content.text.length > 2953) return { valid: false, error: 'Text too long (max 2953 characters)' };
      return { valid: true };

    case 'wifi':
      if (!content.ssid) return { valid: false, error: 'Network name is required' };
      return { valid: true };

    case 'vcard':
      if (!content.firstName && !content.lastName) {
        return { valid: false, error: 'Name is required' };
      }
      return { valid: true };

    case 'email':
      if (!content.email) return { valid: false, error: 'Email is required' };
      if (!content.email.includes('@')) return { valid: false, error: 'Invalid email format' };
      return { valid: true };

    case 'phone':
      if (!content.phone) return { valid: false, error: 'Phone number is required' };
      return { valid: true };

    case 'sms':
      if (!content.phone) return { valid: false, error: 'Phone number is required' };
      return { valid: true };

    case 'whatsapp':
      if (!content.phone) return { valid: false, error: 'WhatsApp number is required' };
      return { valid: true };

    case 'facebook':
      if (!content.profileUrl) return { valid: false, error: 'Facebook URL is required' };
      if (!content.profileUrl.includes('facebook.com') && !content.profileUrl.includes('fb.com')) {
        return { valid: false, error: 'Invalid Facebook URL' };
      }
      return { valid: true };

    case 'instagram':
      if (!content.username) return { valid: false, error: 'Instagram username is required' };
      return { valid: true };

    case 'linkedin':
      if (!content.username) return { valid: false, error: 'LinkedIn username is required' };
      return { valid: true };

    case 'x':
      if (!content.username) return { valid: false, error: 'X username is required' };
      return { valid: true };

    case 'tiktok':
      if (!content.username) return { valid: false, error: 'TikTok username is required' };
      return { valid: true };

    case 'snapchat':
      if (!content.username) return { valid: false, error: 'Snapchat username is required' };
      return { valid: true };

    case 'threads':
      if (!content.username) return { valid: false, error: 'Threads username is required' };
      return { valid: true };

    case 'youtube':
      if (!content.videoId) return { valid: false, error: 'YouTube video ID is required' };
      if (content.videoId.length !== 11) return { valid: false, error: 'Invalid YouTube video ID' };
      return { valid: true };

    case 'pinterest':
      if (!content.username) return { valid: false, error: 'Pinterest username is required' };
      return { valid: true };

    case 'spotify':
      if (!content.spotifyId) return { valid: false, error: 'Spotify URL is required' };
      if (!content.contentType) return { valid: false, error: 'Invalid Spotify content type' };
      return { valid: true };

    case 'reddit':
      if (content.contentType === 'subreddit') {
        if (!content.subreddit) return { valid: false, error: 'Subreddit name is required' };
      } else {
        if (!content.username) return { valid: false, error: 'Reddit username is required' };
      }
      return { valid: true };

    case 'twitch':
      if (!content.username) return { valid: false, error: 'Twitch username is required' };
      return { valid: true };

    case 'discord':
      if (!content.inviteCode) return { valid: false, error: 'Discord invite code is required' };
      return { valid: true };

    case 'apps':
      if (!content.appStoreUrl && !content.playStoreUrl && !content.fallbackUrl) {
        return { valid: false, error: 'At least one app store URL or fallback URL is required' };
      }
      return { valid: true };

    case 'google-review':
      if (!content.placeId) return { valid: false, error: 'Place ID is required' };
      if (content.placeId.length < 20) return { valid: false, error: 'Place ID must be at least 20 characters' };
      if (!content.businessName) return { valid: false, error: 'Business name is required' };
      return { valid: true };

    case 'multi-review':
      if (!content.businessName) return { valid: false, error: 'Business name is required' };
      if (!content.platforms || content.platforms.length === 0) {
        return { valid: false, error: 'At least one review platform is required' };
      }
      if (!content.platforms.some(p => p.url?.trim())) {
        return { valid: false, error: 'At least one platform must have a URL' };
      }
      return { valid: true };

    case 'feedback':
      if (!content.businessName) return { valid: false, error: 'Business name is required' };
      if (content.ratingType && !['stars', 'emoji', 'numeric'].includes(content.ratingType)) {
        return { valid: false, error: 'Rating type must be stars, emoji, or numeric' };
      }
      return { valid: true };

    case 'event':
      if (!content.title?.trim()) return { valid: false, error: 'Event title is required' };
      if (!content.startDate?.trim()) return { valid: false, error: 'Start date is required' };
      if (!content.endDate?.trim()) return { valid: false, error: 'End date is required' };
      {
        const start = new Date(content.startDate);
        const end = new Date(content.endDate);
        if (end <= start) return { valid: false, error: 'End date must be after start date' };
      }
      return { valid: true };

    case 'geo':
      if (content.latitude === undefined || content.latitude === null) {
        return { valid: false, error: 'Latitude is required' };
      }
      if (content.longitude === undefined || content.longitude === null) {
        return { valid: false, error: 'Longitude is required' };
      }
      if (content.latitude < -90 || content.latitude > 90) {
        return { valid: false, error: 'Latitude must be between -90 and 90' };
      }
      if (content.longitude < -180 || content.longitude > 180) {
        return { valid: false, error: 'Longitude must be between -180 and 180' };
      }
      return { valid: true };

    case 'pdf':
      if (!content.fileUrl) return { valid: false, error: 'PDF file is required' };
      return { valid: true };

    case 'images':
      if (!content.images || content.images.length === 0) {
        return { valid: false, error: 'At least one image is required' };
      }
      return { valid: true };

    case 'video':
      if (!content.videoUrl && !content.embedUrl) {
        return { valid: false, error: 'Video file or embed URL is required' };
      }
      return { valid: true };

    case 'mp3':
      if (!content.audioUrl && !content.embedUrl) {
        return { valid: false, error: 'Audio file or embed URL is required' };
      }
      return { valid: true };

    case 'menu':
      if (!content.restaurantName) return { valid: false, error: 'Restaurant name is required' };
      if (!content.categories || content.categories.length === 0) {
        return { valid: false, error: 'At least one menu category is required' };
      }
      return { valid: true };

    case 'business':
      if (!content.name) return { valid: false, error: 'Name is required' };
      return { valid: true };

    case 'links':
      if (!content.title) return { valid: false, error: 'Title is required' };
      if (!content.links || content.links.length === 0) {
        return { valid: false, error: 'At least one link is required' };
      }
      return { valid: true };

    case 'coupon':
      if (!content.businessName) return { valid: false, error: 'Business name is required' };
      if (!content.headline) return { valid: false, error: 'Coupon headline is required' };
      return { valid: true };

    case 'social':
      if (!content.name) return { valid: false, error: 'Name is required' };
      if (!content.links || content.links.length === 0) {
        return { valid: false, error: 'At least one social link is required' };
      }
      return { valid: true };

    default:
      return { valid: false, error: 'Unknown content type' };
  }
}
