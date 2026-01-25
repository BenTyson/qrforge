/**
 * Competitor Data for Comparison Pages
 */

export interface Competitor {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  pricingStart: string;
  features: FeatureComparison[];
  pricing: PricingComparison;
  whySwitch: string[];
}

export interface FeatureComparison {
  feature: string;
  qrwolf: boolean | string;
  competitor: boolean | string;
}

export interface PricingComparison {
  qrwolfFree: string;
  qrwolfPro: string;
  qrwolfBusiness: string;
  competitorFree: string;
  competitorPro: string;
  competitorBusiness: string;
}

export const COMPETITORS: Record<string, Competitor> = {
  'qr-code-monkey': {
    slug: 'qr-code-monkey',
    name: 'QR Code Monkey',
    tagline: 'A simpler, more affordable alternative',
    description: 'QR Code Monkey is a popular free QR code generator. While it offers basic QR creation, QRWolf provides more features, better analytics, and professional templates at competitive pricing.',
    pricingStart: '$5/mo',
    features: [
      { feature: 'Static QR Codes', qrwolf: 'Unlimited', competitor: 'Unlimited' },
      { feature: 'Dynamic QR Codes', qrwolf: '50 (Pro)', competitor: 'Limited' },
      { feature: 'Scan Analytics', qrwolf: 'Detailed', competitor: 'Basic' },
      { feature: 'Custom Logo', qrwolf: true, competitor: true },
      { feature: 'Custom Colors', qrwolf: true, competitor: true },
      { feature: 'SVG Downloads', qrwolf: true, competitor: 'Pro only' },
      { feature: 'Bulk Generation', qrwolf: true, competitor: false },
      { feature: 'API Access', qrwolf: true, competitor: false },
      { feature: 'Password Protection', qrwolf: true, competitor: false },
      { feature: 'QR Code Templates', qrwolf: '40+', competitor: '10' },
      { feature: 'Team Collaboration', qrwolf: true, competitor: false },
      { feature: 'Landing Pages', qrwolf: true, competitor: false },
    ],
    pricing: {
      qrwolfFree: '$0',
      qrwolfPro: '$9/mo',
      qrwolfBusiness: '$29/mo',
      competitorFree: '$0',
      competitorPro: '$12/mo',
      competitorBusiness: '$39/mo',
    },
    whySwitch: [
      'More dynamic QR codes included in Pro plan (50 vs 10)',
      'Lower pricing across all tiers',
      'Advanced analytics with device and location data',
      'API access for developers and automation',
      'Better template variety with 40+ pre-designed options',
      'Password protection and scheduling features',
    ],
  },
  'qr-tiger': {
    slug: 'qr-tiger',
    name: 'QR Tiger',
    tagline: 'Enterprise features without enterprise pricing',
    description: 'QR Tiger offers enterprise QR solutions at premium prices. QRWolf delivers similar features at a fraction of the cost, making professional QR codes accessible to businesses of all sizes.',
    pricingStart: '$7/mo',
    features: [
      { feature: 'Static QR Codes', qrwolf: 'Unlimited', competitor: 'Unlimited' },
      { feature: 'Dynamic QR Codes', qrwolf: '50 (Pro)', competitor: '25 (Pro)' },
      { feature: 'Scans/Month', qrwolf: '10,000 (Pro)', competitor: '5,000 (Pro)' },
      { feature: 'Scan Analytics', qrwolf: true, competitor: true },
      { feature: 'Custom Domain', qrwolf: 'Business', competitor: 'Enterprise' },
      { feature: 'Bulk Generation', qrwolf: true, competitor: 'Enterprise' },
      { feature: 'API Access', qrwolf: 'Business', competitor: 'Enterprise' },
      { feature: 'White Label', qrwolf: 'Coming Soon', competitor: 'Enterprise' },
      { feature: 'A/B Testing', qrwolf: true, competitor: 'Enterprise' },
      { feature: 'Multi-URL QR', qrwolf: true, competitor: true },
      { feature: 'QR Templates', qrwolf: '40+', competitor: '20+' },
      { feature: 'Support', qrwolf: 'Email', competitor: 'Email' },
    ],
    pricing: {
      qrwolfFree: '$0',
      qrwolfPro: '$9/mo',
      qrwolfBusiness: '$29/mo',
      competitorFree: '$0',
      competitorPro: '$15/mo',
      competitorBusiness: '$65/mo',
    },
    whySwitch: [
      '40% lower pricing on Pro plan ($9 vs $15)',
      '55% lower pricing on Business plan ($29 vs $65)',
      'Double the monthly scan allowance',
      'A/B testing included in Pro (not Enterprise-only)',
      'More QR code types out of the box',
      'Simpler, cleaner interface',
    ],
  },
  'beaconstac': {
    slug: 'beaconstac',
    name: 'Beaconstac',
    tagline: 'Same power, simpler pricing',
    description: 'Beaconstac is known for enterprise QR solutions with complex pricing tiers. QRWolf offers similar capabilities with transparent, straightforward pricing that scales with your needs.',
    pricingStart: '$5/mo',
    features: [
      { feature: 'Static QR Codes', qrwolf: 'Unlimited', competitor: 'Limited' },
      { feature: 'Dynamic QR Codes', qrwolf: '50 (Pro)', competitor: '25 (Starter)' },
      { feature: 'Scan Analytics', qrwolf: 'Detailed', competitor: 'Detailed' },
      { feature: 'Custom Branding', qrwolf: true, competitor: true },
      { feature: 'Retargeting', qrwolf: 'Coming Soon', competitor: true },
      { feature: 'Form QR Codes', qrwolf: 'Coming Soon', competitor: true },
      { feature: 'Bulk Generation', qrwolf: true, competitor: 'Pro+' },
      { feature: 'API Access', qrwolf: 'Business', competitor: 'Pro+' },
      { feature: 'SSO', qrwolf: 'Coming Soon', competitor: 'Enterprise' },
      { feature: 'Google Review QR', qrwolf: true, competitor: true },
      { feature: 'vCard Plus', qrwolf: true, competitor: true },
      { feature: 'Multi-language', qrwolf: 'Coming Soon', competitor: true },
    ],
    pricing: {
      qrwolfFree: '$0',
      qrwolfPro: '$9/mo',
      qrwolfBusiness: '$29/mo',
      competitorFree: '$0 (5 QR)',
      competitorPro: '$49/mo',
      competitorBusiness: '$99/mo',
    },
    whySwitch: [
      'Dramatically lower pricing (80% less than Beaconstac Pro)',
      'More generous free tier with unlimited static QR codes',
      'Simpler pricing without complex tier limitations',
      'All core features included in lower tiers',
      'No per-scan pricing surprises',
      'Modern, fast interface without legacy bloat',
    ],
  },
};

/**
 * Get competitor by slug
 */
export function getCompetitor(slug: string): Competitor | null {
  return COMPETITORS[slug] || null;
}

/**
 * Get all competitor slugs for static generation
 */
export function getAllCompetitorSlugs(): string[] {
  return Object.keys(COMPETITORS);
}
