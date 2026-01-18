import type { QRContentType, QRContent } from '@/lib/qr/types';

export type SubscriptionTier = 'free' | 'pro' | 'business';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface QRCode {
  id: string;
  user_id: string;
  name: string;
  type: 'static' | 'dynamic';
  content_type: QRContentType;
  content: QRContent;
  short_code: string | null;
  destination_url: string | null;
  style: {
    foregroundColor: string;
    backgroundColor: string;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    margin: number;
  };
  scan_count: number;
  folder_id: string | null;
  expires_at: string | null;
  active_from: string | null;
  active_until: string | null;
  bulk_batch_id: string | null;
  password_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: string;
  qr_code_id: string;
  scanned_at: string;
  ip_hash: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  device_type: string | null;
  os: string | null;
  browser: string | null;
  referrer: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      qr_codes: {
        Row: QRCode;
        Insert: Omit<QRCode, 'id' | 'created_at' | 'updated_at' | 'scan_count'>;
        Update: Partial<Omit<QRCode, 'id' | 'created_at' | 'updated_at'>>;
      };
      scans: {
        Row: Scan;
        Insert: Omit<Scan, 'id' | 'scanned_at'>;
        Update: never;
      };
    };
  };
}

// Tier limits
export const TIER_LIMITS = {
  free: {
    staticQRCodes: Infinity,
    dynamicQRCodes: 0,
    analytics: false,
    customLogo: false,
    svgDownload: false,
    apiAccess: false,
    teamMembers: 1,
    folders: 0,
  },
  pro: {
    staticQRCodes: Infinity,
    dynamicQRCodes: 50,
    analytics: true,
    customLogo: true,
    svgDownload: true,
    apiAccess: false,
    teamMembers: 1,
    folders: 10,
  },
  business: {
    staticQRCodes: Infinity,
    dynamicQRCodes: Infinity,
    analytics: true,
    customLogo: true,
    svgDownload: true,
    apiAccess: true,
    teamMembers: 3,
    folders: Infinity,
  },
} as const;
