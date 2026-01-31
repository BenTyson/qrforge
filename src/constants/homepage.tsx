import { ReactNode } from 'react';

// Site URL for JSON-LD
export const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

// JSON-LD structured data for SEO
export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'QRWolf',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/QRWolf_Logo_Color.png`,
        width: 600,
        height: 60,
      },
      image: `${siteUrl}/QRWolf_Logo_Color.png`,
      description: 'QRWolf is a professional QR code generator with advanced customization, analytics, and tracking features.',
      foundingDate: '2024',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: `${siteUrl}/contact`,
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'QRWolf',
      description: 'Free QR Code Generator with Analytics & Tracking',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/learn?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#application`,
      name: 'QRWolf',
      description: 'Create professional QR codes in seconds. Free QR code generator with custom colors, logos, dynamic URLs, and real-time scan analytics.',
      url: siteUrl,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      provider: {
        '@id': `${siteUrl}/#organization`,
      },
      offers: [
        {
          '@type': 'Offer',
          name: 'Free',
          price: '0',
          priceCurrency: 'USD',
          description: '5 QR codes with custom colors and PNG downloads',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '9',
          priceCurrency: 'USD',
          priceValidUntil: '2026-12-31',
          description: '50 dynamic QR codes with analytics, custom logos, and advanced features',
        },
        {
          '@type': 'Offer',
          name: 'Business',
          price: '29',
          priceCurrency: 'USD',
          priceValidUntil: '2026-12-31',
          description: 'Unlimited dynamic QR codes with API access and bulk generation',
        },
      ],
      featureList: [
        'URL QR codes',
        'WiFi QR codes',
        'vCard QR codes',
        'Email QR codes',
        'SMS QR codes',
        'Phone QR codes',
        'Custom colors and logos',
        'Dynamic QR codes',
        'Scan analytics',
        'PNG and SVG downloads',
        'Password protection',
        'Expiration scheduling',
        'Branded landing pages',
        'Bulk CSV generation',
        'REST API access',
        'Custom patterns and shapes',
        'Gradient colors',
        'Decorative frames',
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '127',
      },
    },
  ],
};

// Stats displayed on homepage
export const STATS = [
  { value: '50K+', label: 'QR codes created this month' },
  { value: '99.9%', label: 'Uptime guarantee' },
  { value: '120+', label: 'Countries reached' },
  { value: '1M+', label: 'Scans tracked for users' },
];

// Feature type definition
export interface Feature {
  title: string;
  description: string;
  tier: 'free' | 'pro' | 'business';
  icon: ReactNode;
}

// Features grid data
export const FEATURES: Feature[] = [
  {
    title: 'Custom Design',
    description: 'Personalize your QR codes with custom colors and gradients. Pro users can add brand logos.',
    tier: 'free',
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4" />
      </svg>
    ),
  },
  {
    title: 'Dynamic QR Codes',
    description: 'Update the destination URL anytime without reprinting. Set expiration dates and passwords.',
    tier: 'pro',
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  },
  {
    title: 'Scan Analytics',
    description: 'Track scans in real-time with detailed location, device, and time analytics.',
    tier: 'pro',
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Multiple Formats',
    description: 'Download in PNG (free) or SVG format (Pro) for any use case from web to print.',
    tier: 'free',
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    title: 'Bulk Generation',
    description: 'Create hundreds of QR codes at once by uploading a CSV file.',
    tier: 'business',
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: 'API Access',
    description: 'Integrate QR code generation into your own applications with our REST API.',
    tier: 'business',
    icon: (
      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
];

// FAQ type definition
export type FAQCategory = 'getting-started' | 'features' | 'pricing' | 'technical' | 'security';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
}

export const FAQ_CATEGORIES: { value: FAQCategory; label: string }[] = [
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'features', label: 'Features & QR Types' },
  { value: 'pricing', label: 'Pricing & Plans' },
  { value: 'technical', label: 'Technical' },
  { value: 'security', label: 'Security & Privacy' },
];

// FAQ data
export const FAQS: FAQ[] = [
  // Getting Started (4)
  {
    id: 'account-needed',
    question: 'Do I need an account to create QR codes?',
    answer: 'You can preview QR codes on the homepage without signing up. A free account is required to download and save them. Once registered you get access to all 35 QR types, custom colors, and error-correction settings — no credit card required.',
    category: 'getting-started',
  },
  {
    id: 'what-is-dynamic',
    question: 'What is a dynamic QR code?',
    answer: 'A dynamic QR code contains a short redirect URL instead of embedding content directly. That means you can change the destination anytime without reprinting, track every scan with analytics, and optionally set expiration dates, passwords, or scheduling windows. The Free plan includes 5 dynamic QR codes.',
    category: 'getting-started',
  },
  {
    id: 'how-fast',
    question: 'How quickly can I create a QR code?',
    answer: 'Creating a QR code takes just a few steps: choose a type, enter your content, customize the design, and download. No credit card is needed for the Free tier — you can go from idea to finished QR code in under a minute.',
    category: 'getting-started',
  },
  {
    id: 'try-pro',
    question: 'Can I try Pro features before paying?',
    answer: 'Yes. Every paid plan comes with a 7-day free trial that gives you full access to all Pro features including logos, SVG export, analytics, and advanced styling. You can cancel anytime during the trial at no charge.',
    category: 'getting-started',
  },

  // Features & QR Types (6)
  {
    id: 'how-many-types',
    question: 'How many QR code types do you support?',
    answer: 'QRWolf supports 35 QR code types organized into six groups: Basic (7 types including URL, WiFi, vCard, Email, SMS, Phone, and Text), Social (15 platforms like Instagram, YouTube, LinkedIn, TikTok, and more), Reviews & Feedback (2 types), Events & Location (2 types), File Upload (4 types — PDF, Images, Video, Audio — Pro and above), and Landing Pages (5 types — Menu, Business, Link Page, Coupon, Social — Pro and above).',
    category: 'features',
  },
  {
    id: 'static-vs-dynamic',
    question: "What's the difference between static and dynamic QR codes?",
    answer: 'Static QR codes embed content directly into the code pattern (like a URL, WiFi credentials, or vCard). They work forever but cannot be edited or tracked after creation. Dynamic QR codes use a short redirect URL, so you can change the destination, view scan analytics, and add features like password protection or expiration dates — all without reprinting.',
    category: 'features',
  },
  {
    id: 'customization',
    question: 'What customization options are available?',
    answer: 'All users can customize foreground and background colors and adjust error correction levels. Pro and Business users unlock logo upload, gradient colors, 6 module shapes, 7 corner styles, decorative frames with custom text, and SVG export for print-quality output.',
    category: 'features',
  },
  {
    id: 'logo-support',
    question: 'Can I add my logo to QR codes?',
    answer: 'Yes — on Pro and Business plans you can upload an image and place it at the center of your QR code. Choose from square, rounded, or circle shapes, and adjust the size, margin, and background to match your brand.',
    category: 'features',
  },
  {
    id: 'file-formats',
    question: 'What file formats can I download?',
    answer: 'Free users can download QR codes as PNG images. Pro and Business users also get SVG export for scalable vector graphics and PDF export for print-ready documents — ideal for signage, packaging, and professional print materials at any size.',
    category: 'features',
  },
  {
    id: 'feedback-form',
    question: 'How does the Feedback Form QR type work?',
    answer: 'The Feedback Form QR type generates a branded feedback page that supports star, emoji, or numeric rating scales. You can optionally enable a comments field and email collection. After submission, visitors see a customizable thank-you screen with an optional call-to-action button linking anywhere you choose.',
    category: 'features',
  },

  // Pricing & Plans (5)
  {
    id: 'plan-differences',
    question: 'What are the differences between plans?',
    answer: 'Free ($0): 5 dynamic QR codes, 100 scans/month, PNG downloads, and custom colors. Pro ($9/month or $90/year): 50 dynamic QR codes, 10,000 scans/month, scan analytics, logo upload, SVG export, and Pro-only QR types. Business ($29/month or $290/year): unlimited QR codes and scans, bulk CSV generation (up to 500 rows), REST API access, and 3 team member seats.',
    category: 'pricing',
  },
  {
    id: 'free-expiration',
    question: 'Do QR codes expire on the free plan?',
    answer: 'No. QR codes created on the Free plan work indefinitely as long as your account is active. Pro and Business users can optionally set expiration dates on dynamic QR codes if they want time-limited access.',
    category: 'pricing',
  },
  {
    id: 'downgrade',
    question: 'What happens if I downgrade my plan?',
    answer: 'Your existing QR codes continue to work and redirect as normal. You lose access to Pro analytics, logo customization, and Pro-only QR types. Any dynamic QR codes above the Free plan limit become read-only — they still redirect, but you cannot edit their destination until you upgrade again.',
    category: 'pricing',
  },
  {
    id: 'commercial-use',
    question: 'Can I use QRWolf for commercial purposes?',
    answer: 'Yes. All plans — including Free — allow full commercial use of generated QR codes. Use them on product packaging, marketing materials, business cards, menus, or anywhere else.',
    category: 'pricing',
  },
  {
    id: 'refund-policy',
    question: "What's your refund policy?",
    answer: 'We offer a 14-day money-back guarantee on all paid plans. If you are not satisfied, contact us within 14 days of purchase for a full refund, no questions asked.',
    category: 'pricing',
  },

  // Technical (4)
  {
    id: 'scan-tracking',
    question: 'How does scan tracking work?',
    answer: 'Every time someone scans a dynamic QR code, we record anonymous data: country, city, device type, browser, operating system, referrer, and timestamp. The analytics dashboard shows unique visitor counts, charts, and trend data. Scan tracking is available on Pro (10,000 scans/month) and Business (unlimited) plans.',
    category: 'technical',
  },
  {
    id: 'api-access',
    question: 'Do you offer API access?',
    answer: 'Yes. Business plan subscribers get a full REST API to create, manage, and generate QR codes programmatically — ideal for integrating QR code generation into your own applications or workflows.',
    category: 'technical',
  },
  {
    id: 'bulk-generation',
    question: 'What is bulk generation?',
    answer: 'Bulk generation is a Business plan feature that lets you upload a CSV file with up to 500 rows and generate uniquely styled QR codes for each row in a single batch. Shared styling and options are applied across the entire batch for consistent branding.',
    category: 'technical',
  },
  {
    id: 'ab-testing',
    question: 'Can I A/B test my QR codes?',
    answer: 'Yes. Pro and Business users can split traffic between two destination URLs with configurable weights. The analytics dashboard lets you compare scan performance for each variant so you can optimize your campaigns.',
    category: 'technical',
  },

  // Security & Privacy (3)
  {
    id: 'data-security',
    question: 'Is my data secure?',
    answer: 'All data is encrypted in transit with TLS 1.3 and encrypted at rest. Our infrastructure runs on enterprise-grade cloud providers with 99.9% uptime. We do not sell your data or share it with third parties.',
    category: 'security',
  },
  {
    id: 'scan-data-collected',
    question: 'What scan data do you collect?',
    answer: 'We collect only anonymous scan data: location (country and city), device type, browser, operating system, and timestamp. No personally identifiable information is stored. IP addresses are hashed and never stored in raw form.',
    category: 'security',
  },
  {
    id: 'password-protection',
    question: 'Can I password-protect my QR codes?',
    answer: 'Yes. Pro and Business users can set a password on any dynamic QR code. Visitors must enter the correct password before they can access the content behind the code.',
    category: 'security',
  },
];

// QR Type definition
export type QRTypeCategory = 'basics' | 'social' | 'pro';

export interface QRType {
  name: string;
  icon: ReactNode;
  pro: boolean;
  category: QRTypeCategory;
}

// QR Types data
export const QR_TYPES: QRType[] = [
  // Free basics (8)
  {
    name: 'URL',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  {
    name: 'Text',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7V4h16v3" />
        <path d="M9 20h6" />
        <path d="M12 4v16" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  {
    name: 'WiFi',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  {
    name: 'vCard',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  {
    name: 'Email',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  {
    name: 'SMS',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  {
    name: 'Phone',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  {
    name: 'WhatsApp',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  // Free social (8)
  {
    name: 'Instagram',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'YouTube',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'Facebook',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'LinkedIn',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'X',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4l16 16" />
        <path d="M20 4L4 20" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'TikTok',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'Spotify',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 15c3-1 6-1 9 .5" />
        <path d="M7 12c4-1.5 8-1.5 11 .5" />
        <path d="M6 9c5-2 10-2 13 .5" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'Pinterest',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a10 10 0 0 0-3.16 19.5c-.07-.83-.14-2.13.03-3.04l1.22-5.18s-.31-.63-.31-1.55c0-1.45.84-2.54 1.89-2.54.89 0 1.32.67 1.32 1.48 0 .9-.57 2.24-.87 3.49-.25 1.05.53 1.9 1.56 1.9 1.87 0 3.31-1.97 3.31-4.82 0-2.52-1.81-4.28-4.4-4.28-3 0-4.76 2.25-4.76 4.57 0 .9.35 1.87.78 2.4a.31.31 0 0 1 .07.3l-.29 1.18c-.05.19-.15.23-.35.14-1.31-.61-2.13-2.52-2.13-4.06 0-3.31 2.4-6.35 6.93-6.35 3.64 0 6.46 2.59 6.46 6.06 0 3.61-2.28 6.52-5.44 6.52-1.06 0-2.06-.55-2.4-1.2l-.65 2.49c-.24.92-.88 2.07-1.31 2.77A10 10 0 1 0 12 2z" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  // Free social + special (9)
  {
    name: 'Snapchat',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2c-2.5 0-5 2-5 5.5 0 .5-.03 1-.1 1.5-.3.1-.7.2-1.2.3-.4.1-.7.4-.7.8s.3.7.7.8c.4.1.7.2.9.3-.3 1.2-1.3 2.3-2.7 2.8-.3.1-.5.4-.4.7.1.4.5.6.9.6.5 0 1-.1 1.5-.3.3-.1.5-.2.8-.1.3.1.5.4.7.8.5 1 1.3 2.3 4.6 2.3s4.1-1.3 4.6-2.3c.2-.4.4-.7.7-.8.2-.1.5 0 .8.1.5.2 1 .3 1.5.3.4 0 .8-.2.9-.6.1-.3-.1-.6-.4-.7-1.4-.5-2.4-1.6-2.7-2.8.2-.1.5-.2.9-.3.4-.1.7-.4.7-.8s-.3-.7-.7-.8c-.5-.1-.9-.2-1.2-.3-.07-.5-.1-1-.1-1.5C17 4 14.5 2 12 2z" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'Threads',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M14.5 8.5c-1.5-1-3.5-1-5 0s-2 3-1 4.5 3 2 4.5 1.5c1-.3 2-1 2.5-2s.5-2 0-3" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'Reddit',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="14" r="7" />
        <path d="M19 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M12 7V3" />
        <path d="M12 3l4 2" />
        <circle cx="9" cy="13" r="1" />
        <circle cx="15" cy="13" r="1" />
        <path d="M9 17c1 1 2 1.5 3 1.5s2-.5 3-1.5" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'Twitch',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'Discord',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9.09 9a3 3 0 0 0-2.83 2 3 3 0 0 0 2.83 2h.18a3 3 0 0 0 2.64-2 3 3 0 0 0-2.64-2h-.18z" />
        <path d="M14.73 9a3 3 0 0 0-2.64 2 3 3 0 0 0 2.64 2h.18a3 3 0 0 0 2.83-2 3 3 0 0 0-2.83-2h-.18z" />
        <path d="M8.3 5.2A14 14 0 0 1 12 4.7c1.3 0 2.5.2 3.7.5 2.1 1.3 3.5 2.8 4.3 5 .8 2.8.6 5.6-.2 7.3-.5 1-.9 1.8-1.8 2.8l-1 .7h-2l-1-1.5c-.5.1-1.3.2-2 .2s-1.5-.1-2-.2L9 20.8H7l-1-.7c-.9-1-1.3-1.8-1.8-2.8-.8-1.7-1-4.5-.2-7.3.8-2.2 2.2-3.7 4.3-5z" />
      </svg>
    ),
    pro: false,
    category: 'social',
  },
  {
    name: 'App Links',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  {
    name: 'Reviews',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  {
    name: 'Event',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  {
    name: 'Location',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    pro: false,
    category: 'basics',
  },
  // Pro (9)
  {
    name: 'PDF',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    pro: true,
    category: 'pro',
  },
  {
    name: 'Images',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
    pro: true,
    category: 'pro',
  },
  {
    name: 'Video',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect width="15" height="14" x="1" y="5" rx="2" ry="2" />
      </svg>
    ),
    pro: true,
    category: 'pro',
  },
  {
    name: 'Audio',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    pro: true,
    category: 'pro',
  },
  {
    name: 'Menu',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
    pro: true,
    category: 'pro',
  },
  {
    name: 'Business',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </svg>
    ),
    pro: true,
    category: 'pro',
  },
  {
    name: 'Link Page',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 17H7A5 5 0 0 1 7 7h2" />
        <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
        <line x1="8" x2="16" y1="12" y2="12" />
      </svg>
    ),
    pro: true,
    category: 'pro',
  },
  {
    name: 'Coupon',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
      </svg>
    ),
    pro: true,
    category: 'pro',
  },
  {
    name: 'Social',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
        <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
      </svg>
    ),
    pro: true,
    category: 'pro',
  },
];

// Testimonial type definition
export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  industry: string;
}

// Testimonials data
export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Sarah Chen',
    role: 'Owner, Sakura Kitchen',
    quote: 'Switching to QRWolf menus saved us hundreds on reprinting costs. We update prices and specials in seconds, and the scan analytics help us understand what dishes customers look at most.',
    industry: 'Restaurant',
  },
  {
    name: 'Marcus Thompson',
    role: 'Marketing Director, TechFlow',
    quote: 'We use QRWolf on all our product packaging and trade show materials. Being able to change destinations after printing has been a game-changer for our campaigns.',
    industry: 'Marketing',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Event Coordinator, CityEvents Co',
    quote: 'The bulk generation feature is incredible. We created 500 unique ticket QR codes in minutes. The analytics showed us exactly when attendees arrived and from which entrance.',
    industry: 'Events',
  },
  {
    name: 'David Park',
    role: 'Conference Director, TechConf 2026',
    quote: 'Managed 50+ QR codes for our conference sessions, sponsors, and networking areas. The analytics dashboard helped us identify which booths got the most traffic - a 35% increase in sponsor engagement.',
    industry: 'Events',
  },
  {
    name: 'Lisa Wang',
    role: 'Owner, Glow Beauty Studio',
    quote: 'Our booking QR code is on every service menu and receipt. We\'ve seen 40% more online appointments since switching to QRWolf. Clients love the instant access.',
    industry: 'Beauty',
  },
  {
    name: 'Mike Johnson',
    role: 'Agent, Premier Realty',
    quote: 'Every listing sign has a QR to the virtual tour. Buyers scan and get immediate access to photos, floor plans, and scheduling. I\'ve closed 3 deals where the buyer found us through the QR code.',
    industry: 'Real Estate',
  },
  {
    name: 'Dr. Amanda Foster',
    role: 'Practice Manager, City Dental',
    quote: 'Our patients scan for forms, appointment reminders, and aftercare instructions. The paperwork reduction alone saved us 10+ hours per week. HIPAA-friendly and professional.',
    industry: 'Healthcare',
  },
  {
    name: 'James Liu',
    role: 'Operations Lead, FreshBox Delivery',
    quote: 'We print QR codes on every delivery bag linking to nutrition info and reorder pages. Scan tracking shows 28% of customers check nutrition data - way higher than expected.',
    industry: 'Food & Beverage',
  },
  {
    name: 'Rachel Torres',
    role: 'Founder, Artisan Candle Co',
    quote: 'The vCard QR on my business cards has replaced awkward contact exchanges at craft fairs. People scan and save my info in seconds. Professional and memorable.',
    industry: 'Retail',
  },
  {
    name: 'Tom Bradley',
    role: 'Gym Owner, Peak Fitness',
    quote: 'Members scan to book classes, access workout videos, and get loyalty rewards. Our app downloads increased 60% after adding QR codes to our equipment and signage.',
    industry: 'Fitness',
  },
];

// Additional use cases for the "Also perfect for" section
export const ADDITIONAL_USE_CASES = [
  {
    title: 'Business Cards',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    title: 'Education',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    title: 'Healthcare',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3" />
        <path d="M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3" />
        <line x1="12" x2="12" y1="4" y2="20" />
        <line x1="4" x2="20" y1="12" y2="12" />
      </svg>
    ),
  },
  {
    title: 'Real Estate',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];
