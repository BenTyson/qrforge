import Stripe from 'stripe';

// Re-export plans for backward compatibility
export {
  PLANS,
  SCAN_LIMITS,
  getScanLimit,
  isWithinScanLimit,
  getEffectiveTier,
  isTrialActive,
  getTrialDaysRemaining,
} from './plans';
export type { SubscriptionTier } from './plans';

// Stripe client - only initialize on server side when env var is available
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
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
