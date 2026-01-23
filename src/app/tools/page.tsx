import { Metadata } from 'next';
import Link from 'next/link';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wrench, Calculator, Palette, ScanLine, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free QR Code Tools | QRWolf',
  description: 'Free QR code tools to help you create perfect codes. Size calculator, contrast checker, QR decoder, and more.',
  openGraph: {
    title: 'Free QR Code Tools | QRWolf',
    description: 'Free QR code tools to help you create perfect codes.',
  },
};

interface Tool {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  available: boolean;
}

const TOOLS: Tool[] = [
  {
    title: 'Size Calculator',
    description: 'Calculate the perfect QR code size for any scanning distance. Get minimum and recommended dimensions for business cards, posters, and signage.',
    href: '/tools/size-calculator',
    icon: <Calculator className="w-6 h-6" />,
    available: true,
  },
  {
    title: 'Contrast Checker',
    description: 'Check if your QR code colors have sufficient contrast for reliable scanning. Prevent codes that won\'t scan.',
    href: '/tools/contrast-checker',
    icon: <Palette className="w-6 h-6" />,
    available: true,
  },
  {
    title: 'QR Code Reader',
    description: 'Upload a QR code image and decode its contents. Verify your codes work before printing.',
    href: '/tools/qr-reader',
    icon: <ScanLine className="w-6 h-6" />,
    available: true,
  },
];

export default function ToolsPage() {
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

        <div className="max-w-4xl mx-auto px-4 relative">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Wrench className="w-3 h-3 mr-1" />
              Free Tools
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Free <span className="gradient-text">QR Code Tools</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Helpful tools to create perfect QR codes. Calculate sizes, check contrast, decode existing codes, and more.
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {TOOLS.map((tool, index) => (
              <Link
                key={tool.href}
                href={tool.available ? tool.href : '#'}
                className={`group animate-slide-up ${!tool.available ? 'pointer-events-none' : ''}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Card className={`h-full bg-slate-800/50 backdrop-blur-xl border-slate-700/50 transition-all duration-300 ${
                  tool.available
                    ? 'hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1'
                    : 'opacity-60'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center text-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow">
                        {tool.icon}
                      </div>
                      {!tool.available && (
                        <Badge variant="outline" className="text-xs border-slate-600/50 text-slate-400">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <CardTitle className={`text-lg flex items-center gap-2 ${tool.available ? 'group-hover:text-primary' : ''} transition-colors`}>
                      {tool.title}
                      {tool.available && (
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center animate-slide-up" style={{ animationDelay: '320ms' }}>
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 p-8">
              <h2 className="text-2xl font-semibold mb-3">
                Need to create a QR code?
              </h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Create unlimited QR codes for free. Dynamic codes, custom designs, analytics, and more.
              </p>
              <Link href="/qr-codes/new">
                <Button size="lg" className="glow-hover group">
                  Create QR Code Free
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
