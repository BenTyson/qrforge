import Link from 'next/link';
import Image from 'next/image';
import { QRGenerator } from '@/components/qr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingSection } from '@/components/pricing';
import { Footer, PublicNav } from '@/components/layout';
import { createClient } from '@/lib/supabase/server';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'QRWolf',
  description: 'Create professional QR codes in seconds. Free QR code generator with custom colors, logos, dynamic URLs, and real-time scan analytics.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
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
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '127',
  },
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
            src="/QRWolf_Logo_Color.png"
            alt="QRWolf Logo"
            width={180}
            height={203}
            className="logo-glow mb-6 drop-shadow-2xl"
            priority
          />
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            QRWolf
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-2">
            QR codes with <span className="text-primary font-semibold">teeth</span>
          </p>
          <p className="text-sm md:text-base text-white/60 max-w-md">
            Create, customize, and track professional QR codes in seconds
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

      {/* Stats Section */}
      <section className="py-16 border-t border-b border-border/30 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'QR Codes Generated' },
              { value: '99.9%', label: 'Uptime' },
              { value: '120+', label: 'Countries Reached' },
              { value: '1M+', label: 'Scans Tracked' },
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

      {/* Dynamic vs Static Comparison */}
      <section className="py-16 px-4">
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
                    <div className="bg-white p-4 rounded-xl mb-3 aspect-square flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Simplified QR pattern */}
                        <rect fill="#000" x="10" y="10" width="25" height="25" />
                        <rect fill="#000" x="65" y="10" width="25" height="25" />
                        <rect fill="#000" x="10" y="65" width="25" height="25" />
                        <rect fill="#fff" x="15" y="15" width="15" height="15" />
                        <rect fill="#fff" x="70" y="15" width="15" height="15" />
                        <rect fill="#fff" x="15" y="70" width="15" height="15" />
                        <rect fill="#000" x="18" y="18" width="9" height="9" />
                        <rect fill="#000" x="73" y="18" width="9" height="9" />
                        <rect fill="#000" x="18" y="73" width="9" height="9" />
                        {/* Data pattern */}
                        <rect fill="#000" x="40" y="10" width="5" height="5" />
                        <rect fill="#000" x="50" y="10" width="5" height="5" />
                        <rect fill="#000" x="40" y="20" width="5" height="5" />
                        <rect fill="#000" x="10" y="40" width="5" height="5" />
                        <rect fill="#000" x="20" y="45" width="5" height="5" />
                        <rect fill="#000" x="40" y="40" width="20" height="20" />
                        <rect fill="#000" x="65" y="40" width="5" height="5" />
                        <rect fill="#000" x="80" y="50" width="5" height="5" />
                        <rect fill="#000" x="70" y="70" width="5" height="5" />
                        <rect fill="#000" x="85" y="75" width="5" height="5" />
                        <rect fill="#000" x="75" y="85" width="5" height="5" />
                      </svg>
                    </div>
                    <p className="text-xs text-muted-foreground">Generic</p>
                  </div>

                  {/* Branded QR */}
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-xl mb-3 aspect-square flex items-center justify-center relative">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Branded QR pattern with teal color */}
                        <rect fill="#14b8a6" x="10" y="10" width="25" height="25" />
                        <rect fill="#14b8a6" x="65" y="10" width="25" height="25" />
                        <rect fill="#14b8a6" x="10" y="65" width="25" height="25" />
                        <rect fill="#fff" x="15" y="15" width="15" height="15" />
                        <rect fill="#fff" x="70" y="15" width="15" height="15" />
                        <rect fill="#fff" x="15" y="70" width="15" height="15" />
                        <rect fill="#14b8a6" x="18" y="18" width="9" height="9" />
                        <rect fill="#14b8a6" x="73" y="18" width="9" height="9" />
                        <rect fill="#14b8a6" x="18" y="73" width="9" height="9" />
                        {/* Data pattern */}
                        <rect fill="#14b8a6" x="40" y="10" width="5" height="5" />
                        <rect fill="#14b8a6" x="50" y="10" width="5" height="5" />
                        <rect fill="#14b8a6" x="40" y="20" width="5" height="5" />
                        <rect fill="#14b8a6" x="10" y="40" width="5" height="5" />
                        <rect fill="#14b8a6" x="20" y="45" width="5" height="5" />
                        <rect fill="#14b8a6" x="65" y="40" width="5" height="5" />
                        <rect fill="#14b8a6" x="80" y="50" width="5" height="5" />
                        <rect fill="#14b8a6" x="70" y="70" width="5" height="5" />
                        <rect fill="#14b8a6" x="85" y="75" width="5" height="5" />
                        <rect fill="#14b8a6" x="75" y="85" width="5" height="5" />
                        {/* Center logo area */}
                        <circle cx="50" cy="50" r="15" fill="#fff" />
                        <circle cx="50" cy="50" r="12" fill="#14b8a6" opacity="0.1" />
                        <text x="50" y="55" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#14b8a6">W</text>
                      </svg>
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

      {/* Use Cases */}
      <section className="py-24 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perfect for <span className="gradient-text">every use case</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {USE_CASES.map((useCase) => (
              <Card key={useCase.title} className="p-6 text-center glass hover:scale-105 transition-transform cursor-pointer group">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  {useCase.icon}
                </div>
                <h3 className="font-medium">{useCase.title}</h3>
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

const USE_CASES = [
  {
    title: 'Restaurants',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
  },
  {
    title: 'Product Packaging',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    title: 'Events & Tickets',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
      </svg>
    ),
  },
  {
    title: 'Business Cards',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    title: 'Retail & Stores',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
        <path d="M2 7h20" />
        <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
      </svg>
    ),
  },
  {
    title: 'Marketing',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    title: 'Education',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    title: 'Healthcare',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3" />
        <path d="M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3" />
        <line x1="12" x2="12" y1="4" y2="20" />
        <line x1="4" x2="20" y1="12" y2="12" />
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
    answer: 'No! You can create unlimited static QR codes without signing up. An account is only needed for dynamic QR codes, analytics, and other Pro features.',
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
];
