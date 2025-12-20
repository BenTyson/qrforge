import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

// Price IDs - set these after creating products in Stripe Dashboard
export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
  business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
  business_yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || '',
};

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
      'Basic colors',
      'PNG downloads',
      'QRForge watermark',
    ],
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 9,
    yearlyPrice: 90,
    scanLimit: SCAN_LIMITS.pro,
    dynamicQRLimit: 50,
    priceId: {
      monthly: STRIPE_PRICES.pro_monthly,
      yearly: STRIPE_PRICES.pro_yearly,
    },
    features: [
      'Everything in Free',
      '50 dynamic QR codes',
      '10,000 scans/month',
      'Scan analytics',
      'Custom colors & logos',
      'SVG/PDF downloads',
      'No watermark',
    ],
  },
  business: {
    name: 'Business',
    monthlyPrice: 29,
    yearlyPrice: 290,
    scanLimit: SCAN_LIMITS.business,
    dynamicQRLimit: -1, // unlimited
    priceId: {
      monthly: STRIPE_PRICES.business_monthly,
      yearly: STRIPE_PRICES.business_yearly,
    },
    features: [
      'Everything in Pro',
      'Unlimited dynamic QR codes',
      'Unlimited scans',
      'API access',
      'Bulk generation',
      'Team members (3)',
      'White-label option',
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
