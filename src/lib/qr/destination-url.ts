/**
 * Consolidated helper for extracting a destination URL from QR content.
 *
 * Previously duplicated in QRStudio.tsx (display URL for A/B testing)
 * and useQRStudioState.ts (full URL for saving A/B variants).
 */

import type { QRContent, QRContentType } from './types';

/**
 * Extracts a full destination URL from QR content (with https:// protocol).
 * Used for A/B test variant creation and similar server-side needs.
 * Returns null for types that don't map to a simple URL.
 */
export function getDestinationUrl(content: QRContent | null, type: QRContentType | null): string | null {
  if (!content || !type) return null;

  const c = content as unknown as Record<string, unknown>;

  switch (type) {
    case 'url':
      return c.url as string || null;
    case 'facebook':
      return c.profileUrl as string || null;
    case 'instagram':
      return c.username ? `https://instagram.com/${String(c.username).replace('@', '')}` : null;
    case 'linkedin':
      return c.username ? `https://linkedin.com/in/${String(c.username).replace('@', '')}` : null;
    case 'x':
      return c.username ? `https://x.com/${String(c.username).replace('@', '')}` : null;
    case 'tiktok':
      return c.username ? `https://tiktok.com/@${String(c.username).replace('@', '')}` : null;
    case 'youtube':
      return c.videoId ? `https://youtube.com/watch?v=${c.videoId}` : null;
    case 'spotify':
      return c.spotifyId ? `https://open.spotify.com/${c.contentType || 'track'}/${c.spotifyId}` : null;
    case 'twitch':
      return c.username ? `https://twitch.tv/${c.username}` : null;
    case 'discord':
      return c.inviteCode ? `https://discord.gg/${c.inviteCode}` : null;
    case 'whatsapp': {
      if (!c.phone) return null;
      const phone = String(c.phone).replace(/\D/g, '');
      let url = `https://wa.me/${phone}`;
      if (c.message) url += `?text=${encodeURIComponent(String(c.message))}`;
      return url;
    }
    default:
      return null;
  }
}

/**
 * Extracts a display-friendly destination URL (no protocol prefix) for
 * showing in the UI, e.g. in the A/B testing options panel.
 * Returns undefined for types that don't map to a simple URL.
 */
export function getDisplayDestinationUrl(content: QRContent | null, type: QRContentType | null): string | undefined {
  if (!content || !type) return undefined;

  const c = content as unknown as Record<string, unknown>;

  switch (type) {
    case 'url':
      return c.url as string || undefined;
    case 'facebook':
      return c.profileUrl as string || undefined;
    case 'instagram':
      return c.username ? `instagram.com/${String(c.username).replace('@', '')}` : undefined;
    case 'linkedin':
      return c.username ? `linkedin.com/in/${String(c.username).replace('@', '')}` : undefined;
    case 'x':
      return c.username ? `x.com/${String(c.username).replace('@', '')}` : undefined;
    case 'tiktok':
      return c.username ? `tiktok.com/@${String(c.username).replace('@', '')}` : undefined;
    case 'youtube':
      return c.videoId ? `youtube.com/watch?v=${c.videoId}` : undefined;
    case 'spotify':
      return c.spotifyId ? `open.spotify.com/.../${c.spotifyId}` : undefined;
    case 'twitch':
      return c.username ? `twitch.tv/${c.username}` : undefined;
    case 'discord':
      return c.inviteCode ? `discord.gg/${c.inviteCode}` : undefined;
    case 'whatsapp':
      return c.phone ? `wa.me/${String(c.phone).replace(/\D/g, '')}` : undefined;
    default:
      return undefined;
  }
}
