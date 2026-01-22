import { Metadata } from 'next';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { QRReader } from '@/components/tools/QRReader';
import { ScanLine } from 'lucide-react';

export const metadata: Metadata = {
  title: 'QR Code Reader - Decode & Test QR Codes Online | QRWolf',
  description: 'Free online QR code reader. Upload an image or use your camera to decode QR codes instantly. Verify your codes work before printing.',
  openGraph: {
    title: 'QR Code Reader | QRWolf',
    description: 'Decode QR codes online. Upload an image or use your camera.',
  },
};

export default function QRReaderPage() {
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
              <ScanLine className="w-3 h-3 mr-1" />
              Free Tool
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              QR Code <span className="gradient-text">Reader</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Decode any QR code instantly. Upload an image or use your camera to see what&apos;s inside.
              Perfect for testing codes before printing.
            </p>
          </div>

          {/* QR Reader Component */}
          <QRReader />
        </div>
      </main>
      <Footer />
    </>
  );
}
