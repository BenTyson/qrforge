import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCompetitor, getAllCompetitorSlugs } from '@/lib/competitors';
import { Footer } from '@/components/layout';

interface PageProps {
  params: Promise<{ competitor: string }>;
}

// Generate static paths for all competitors
export async function generateStaticParams() {
  return getAllCompetitorSlugs().map((slug) => ({
    competitor: slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { competitor: slug } = await params;
  const competitor = getCompetitor(slug);

  if (!competitor) {
    return {
      title: 'Comparison Not Found | QRWolf',
    };
  }

  return {
    title: `QRWolf vs ${competitor.name} - Feature Comparison | QRWolf`,
    description: `Compare QRWolf and ${competitor.name}. See pricing, features, and why businesses are switching to QRWolf for their QR code needs.`,
    openGraph: {
      title: `QRWolf vs ${competitor.name}`,
      description: competitor.tagline,
      type: 'website',
    },
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { competitor: slug } = await params;
  const competitor = getCompetitor(slug);

  if (!competitor) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-primary/20 text-primary">
            Comparison
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            QRWolf vs {competitor.name}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {competitor.tagline}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg">Try QRWolf Free</Button>
            </Link>
            <Link href="/qr-codes/new">
              <Button size="lg" variant="outline">
                Create QR Code
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-muted-foreground text-center">
            {competitor.description}
          </p>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-12 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Feature Comparison
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold text-primary">
                      QRWolf
                    </th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">
                      {competitor.name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competitor.features.map((row, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-background' : 'bg-secondary/20'}
                    >
                      <td className="p-4">{row.feature}</td>
                      <td className="p-4 text-center">
                        <FeatureValue value={row.qrwolf} positive />
                      </td>
                      <td className="p-4 text-center">
                        <FeatureValue value={row.competitor} positive={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Pricing Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QRWolf Pricing */}
            <Card className="p-6 border-primary/50">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-primary mb-2">QRWolf</h3>
                <p className="text-muted-foreground text-sm">
                  Transparent, simple pricing
                </p>
              </div>
              <div className="space-y-4">
                <PricingTier name="Free" price={competitor.pricing.qrwolfFree} />
                <PricingTier name="Pro" price={competitor.pricing.qrwolfPro} highlight />
                <PricingTier name="Business" price={competitor.pricing.qrwolfBusiness} />
              </div>
            </Card>

            {/* Competitor Pricing */}
            <Card className="p-6 opacity-75">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{competitor.name}</h3>
                <p className="text-muted-foreground text-sm">
                  Starting at {competitor.pricingStart}
                </p>
              </div>
              <div className="space-y-4">
                <PricingTier name="Free" price={competitor.pricing.competitorFree} />
                <PricingTier name="Pro" price={competitor.pricing.competitorPro} />
                <PricingTier name="Business" price={competitor.pricing.competitorBusiness} />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Switch */}
      <section className="py-12 px-4 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why Switch to QRWolf?
          </h2>
          <Card className="p-8">
            <ul className="space-y-4">
              {competitor.whySwitch.map((reason, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-primary font-bold">+</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to make the switch?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of businesses using QRWolf for their QR code needs.
            Start free and upgrade when you need more.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg">Start Free Today</Button>
            </Link>
            <Link href="/settings">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureValue({ value, positive }: { value: boolean | string; positive: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className={positive ? 'text-primary' : 'text-muted-foreground'}>
        <CheckIcon />
      </span>
    ) : (
      <span className="text-muted-foreground/50">
        <XIcon />
      </span>
    );
  }
  return (
    <span className={positive ? 'text-primary font-medium' : 'text-muted-foreground'}>
      {value}
    </span>
  );
}

function PricingTier({
  name,
  price,
  highlight = false,
}: {
  name: string;
  price: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center p-3 rounded-lg ${
        highlight ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/50'
      }`}
    >
      <span className="font-medium">{name}</span>
      <span className={highlight ? 'font-bold text-primary' : ''}>{price}</span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 inline"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className="w-5 h-5 inline"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
