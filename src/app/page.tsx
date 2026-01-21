import Link from 'next/link';
import Image from 'next/image';
import { QRGenerator } from '@/components/qr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingSection } from '@/components/pricing';
import { Footer, PublicNav } from '@/components/layout';
import { createClient } from '@/lib/supabase/server';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

const jsonLd = {
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

export default async function Home() {
  // Check if user is authenticated for pricing section
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // Get user's current tier if authenticated
  let currentTier = 'free';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    currentTier = profile?.subscription_tier || 'free';
  }

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Navigation */}
      <PublicNav />

      {/* Hero Mast Section */}
      <section className="relative hero-mast pt-16 min-h-[560px] flex items-center justify-center overflow-hidden">
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

        {/* Subtle animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Logo with glow */}
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <Image
            src="/QRWolf_Logo_Particle_Color.png"
            alt="QRWolf Logo"
            width={180}
            height={190}
            className="logo-glow mb-4 drop-shadow-2xl"
            priority
          />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            QR codes with <span className="gradient-text">teeth</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-2">
            Create once. Update anytime. Track everything.
          </p>
          <p className="text-sm md:text-base text-white/50 max-w-lg">
            No reprinting. No broken links. No guessing who scanned.
          </p>
        </div>
      </section>

      {/* QR Generator Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            Free to use, no signup required
          </Badge>
        </div>

        {/* QR Generator */}
        <div className="max-w-7xl mx-auto">
          <QRGenerator />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Create professional QR codes in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
                  <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Create</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from 16 QR types: URL, WiFi, vCard, Menu, PDF, and more. Customize colors and add your logo.
                </p>
              </div>
              {/* Connector line - hidden on mobile */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">2</span>
                  <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Download & Share</h3>
                <p className="text-sm text-muted-foreground">
                  Export as PNG or SVG. Print on packaging, menus, business cards, or share digitally.
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">3</span>
                  <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Track & Update</h3>
                <p className="text-sm text-muted-foreground">
                  See who&apos;s scanning, when, and where. Update your destination anytime without reprinting.
                </p>
              </div>
            </div>
          </div>

          {/* Visual flow diagram */}
          <div className="mt-12 p-6 rounded-2xl bg-secondary/30 border border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background">
                <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="6" height="6" />
                    <rect x="14" y="4" width="6" height="6" />
                    <rect x="4" y="14" width="6" height="6" />
                    <rect x="14" y="14" width="6" height="6" />
                  </svg>
                </div>
                <span>Your QR Code</span>
              </div>
              <svg className="w-5 h-5 text-muted-foreground rotate-90 md:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
                <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <span className="text-primary font-medium">QRWolf</span>
              </div>
              <svg className="w-5 h-5 text-muted-foreground rotate-90 md:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background">
                <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>Any Destination</span>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Dynamic QR codes route through QRWolf, so you can change the destination anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-b border-border/30 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'QR codes created this month' },
              { value: '99.9%', label: 'Uptime guarantee' },
              { value: '120+', label: 'Countries reached' },
              { value: '1M+', label: 'Scans tracked for users' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-3xl md:text-5xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Types Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              16 QR Types
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              One tool for <span className="gradient-text">every QR code</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From simple URLs to interactive landing pages, create any type of QR code you need
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {QR_TYPES.map((type) => (
              <div
                key={type.name}
                className="group p-4 rounded-xl bg-secondary/30 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all cursor-pointer text-center"
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  {type.icon}
                </div>
                <p className="text-xs font-medium truncate">{type.name}</p>
                {type.pro && (
                  <span className="text-[10px] text-primary">Pro</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/signup">
              <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                Explore all QR types
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/*
        VIDEO DEMO SECTION - ARCHIVED
        Uncomment when video is ready

      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              See it in action
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Create a QR code in <span className="gradient-text">under 60 seconds</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Watch how easy it is to create, customize, and track your first dynamic QR code
            </p>
          </div>
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary/50 border border-border/50">
            // Video embed goes here
          </div>
        </div>
      </section>
      */}

      {/* Why QRWolf - Competitor Comparison */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Why choose <span className="gradient-text">QRWolf?</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We built the QR code tool we wished existed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Others */}
            <Card className="p-6 glass border-red-500/20">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <h3 className="font-semibold text-muted-foreground">Other QR Generators</h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Limited free tier</p>
                    <p className="text-xs text-muted-foreground">3-5 QR codes, then forced to upgrade</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Cluttered interfaces</p>
                    <p className="text-xs text-muted-foreground">Confusing dashboards, buried features</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Basic analytics only</p>
                    <p className="text-xs text-muted-foreground">Just scan counts, no location or device data</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Watermarks on free tier</p>
                    <p className="text-xs text-muted-foreground">Ugly branding on your QR codes</p>
                  </div>
                </li>
              </ul>
            </Card>

            {/* QRWolf */}
            <Card className="p-6 glass border-primary glow">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="6" height="6" />
                    <rect x="14" y="4" width="6" height="6" />
                    <rect x="4" y="14" width="6" height="6" />
                    <rect x="14" y="14" width="6" height="6" />
                  </svg>
                </div>
                <h3 className="font-semibold">QRWolf</h3>
                <Badge className="bg-primary/10 text-primary text-xs">Recommended</Badge>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Generous free tier</p>
                    <p className="text-xs text-muted-foreground">Unlimited static QR codes, forever free</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Clean, intuitive Studio</p>
                    <p className="text-xs text-muted-foreground">Step-by-step creation, live preview</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Rich analytics</p>
                    <p className="text-xs text-muted-foreground">Location, device, time, and trend data</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">No watermarks ever</p>
                    <p className="text-xs text-muted-foreground">Clean, professional QR codes on all plans</p>
                  </div>
                </li>
              </ul>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Link href="/signup">
              <Button size="lg" className="glow-hover">
                Try QRWolf Free
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic vs Static Comparison */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Static vs Dynamic: <span className="gradient-text">What&apos;s the difference?</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Static QR codes link directly to a URL. Dynamic QR codes route through us,
            so you can change the destination anytime and track every scan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Static Card */}
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4">Static QR Code</h3>
              <ul className="space-y-3 mb-4">
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Free forever
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Direct link to destination
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Cannot change after printing
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  No scan tracking
                </li>
              </ul>
              <p className="text-xs text-muted-foreground border-t border-border/50 pt-4">
                Best for: Personal use, one-time links
              </p>
            </Card>

            {/* Dynamic Card - highlighted */}
            <Card className="p-6 glass border-primary glow">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Dynamic QR Code</h3>
                <Badge className="bg-primary/10 text-primary text-xs">Pro</Badge>
              </div>
              <ul className="space-y-3 mb-4">
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Edit destination anytime
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Track every scan
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Set expiration dates
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Password protection
                </li>
              </ul>
              <p className="text-xs text-muted-foreground border-t border-border/50 pt-4">
                Best for: Business, marketing campaigns, menus
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to <span className="gradient-text">create & track</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From simple QR codes to enterprise analytics, QRWolf has you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="p-6 glass hover:glow transition-all duration-300 relative overflow-hidden">
                {feature.tier !== 'free' && (
                  <div className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium ${
                    feature.tier === 'pro'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {feature.tier === 'pro' ? 'Pro' : 'Business'}
                  </div>
                )}
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section className="py-24 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Mock Dashboard */}
            <div className="order-2 lg:order-1">
              <Card className="p-6 glass glow overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <span className="font-semibold">Scan Analytics</span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Total Scans</p>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-xs text-green-500">+23% this week</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Unique Visitors</p>
                    <p className="text-2xl font-bold">892</p>
                    <p className="text-xs text-green-500">+18% this week</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Top Location</p>
                    <p className="text-lg font-semibold">United States</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Peak Time</p>
                    <p className="text-lg font-semibold">2-4 PM</p>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="h-16 bg-secondary/30 rounded-lg flex items-end justify-around px-2 pb-2">
                  {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                    <div key={i} className="w-6 bg-primary/60 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: Copy */}
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Pro Feature
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What if you knew <span className="gradient-text">exactly</span> when they scan?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop guessing. See real-time data on who&apos;s scanning your QR codes,
                where they&apos;re located, and when they&apos;re most active.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Location data</p>
                    <p className="text-sm text-muted-foreground">Country and city breakdowns</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Device insights</p>
                    <p className="text-sm text-muted-foreground">Mobile, tablet, or desktop</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Time patterns</p>
                    <p className="text-sm text-muted-foreground">Peak hours and days</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Trend tracking</p>
                    <p className="text-sm text-muted-foreground">Performance over time</p>
                  </div>
                </li>
              </ul>

              <Link href="/signup">
                <Button size="lg" className="glow-hover">
                  Get Analytics with Pro
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Branding Showcase */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Pro Feature
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What if your QR code <span className="gradient-text">looked like you?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Generic QR codes get ignored. Branded QR codes get scanned.
                Add your logo and colors to create instant recognition and build trust.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Build trust instantly</p>
                    <p className="text-sm text-muted-foreground">People scan codes they recognize</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Increase engagement</p>
                    <p className="text-sm text-muted-foreground">Branded codes see up to 80% more scans</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Your logo, front and center</p>
                    <p className="text-sm text-muted-foreground">Upload any image, auto-optimized for scanning</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Match your brand colors</p>
                    <p className="text-sm text-muted-foreground">Custom foreground and background colors</p>
                  </div>
                </li>
              </ul>

              <Link href="/signup">
                <Button size="lg" className="glow-hover">
                  Start Branding with Pro
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Button>
              </Link>
            </div>

            {/* Right: Visual Demo */}
            <div className="order-first lg:order-last">
              <Card className="p-8 glass glow overflow-hidden">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">Your brand, your QR code</p>
                </div>

                {/* Mock QR Code Comparison */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Generic QR */}
                  <div className="text-center">
                    <div className="bg-white p-3 rounded-xl mb-3 aspect-square">
                      <Image
                        src="/codes/qrwolf-qr-wolf-4.png"
                        alt="Generic black and white QR code"
                        width={200}
                        height={200}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Generic</p>
                  </div>

                  {/* Branded QR */}
                  <div className="text-center">
                    <div className="rounded-xl mb-3 aspect-square bg-white p-3">
                      <Image
                        src="/codes/qrwolf-qrwolf-2.png"
                        alt="Branded QR code with custom logo"
                        width={200}
                        height={200}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-primary font-medium">Branded</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-muted-foreground">12%</p>
                    <p className="text-xs text-muted-foreground">Scan rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">47%</p>
                    <p className="text-xs text-primary">Scan rate</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Design Showcase */}
      <section className="py-24 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* LEFT: Visual Showcase Card */}
            <Card className="p-10 glass glow overflow-hidden">
              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">Same QR code, infinite styles</p>
              </div>

              {/* 2-panel Grid of Styled QR Codes */}
              <div className="grid grid-cols-2 gap-8">
                {/* Panel 1: Gradient Dots */}
                <div className="w-full aspect-square rounded-xl bg-white p-4">
                  <Image
                    src="/codes/qrwolf-qr-wolf.png"
                    alt="QR code with gradient and dots pattern"
                    width={300}
                    height={300}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Panel 2: Custom Pattern */}
                <div className="w-full aspect-square rounded-xl bg-[#0f172a] p-4">
                  <Image
                    src="/codes/qrwolf-qrwolf-3.png"
                    alt="QR code with custom pattern style"
                    width={300}
                    height={300}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Bottom stat bar */}
              <div className="mt-6 pt-6 border-t border-border/50 text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="text-2xl font-bold text-primary">∞</span> style combinations
                </p>
              </div>
            </Card>

            {/* RIGHT: Copy + Features + CTA */}
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Pro Feature
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What if your QR code was a{' '}
                <span className="gradient-text">work of art?</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Go beyond basic squares. With Pro, unlock creative styling options that make
                your QR codes truly stand out and match your brand perfectly.
              </p>

              <ul className="space-y-4 mb-8">
                {/* 1. Module Patterns */}
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/>
                      <rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">6 unique patterns</p>
                    <p className="text-sm text-muted-foreground">From classic squares to elegant dots</p>
                  </div>
                </li>

                {/* 2. Corner Styles */}
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h4v4H4z"/>
                      <path d="M4 16h4v4H4z"/>
                      <path d="M16 4h4v4h-4z"/>
                      <circle cx="18" cy="18" r="2"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Custom corner styles</p>
                    <p className="text-sm text-muted-foreground">6 eye shapes, mix and match</p>
                  </div>
                </li>

                {/* 3. Gradients */}
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 2a10 10 0 0 1 0 20"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Stunning gradients</p>
                    <p className="text-sm text-muted-foreground">6 presets or create your own blend</p>
                  </div>
                </li>

                {/* 4. Frames */}
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <rect x="7" y="7" width="10" height="10"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Decorative frames</p>
                    <p className="text-sm text-muted-foreground">Add call-to-action text around your code</p>
                  </div>
                </li>
              </ul>

              <Link href="/plans">
                <Button size="lg" className="glow-hover">
                  Unlock Creative Design
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases - Detailed */}
      <section id="use-cases" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Use Cases
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for <span className="gradient-text">how you work</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how businesses like yours use QRWolf to connect with customers
            </p>
          </div>

          {/* Featured Use Cases */}
          <div className="space-y-6">
            {/* Restaurant */}
            <Card className="p-6 md:p-8 glass overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                        <path d="M7 2v20" />
                        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Restaurants & Cafés</h3>
                      <p className="text-sm text-muted-foreground">Digital menus that update instantly</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">The problem:</span> Reprinting menus every time prices change costs hundreds. Paper menus get dirty and outdated.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">The solution:</span> One QR code on each table. Update prices, add specials, or swap the entire menu in seconds.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Menu QR</Badge>
                    <Badge variant="outline" className="text-xs">PDF Upload</Badge>
                    <Badge variant="outline" className="text-xs">Landing Page</Badge>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    </svg>
                    <span className="text-sm font-medium">Results</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">$2,400</p>
                      <p className="text-xs text-muted-foreground">Saved yearly on printing</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">10 sec</p>
                      <p className="text-xs text-muted-foreground">To update any menu item</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Marketing */}
            <Card className="p-6 md:p-8 glass overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1 bg-secondary/50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    </svg>
                    <span className="text-sm font-medium">Results</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">3x</p>
                      <p className="text-xs text-muted-foreground">More campaign flexibility</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">Real-time</p>
                      <p className="text-xs text-muted-foreground">A/B test tracking</p>
                    </div>
                  </div>
                </div>

                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 3v18h18" />
                        <path d="m19 9-5 5-4-4-3 3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Marketing & Advertising</h3>
                      <p className="text-sm text-muted-foreground">Campaigns you can measure and optimize</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">The problem:</span> Print campaigns can&apos;t be changed after printing. No way to know if billboards, flyers, or packaging actually drive traffic.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">The solution:</span> Dynamic QR codes that redirect anywhere. Change destinations mid-campaign. Track every scan by location and time.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Dynamic URL</Badge>
                    <Badge variant="outline" className="text-xs">Scan Analytics</Badge>
                    <Badge variant="outline" className="text-xs">Bulk Generation</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Events */}
            <Card className="p-6 md:p-8 glass overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                        <path d="M13 5v2M13 17v2M13 11v2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Events & Conferences</h3>
                      <p className="text-sm text-muted-foreground">Ticketing, check-in, and attendee engagement</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">The problem:</span> Managing hundreds of unique tickets is chaotic. No visibility into check-in patterns or attendee flow.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">The solution:</span> Bulk generate unique QR codes from CSV. Track when attendees arrive and from which entrance. Add password protection for VIP areas.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Bulk CSV</Badge>
                    <Badge variant="outline" className="text-xs">Event QR</Badge>
                    <Badge variant="outline" className="text-xs">Password Protection</Badge>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    </svg>
                    <span className="text-sm font-medium">Results</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">500+</p>
                      <p className="text-xs text-muted-foreground">Unique codes in minutes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">Live</p>
                      <p className="text-xs text-muted-foreground">Check-in dashboard</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Retail */}
            <Card className="p-6 md:p-8 glass overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1 bg-secondary/50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    </svg>
                    <span className="text-sm font-medium">Results</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">47%</p>
                      <p className="text-xs text-muted-foreground">Increase in engagement</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground">Packaging reprints needed</p>
                    </div>
                  </div>
                </div>

                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Product & Packaging</h3>
                      <p className="text-sm text-muted-foreground">Connect physical products to digital experiences</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">The problem:</span> Static product links become outdated. Packaging can&apos;t be updated once printed. No insight into customer engagement.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">The solution:</span> Dynamic QR codes on packaging that link to manuals, videos, or promotions. Update destinations anytime. See which products get scanned most.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Video QR</Badge>
                    <Badge variant="outline" className="text-xs">PDF Manual</Badge>
                    <Badge variant="outline" className="text-xs">Coupon Codes</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* More use cases grid */}
          <div className="mt-12">
            <p className="text-center text-sm text-muted-foreground mb-6">Also perfect for</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { title: 'Business Cards', icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                )},
                { title: 'Education', icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                )},
                { title: 'Healthcare', icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3" />
                    <path d="M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3" />
                    <line x1="12" x2="12" y1="4" y2="20" />
                    <line x1="4" x2="20" y1="12" y2="12" />
                  </svg>
                )},
                { title: 'Real Estate', icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                )},
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Trusted by <span className="gradient-text">businesses everywhere</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See what our users have to say about QRWolf
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="p-6 glass relative">
                {/* Quote mark */}
                <svg className="absolute top-4 right-4 w-8 h-8 text-primary/10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                <Badge className="mt-4 bg-secondary text-muted-foreground text-xs">
                  {testimonial.industry}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, <span className="gradient-text">transparent</span> pricing
            </h2>
            <p className="text-muted-foreground">
              Start free, upgrade when you need more.
            </p>
          </div>

          <PricingSection isAuthenticated={isAuthenticated} currentTier={currentTier} />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently asked <span className="gradient-text">questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <Card key={faq.question} className="p-6 glass">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Enterprise-grade <span className="gradient-text">security</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Your data is protected with industry-leading security practices
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <p className="text-sm font-medium">TLS 1.3 Encryption</p>
              <p className="text-xs text-muted-foreground mt-1">Data encrypted in transit</p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="text-sm font-medium">Encrypted at Rest</p>
              <p className="text-xs text-muted-foreground mt-1">AES-256 encryption</p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="text-sm font-medium">99.9% Uptime SLA</p>
              <p className="text-xs text-muted-foreground mt-1">Enterprise reliability</p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-sm font-medium">Privacy First</p>
              <p className="text-xs text-muted-foreground mt-1">We never sell your data</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              GDPR compliant • SOC 2 Type II • Anonymous scan tracking only
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            No credit card required
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Ready to create your first QR code?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of businesses using QRWolf to connect with their customers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="glow-hover text-lg px-8">
                Get Started Free
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Button>
            </Link>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              View pricing →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

const FEATURES = [
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

const FAQS = [
  {
    question: 'What is a dynamic QR code?',
    answer: 'A dynamic QR code contains a short URL that redirects to your destination. You can change where it points anytime without reprinting the QR code, set expiration dates, add password protection, and track every scan. Available on Pro and Business plans.',
  },
  {
    question: 'Do I need an account to create QR codes?',
    answer: 'No! You can try the QR generator without signing up. A free account is required to download and save your QR codes, and gives you access to all 16 QR types.',
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
    answer: 'Yes. All data is encrypted in transit (TLS 1.3) and at rest. We don\'t sell your data or track your visitors beyond anonymous scan analytics. Our infrastructure runs on enterprise-grade cloud providers with 99.9% uptime.',
  },
  {
    question: 'What happens if I downgrade my plan?',
    answer: 'Your existing QR codes will continue to work. However, you\'ll lose access to Pro/Business features like analytics, and dynamic QR codes beyond your plan\'s limit will become static (the last saved destination).',
  },
  {
    question: 'Do QR codes expire on the free plan?',
    answer: 'No! Static QR codes on the free plan never expire. They link directly to your destination and will work forever. Only dynamic QR codes (Pro feature) can have optional expiration dates.',
  },
  {
    question: 'What\'s your refund policy?',
    answer: 'We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied, contact us within 14 days of purchase for a full refund, no questions asked.',
  },
];

const QR_TYPES = [
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

const TESTIMONIALS = [
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
];
