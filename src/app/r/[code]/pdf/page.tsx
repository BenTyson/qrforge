import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { PDFContent } from '@/lib/qr/types';

interface PageProps {
  params: Promise<{ code: string }>;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
  const accentColor = '#14b8a6';

  return (
    <div
      className="min-h-screen py-8 px-4 relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at top, ${accentColor}15 0%, transparent 50%),
                     radial-gradient(ellipse at bottom right, #ef444420 0%, transparent 50%),
                     linear-gradient(to bottom, #0f172a, #1e293b)`,
      }}
    >
      {/* Floating orbs */}
      <div
        className="absolute top-20 right-[15%] w-64 h-64 rounded-full blur-3xl opacity-15 animate-pulse"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute bottom-40 left-[10%] w-48 h-48 rounded-full blur-2xl opacity-20 animate-pulse"
        style={{ backgroundColor: '#ef4444', animationDelay: '1s' }}
      />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Card */}
        <div
          className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6 animate-fade-in"
          style={{ boxShadow: `0 20px 40px ${accentColor}15` }}
        >
          <div className="flex items-start gap-4">
            {/* PDF Icon */}
            <div
              className="w-16 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
              }}
            >
              <span className="text-white font-bold text-lg">PDF</span>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              {style?.logoUrl && (
                <Image
                  src={style.logoUrl}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto mb-3 object-contain"
                  unoptimized
                />
              )}
              <h1 className="text-xl font-bold text-white truncate">
                {content.fileName || qrCode.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  PDF Document
                </span>
                {content.fileSize > 0 && (
                  <span className="text-xs text-slate-400">
                    {formatFileSize(content.fileSize)}
                  </span>
                )}
              </div>
            </div>

            {/* Download Button */}
            <a
              href={content.fileUrl}
              download={content.fileName}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                boxShadow: `0 8px 24px ${accentColor}40`,
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </a>
          </div>
        </div>

        {/* PDF Preview */}
        <div
          className="bg-slate-800/40 backdrop-blur rounded-2xl border border-white/10 overflow-hidden animate-slide-up"
          style={{ animationDelay: '100ms', boxShadow: `0 20px 40px rgba(0,0,0,0.3)` }}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-slate-400 truncate max-w-[200px]">{content.fileName}</span>
            <div className="flex items-center gap-2">
              <a
                href={content.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                title="Open in new tab"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="aspect-[3/4] md:aspect-[4/3] bg-white">
            <iframe
              src={`${content.fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full"
              title={content.fileName}
            />
          </div>
        </div>

        {/* Mobile Download Button */}
        <div className="sm:hidden mt-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <a
            href={content.fileUrl}
            download={content.fileName}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-medium text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
              boxShadow: `0 8px 24px ${accentColor}40`,
            }}
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
        <p
          className="mt-10 text-center text-sm text-slate-500 animate-slide-up"
          style={{ animationDelay: '300ms' }}
        >
          Powered by{' '}
          <Link
            href="/"
            className="font-medium transition-colors hover:text-primary"
            style={{ color: accentColor }}
          >
            QRWolf
          </Link>
        </p>
      </div>
    </div>
  );
}
