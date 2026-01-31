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
  billing_interval: 'monthly' | 'yearly' | null;
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
  archived_at: string | null;
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

// A/B Testing types
export type ABTestStatus = 'draft' | 'running' | 'paused' | 'completed';

export interface ABTest {
  id: string;
  qr_code_id: string;
  name: string;
  status: ABTestStatus;
  started_at: string | null;
  completed_at: string | null;
  winner_variant_id: string | null;
  target_confidence: number;
  created_at: string;
  updated_at: string;
}

export interface ABVariant {
  id: string;
  test_id: string;
  name: string;
  slug: string;
  destination_url: string;
  weight: number;
  scan_count: number;
  created_at: string;
}

export interface ABAssignment {
  id: string;
  test_id: string;
  ip_hash: string;
  variant_id: string;
  assigned_at: string;
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
      ab_tests: {
        Row: ABTest;
        Insert: Omit<ABTest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ABTest, 'id' | 'created_at' | 'updated_at'>>;
      };
      ab_variants: {
        Row: ABVariant;
        Insert: Omit<ABVariant, 'id' | 'created_at' | 'scan_count'>;
        Update: Partial<Omit<ABVariant, 'id' | 'created_at'>>;
      };
      ab_assignments: {
        Row: ABAssignment;
        Insert: Omit<ABAssignment, 'id' | 'assigned_at'>;
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
