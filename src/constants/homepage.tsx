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
          description: 'Unlimited static QR codes with basic customization',
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
export interface FAQ {
  question: string;
  answer: string;
}

// FAQ data
export const FAQS: FAQ[] = [
  {
    question: 'What is a dynamic QR code?',
    answer: 'A dynamic QR code contains a short URL that redirects to your destination. You can change where it points anytime without reprinting the QR code, set expiration dates, add password protection, and track every scan. Available on Pro and Business plans.',
  },
  {
    question: 'Do I need an account to create QR codes?',
    answer: 'You can preview QR codes without signing up, but a free account is required to download and save them. Creating an account gives you access to all 16 QR types, scan tracking, and customization options.',
  },
  {
    question: 'What file formats can I download?',
    answer: 'Free users can download PNG files. Pro and Business users get access to SVG format, which is perfect for high-quality printing and scalable graphics.',
  },
  {
    question: 'How does scan tracking work?',
    answer: 'When someone scans your dynamic QR code, we record anonymous data like location (country/city), device type, and time. You can view this data in your analytics dashboard. Pro users get 10,000 scans/month, Business users get unlimited scans.',
  },
  {
    question: 'Do you offer API access?',
    answer: 'Yes! Business plan subscribers get full REST API access to create, manage, and generate QR codes programmatically. Perfect for integrating QR code generation into your own applications.',
  },
  {
    question: 'Can I use QRWolf for commercial purposes?',
    answer: 'Absolutely! QRWolf is designed for businesses. All plans, including Free, allow commercial use of generated QR codes.',
  },
  {
    question: 'Is my data secure?',
    answer: "Yes. All data is encrypted in transit (TLS 1.3) and at rest. We don't sell your data or track your visitors beyond anonymous scan analytics. Our infrastructure runs on enterprise-grade cloud providers with 99.9% uptime.",
  },
  {
    question: 'What happens if I downgrade my plan?',
    answer: "Your existing QR codes will continue to work. However, you'll lose access to Pro/Business features like analytics, and dynamic QR codes beyond your plan's limit will become static (the last saved destination).",
  },
  {
    question: 'Do QR codes expire on the free plan?',
    answer: 'No! Static QR codes on the free plan never expire. They link directly to your destination and will work forever. Only dynamic QR codes (Pro feature) can have optional expiration dates.',
  },
  {
    question: "What's your refund policy?",
    answer: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 14 days of purchase for a full refund, no questions asked.",
  },
];

// QR Type definition
export interface QRType {
  name: string;
  icon: ReactNode;
  pro: boolean;
}

// QR Types data
export const QR_TYPES: QRType[] = [
  {
    name: 'URL',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    pro: false,
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
  },
  {
    name: 'SMS',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    pro: false,
  },
  {
    name: 'Phone',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    pro: false,
  },
  {
    name: 'WhatsApp',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    pro: false,
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
  },
  {
    name: 'PDF',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    pro: true,
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
  },
  {
    name: 'App Links',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    pro: true,
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
