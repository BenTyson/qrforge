import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CopyButton } from './CopyButton';

interface PageProps {
  params: Promise<{ code: string }>;
}

interface TextContent {
  type: 'text';
  text: string;
}

export default async function TextPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('id, content, content_type, name')
    .eq('short_code', code)
    .single();

  if (error || !qrCode || qrCode.content_type !== 'text') {
    notFound();
  }

  const content = qrCode.content as TextContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          {/* Text Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {qrCode.name || 'Text Content'}
          </h1>
          <p className="text-slate-400 text-center mb-8">
            Shared via QR code
          </p>

          {/* Text Content */}
          <div className="bg-slate-900/50 rounded-lg p-6 relative">
            <div className="absolute top-3 right-3">
              <CopyButton text={content.text} />
            </div>
            <p className="text-white whitespace-pre-wrap pr-10">{content.text}</p>
          </div>

          {/* Powered by */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Powered by{' '}
            <Link href="/" className="hover:underline text-slate-400">
              QRWolf
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
