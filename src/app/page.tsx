import { QRGenerator } from '@/components/qr';
import { Footer, PublicNav } from '@/components/layout';
import { createClient } from '@/lib/supabase/server';
import { jsonLd } from '@/constants/homepage';
import {
  HeroSection,
  HowItWorksSection,
  StatsSection,
  QRTypesSection,
  ComparisonSection,
  StaticVsDynamicSection,
  FeaturesGridSection,
  AnalyticsShowcaseSection,
  BrandingShowcaseSection,
  CreativeDesignSection,
  UseCasesSection,
  TestimonialsSection,
  PricingDisplaySection,
  FAQSection,
  SecuritySection,
  FinalCTASection,
} from '@/components/homepage';

export default async function Home() {
  // Check if user is authenticated for pricing section
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
      <HeroSection />

      {/* QR Generator Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <QRGenerator />
        </div>
      </section>

      {/* How It Works */}
      <HowItWorksSection />

      {/* Stats Section */}
      <StatsSection />

      {/* QR Types Showcase */}
      <QRTypesSection />

      {/* Why QRWolf - Competitor Comparison */}
      <ComparisonSection />

      {/* Dynamic vs Static Comparison */}
      <StaticVsDynamicSection />

      {/* Features Section */}
      <FeaturesGridSection />

      {/* Analytics Showcase */}
      <AnalyticsShowcaseSection />

      {/* Branding Showcase */}
      <BrandingShowcaseSection />

      {/* Creative Design Showcase */}
      <CreativeDesignSection />

      {/* Use Cases - Detailed */}
      <UseCasesSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingDisplaySection
        isAuthenticated={isAuthenticated}
        currentTier={currentTier}
      />

      {/* FAQ Section */}
      <FAQSection />

      {/* Security & Trust */}
      <SecuritySection />

      {/* Final CTA */}
      <FinalCTASection />

      <Footer />
    </main>
  );
}
