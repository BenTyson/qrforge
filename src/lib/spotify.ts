/**
 * Spotify URL parsing utilities
 */

export type SpotifyContentType = 'track' | 'album' | 'playlist' | 'artist' | 'show' | 'episode';

interface SpotifyParseResult {
  id: string;
  contentType: SpotifyContentType;
}

/**
 * Extracts Spotify ID and content type from various URL formats:
 * - https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh
 * - https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3
 * - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
 * - https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02
 * - https://open.spotify.com/show/5CfCWKI5pZ28U0uOzXkDHe
 * - https://open.spotify.com/episode/512ojhOuo1ktJprKbVcKyQ
 * - spotify:track:4iV5W9uYEdYUVa79Axb7Rh (Spotify URI)
 */
export function parseSpotifyUrl(input: string): SpotifyParseResult | null {
  const trimmed = input.trim();

  // Handle Spotify URIs (spotify:type:id)
  const uriMatch = trimmed.match(/^spotify:(track|album|playlist|artist|show|episode):([a-zA-Z0-9]+)$/);
  if (uriMatch) {
    return {
      contentType: uriMatch[1] as SpotifyContentType,
      id: uriMatch[2],
    };
  }

  // Handle Spotify URLs
  const urlPatterns = [
    /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(track|album|playlist|artist|show|episode)\/([a-zA-Z0-9]+)/i,
  ];

  for (const pattern of urlPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1] && match[2]) {
      return {
        contentType: match[1].toLowerCase() as SpotifyContentType,
        id: match[2],
      };
    }
  }

  return null;
}

/**
 * Gets the Spotify embed URL for a given ID and content type
 */
export function getSpotifyEmbedUrl(id: string, contentType: SpotifyContentType): string {
  return `https://open.spotify.com/embed/${contentType}/${id}`;
}

/**
 * Gets the Spotify open URL for a given ID and content type
 */
export function getSpotifyOpenUrl(id: string, contentType: SpotifyContentType): string {
  return `https://open.spotify.com/${contentType}/${id}`;
}

/**
 * Gets display label for content type
 */
export function getSpotifyContentTypeLabel(contentType: SpotifyContentType): string {
  const labels: Record<SpotifyContentType, string> = {
    track: 'Track',
    album: 'Album',
    playlist: 'Playlist',
    artist: 'Artist',
    show: 'Podcast',
    episode: 'Episode',
  };
  return labels[contentType];
}
