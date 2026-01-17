import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function LandingPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();

  // Fetch QR code with landing page settings
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select(`
      id,
      destination_url,
      content,
      show_landing_page,
      landing_page_title,
      landing_page_description,
      landing_page_logo_url,
      landing_page_button_text,
      landing_page_theme
    `)
    .eq('short_code', code)
    .single();

  if (error || !qrCode) {
    notFound();
  }

  // If landing page not enabled, redirect to main route
  if (!qrCode.show_landing_page) {
    redirect(`/r/${code}`);
  }

  // Get destination URL
  let destinationUrl = qrCode.destination_url;
  if (!destinationUrl && qrCode.content) {
    const content = qrCode.content as { type?: string; url?: string };
    if (content.type === 'url' && content.url) {
      destinationUrl = content.url;
    }
  }

  if (!destinationUrl) {
    redirect('/');
  }

  const theme = qrCode.landing_page_theme || 'dark';
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDark
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        {qrCode.landing_page_logo_url && (
          <div className="mb-8">
            <Image
              src={qrCode.landing_page_logo_url}
              alt="Logo"
              width={64}
              height={64}
              className="h-16 w-auto mx-auto object-contain"
              unoptimized
            />
          </div>
        )}

        {/* Title */}
        {qrCode.landing_page_title && (
          <h1 className={`text-3xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {qrCode.landing_page_title}
          </h1>
        )}

        {/* Description */}
        {qrCode.landing_page_description && (
          <p className={`text-lg mb-8 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {qrCode.landing_page_description}
          </p>
        )}

        {/* CTA Button */}
        <a href={destinationUrl}>
          <Button size="lg" className="px-8 py-6 text-lg">
            {qrCode.landing_page_button_text || 'Continue'}
            <ArrowIcon className="w-5 h-5 ml-2" />
          </Button>
        </a>

        {/* Powered by */}
        <p className={`mt-12 text-sm ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Powered by{' '}
          <Link href="/" className="hover:underline">
            QRWolf
          </Link>
        </p>
      </div>
    </div>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
