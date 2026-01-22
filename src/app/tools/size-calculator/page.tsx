import { Metadata } from 'next';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { SizeCalculator } from '@/components/tools/SizeCalculator';
import { Calculator } from 'lucide-react';

export const metadata: Metadata = {
  title: 'QR Code Size Calculator - Find the Perfect Print Size | QRWolf',
  description: 'Free QR code size calculator. Enter your scanning distance to get minimum and recommended dimensions for business cards, posters, packaging, and signage.',
  openGraph: {
    title: 'QR Code Size Calculator | QRWolf',
    description: 'Calculate the perfect QR code size for any scanning distance.',
  },
  other: {
    'script:ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'QR Code Size Calculator',
      description: 'Calculate the optimal QR code print size based on scanning distance',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      provider: {
        '@type': 'Organization',
        name: 'QRWolf',
        url: 'https://qrwolf.com',
      },
    }),
  },
};

export default function SizeCalculatorPage() {
  return (
    <>
      <PublicNav showAuthButtons={true} />
      <main className="min-h-screen pt-24 pb-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating orbs */}
          <div className="absolute top-32 left-10 w-72 h-72 rounded-full bg-primary/20 blur-[120px] animate-pulse" />
          <div className="absolute top-64 right-20 w-96 h-96 rounded-full bg-cyan-500/15 blur-[150px]" />
          <div className="absolute bottom-32 left-1/3 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(rgba(20, 184, 166, 0.15) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto px-4 relative">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Calculator className="w-3 h-3 mr-1" />
              Free Tool
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              QR Code <span className="gradient-text">Size Calculator</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Calculate the perfect QR code size for any scanning distance. Get minimum and recommended
              dimensions for reliable scanning on business cards, posters, packaging, and signage.
            </p>
          </div>

          {/* Calculator Component */}
          <SizeCalculator />
        </div>
      </main>
      <Footer />
    </>
  );
}
