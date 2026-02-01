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
    dynamicQRLimit: 5,
    features: [
      '5 QR codes',
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
      'Custom patterns & shapes',
      'Gradient colors',
      'Decorative frames',
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
      'Webhook notifications',
      'Team members (up to 3)',
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

export function getQRCodeLimit(tier: SubscriptionTier): number {
  return PLANS[tier]?.dynamicQRLimit ?? PLANS.free.dynamicQRLimit;
}

export function isWithinQRCodeLimit(tier: SubscriptionTier, currentCount: number): boolean {
  const limit = getQRCodeLimit(tier);
  if (limit === -1) return true; // unlimited
  return currentCount < limit;
}

// Feedback response limits per tier (per month)
export const FEEDBACK_RESPONSE_LIMITS = {
  free: 10,
  pro: 1000,
  business: -1, // unlimited
} as const;

export function getFeedbackResponseLimit(tier: SubscriptionTier): number {
  return FEEDBACK_RESPONSE_LIMITS[tier] ?? FEEDBACK_RESPONSE_LIMITS.free;
}

export function isWithinFeedbackLimit(tier: SubscriptionTier, currentCount: number): boolean {
  const limit = getFeedbackResponseLimit(tier);
  if (limit === -1) return true; // unlimited
  return currentCount < limit;
}

/**
 * Get effective tier considering trial status
 * Handles both Stripe trials (subscription_status: 'trialing') and legacy database trials
 */
export function getEffectiveTier(
  subscriptionTier: SubscriptionTier,
  trialEndsAt: string | null | undefined,
  subscriptionStatus?: string | null
): SubscriptionTier {
  // If on a Stripe trial (status is 'trialing'), they have Pro access
  if (subscriptionStatus === 'trialing' && subscriptionTier === 'pro') {
    return 'pro';
  }

  // If already paid (active subscription), return actual tier
  if (subscriptionTier !== 'free') {
    return subscriptionTier;
  }

  // Legacy: Check database-based trial (trial_ends_at field)
  if (trialEndsAt) {
    const trialEnd = new Date(trialEndsAt);
    if (trialEnd > new Date()) {
      return 'pro'; // Trial gives Pro features
    }
  }

  return 'free';
}

/**
 * Check if user's trial is active
 * Handles both Stripe trials and legacy database trials
 */
export function isTrialActive(
  trialEndsAt: string | null | undefined,
  subscriptionStatus?: string | null
): boolean {
  // Stripe trial
  if (subscriptionStatus === 'trialing') return true;
  // Legacy database trial
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) > new Date();
}

/**
 * Get days remaining in trial
 * For Stripe trials, this requires fetching from Stripe (not available here)
 * For legacy trials, uses the trial_ends_at field
 */
export function getTrialDaysRemaining(trialEndsAt: string | null | undefined): number {
  if (!trialEndsAt) return 0;
  const now = new Date();
  const end = new Date(trialEndsAt);
  if (end <= now) return 0;
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
