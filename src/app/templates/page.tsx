import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TemplateGallery } from '@/components/templates';
import { Sparkles, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'QR Code Templates | Pre-designed Templates by Industry | QRWolf',
  description: 'Browse 40+ professionally designed QR code templates for restaurants, businesses, marketing, events, and more. Start with a template and customize to match your brand.',
  openGraph: {
    title: 'QR Code Templates | Pre-designed Templates by Industry | QRWolf',
    description: 'Browse 40+ professionally designed QR code templates for restaurants, businesses, marketing, events, and more.',
  },
};

function TemplateGalleryFallback() {
  return (
    <div className="space-y-6">
      {/* Search skeleton */}
      <div className="max-w-md mx-auto h-12 bg-slate-800/50 rounded-lg animate-pulse" />
      {/* Category pills skeleton */}
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-24 h-10 bg-slate-800/50 rounded-full animate-pulse" />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-slate-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <>
      <PublicNav showAuthButtons={true} />
      <main className="min-h-screen pt-24 pb-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating orbs */}
          <div className="absolute top-32 left-10 w-40 sm:w-56 md:w-72 h-40 sm:h-56 md:h-72 rounded-full bg-primary/20 blur-[80px] sm:blur-[100px] md:blur-[120px] animate-pulse" />
          <div className="absolute top-64 right-20 w-56 sm:w-72 md:w-96 h-56 sm:h-72 md:h-96 rounded-full bg-cyan-500/15 blur-[100px] sm:blur-[120px] md:blur-[150px]" />
          <div className="absolute bottom-32 left-1/3 w-40 sm:w-52 md:w-64 h-40 sm:h-52 md:h-64 rounded-full bg-primary/10 blur-[70px] sm:blur-[85px] md:blur-[100px]" />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(rgba(20, 184, 166, 0.15) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              40+ Templates
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              QR Code <span className="gradient-text">Templates</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Start with a professionally designed template. Pre-configured styles for restaurants, businesses, marketing, events, and more.
            </p>
          </div>

          {/* Gallery with Suspense for loading state */}
          <Suspense fallback={<TemplateGalleryFallback />}>
            <TemplateGallery />
          </Suspense>

          {/* CTA Section */}
          <div className="mt-20 text-center animate-slide-up" style={{ animationDelay: '400ms' }}>
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 p-8">
              <h2 className="text-2xl font-semibold mb-3">
                Want to start from scratch?
              </h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Create a custom QR code with your own colors, patterns, and style. Full creative control.
              </p>
              <Link href="/qr-codes/new">
                <Button size="lg" className="glow-hover group">
                  Create Custom QR Code
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
