/**
 * YouTube URL Parsing Utilities
 *
 * Handles various YouTube URL formats and extracts video IDs.
 */

/**
 * Regular expressions for YouTube URL patterns
 */
const YOUTUBE_PATTERNS = [
  // Standard watch URL: youtube.com/watch?v=VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:[^&]*&)*v=([a-zA-Z0-9_-]{11})/,
  // Short URL: youtu.be/VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  // Embed URL: youtube.com/embed/VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  // Shorts URL: youtube.com/shorts/VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  // v URL: youtube.com/v/VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  // Mobile URL: m.youtube.com/watch?v=VIDEO_ID
  /(?:https?:\/\/)?m\.youtube\.com\/watch\?(?:[^&]*&)*v=([a-zA-Z0-9_-]{11})/,
  // Live URL: youtube.com/live/VIDEO_ID
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  // Music URL: music.youtube.com/watch?v=VIDEO_ID
  /(?:https?:\/\/)?music\.youtube\.com\/watch\?(?:[^&]*&)*v=([a-zA-Z0-9_-]{11})/,
];

/**
 * Raw video ID pattern (11 alphanumeric characters with dashes/underscores)
 */
const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts the video ID from various YouTube URL formats.
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 * - VIDEO_ID (raw 11-character ID)
 *
 * @param input - YouTube URL or video ID
 * @returns The 11-character video ID, or null if not found
 */
export function extractVideoId(input: string): string | null {
  if (!input) return null;

  const trimmed = input.trim();

  // Check if it's already a raw video ID
  if (VIDEO_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  // Try each pattern
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validates if a string is a valid YouTube video ID format.
 *
 * @param videoId - The video ID to validate
 * @returns True if valid format, false otherwise
 */
export function isValidVideoId(videoId: string): boolean {
  return VIDEO_ID_PATTERN.test(videoId);
}

/**
 * Constructs a standard YouTube watch URL from a video ID.
 *
 * @param videoId - The 11-character video ID
 * @returns The full YouTube URL
 */
export function getYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Constructs a YouTube embed URL from a video ID.
 *
 * @param videoId - The 11-character video ID
 * @returns The YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Constructs a YouTube thumbnail URL from a video ID.
 *
 * @param videoId - The 11-character video ID
 * @param quality - Thumbnail quality: 'default', 'medium', 'high', 'maxres'
 * @returns The thumbnail image URL
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'
): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Fetches video metadata using YouTube's oEmbed API.
 * This is a client-friendly API that doesn't require an API key.
 *
 * @param videoId - The 11-character video ID
 * @returns Video metadata or null if fetch fails
 */
export async function getVideoMetadata(videoId: string): Promise<{
  title: string;
  authorName: string;
  authorUrl: string;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
} | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      title: data.title || '',
      authorName: data.author_name || '',
      authorUrl: data.author_url || '',
      thumbnailUrl: data.thumbnail_url || getYouTubeThumbnail(videoId),
      thumbnailWidth: data.thumbnail_width || 480,
      thumbnailHeight: data.thumbnail_height || 360,
    };
  } catch {
    return null;
  }
}
