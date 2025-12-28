// Plan configuration - can be imported without initializing Stripe client

// Scan limits per tier (per month)
export const SCAN_LIMITS = {
  free: 100,
  pro: 10000,
  business: -1, // unlimited
} as const;

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    scanLimit: SCAN_LIMITS.free,
    dynamicQRLimit: 0,
    features: [
      'Unlimited static QR codes',
      '100 scans/month',
      'Custom colors',
      'PNG downloads',
    ],
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 9,
    yearlyPrice: 90,
    scanLimit: SCAN_LIMITS.pro,
    dynamicQRLimit: 50,
    features: [
      'Everything in Free',
      '50 dynamic QR codes',
      '10,000 scans/month',
      'Scan analytics',
      'Custom logo on QR codes',
      'SVG downloads',
      'QR expiration dates',
      'Password protection',
      'Scheduled activation',
    ],
  },
  business: {
    name: 'Business',
    monthlyPrice: 29,
    yearlyPrice: 290,
    scanLimit: SCAN_LIMITS.business,
    dynamicQRLimit: -1, // unlimited
    features: [
      'Everything in Pro',
      'Unlimited dynamic QR codes',
      'Unlimited scans',
      'Bulk QR generation',
      'API access',
      'Team members',
      'Custom domains',
    ],
  },
};

export type SubscriptionTier = keyof typeof PLANS;

export function getScanLimit(tier: SubscriptionTier): number {
  return PLANS[tier]?.scanLimit ?? SCAN_LIMITS.free;
}

export function isWithinScanLimit(tier: SubscriptionTier, currentCount: number): boolean {
  const limit = getScanLimit(tier);
  if (limit === -1) return true; // unlimited
  return currentCount < limit;
}
