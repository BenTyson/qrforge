/**
 * A/B Testing Types
 * Split traffic between destinations to test performance
 */

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
  slug: string;  // "a", "b", etc.
  destination_url: string;
  weight: number;  // 1-100, percentage weight
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

// Full test with variants for API responses
export interface ABTestWithVariants extends ABTest {
  variants: ABVariant[];
}

// For creating a new test
export interface CreateABTestInput {
  qr_code_id: string;
  name: string;
  variants: {
    name: string;
    slug: string;
    destination_url: string;
    weight: number;
  }[];
}

// For the UI - simplified A/B test configuration
export interface ABTestConfig {
  enabled: boolean;
  variantBUrl: string;
  splitPercentage: number;  // 10-90, represents variant B percentage
}

// Statistics result
export interface ABTestStatistics {
  controlScans: number;
  variantScans: number;
  controlRate: number;  // scans per total
  variantRate: number;
  improvement: number;  // percentage improvement of variant over control
  zScore: number;
  pValue: number;
  confidence: number;  // 0-1
  isSignificant: boolean;
  scansNeeded: number;  // additional scans needed for target confidence
}
