import type { QRContentType } from '@/lib/qr/types';

export interface SocialFormConfig {
  /** The QR content type key */
  type: QRContentType;
  /** Label for the form field */
  label: string;
  /** Input field placeholder */
  placeholder: string;
  /** Help text below the input */
  helpText: string;
  /** Input element ID */
  inputId: string;
  /** Whether input should show @ prefix (like Instagram) */
  showAtPrefix?: boolean;
  /** Whether to strip @ from input value */
  stripAt?: boolean;
  /** URL patterns for extracting username from pasted URLs */
  urlPatterns: RegExp[];
  /** Build the preview/redirect URL from a username */
  buildPreviewUrl: (username: string) => string;
}

export const SOCIAL_FORM_CONFIGS: Record<string, SocialFormConfig> = {
  instagram: {
    type: 'instagram',
    label: 'Instagram Username',
    placeholder: 'username',
    helpText: 'Enter your Instagram username without the @ symbol',
    inputId: 'igUsername',
    showAtPrefix: true,
    stripAt: true,
    urlPatterns: [],
    buildPreviewUrl: () => '', // Instagram form doesn't show preview URL
  },

  linkedin: {
    type: 'linkedin',
    label: 'LinkedIn Profile',
    placeholder: 'username or linkedin.com/in/username',
    helpText: 'Enter your LinkedIn username or paste your profile URL',
    inputId: 'linkedinUsername',
    stripAt: true,
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^/?]+)/i,
    ],
    buildPreviewUrl: (username: string) => `https://linkedin.com/in/${username}`,
  },

  x: {
    type: 'x',
    label: 'X (Twitter) Profile',
    placeholder: 'username or x.com/username',
    helpText: 'Enter your X username or paste your profile URL',
    inputId: 'xUsername',
    stripAt: true,
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?x\.com\/([^/?]+)/i,
      /(?:https?:\/\/)?(?:www\.)?twitter\.com\/([^/?]+)/i,
    ],
    buildPreviewUrl: (username: string) => `https://x.com/${username}`,
  },

  tiktok: {
    type: 'tiktok',
    label: 'TikTok Profile',
    placeholder: 'username or tiktok.com/@username',
    helpText: 'Enter your TikTok username or paste your profile URL',
    inputId: 'tiktokUsername',
    stripAt: true,
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([^/?]+)/i,
      /(?:https?:\/\/)?(?:vm\.)?tiktok\.com\/@?([^/?]+)/i,
    ],
    buildPreviewUrl: (username: string) => `https://tiktok.com/@${username}`,
  },

  snapchat: {
    type: 'snapchat',
    label: 'Snapchat Profile',
    placeholder: 'username or snapchat.com/add/username',
    helpText: 'Enter your Snapchat username or paste your profile URL',
    inputId: 'snapchatUsername',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?snapchat\.com\/add\/([^/?]+)/i,
    ],
    buildPreviewUrl: (username: string) => `https://snapchat.com/add/${username}`,
  },

  threads: {
    type: 'threads',
    label: 'Threads Profile',
    placeholder: 'username or threads.net/@username',
    helpText: 'Enter your Threads username or paste your profile URL',
    inputId: 'threadsUsername',
    stripAt: true,
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?threads\.net\/@?([^/?]+)/i,
    ],
    buildPreviewUrl: (username: string) => `https://threads.net/@${username}`,
  },

  pinterest: {
    type: 'pinterest',
    label: 'Pinterest Username',
    placeholder: 'username or pinterest.com/username',
    helpText: 'Enter your Pinterest username or paste your profile URL',
    inputId: 'pinterestUsername',
    stripAt: true,
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?pinterest\.com\/([^/?]+)/i,
    ],
    buildPreviewUrl: (username: string) => `https://pinterest.com/${username}`,
  },

  twitch: {
    type: 'twitch',
    label: 'Twitch Channel',
    placeholder: 'username or twitch.tv/username',
    helpText: 'Enter your Twitch username or paste your channel URL',
    inputId: 'twitchUsername',
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([^/?]+)/i,
    ],
    buildPreviewUrl: (username: string) => `https://twitch.tv/${username}`,
  },
};
