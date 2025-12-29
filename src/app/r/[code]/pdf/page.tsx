import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { PDFContent } from '@/lib/qr/types';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function PDFLandingPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('content, style, name')
    .eq('short_code', code)
    .eq('content_type', 'pdf')
    .single();

  if (error || !qrCode) {
    notFound();
  }

  const content = qrCode.content as PDFContent;
  const style = qrCode.style as { logoUrl?: string } | null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          {style?.logoUrl && (
            <img src={style.logoUrl} alt="Logo" className="h-12 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-white">{content.fileName || qrCode.name}</h1>
          <p className="text-slate-400 mt-1">
            {formatFileSize(content.fileSize)}
          </p>
        </div>

        {/* PDF Preview */}
        <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-2xl">
          <iframe
            src={`${content.fileUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full"
            title={content.fileName}
          />
        </div>

        {/* Download Button */}
        <div className="mt-6 text-center">
          <a
            href={content.fileUrl}
            download={content.fileName}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </a>
        </div>

        {/* Powered by */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Powered by{' '}
          <Link href="/" className="hover:text-primary transition-colors">
            QRWolf
          </Link>
        </p>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
