'use client';

import type { PDFContent } from '@/lib/qr/types';

interface PDFPreviewProps {
  content: Partial<PDFContent>;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function PDFPreview({ content, className }: PDFPreviewProps) {
  const fileName = content.fileName || 'document.pdf';
  const fileSize = content.fileSize || 0;
  const hasFile = !!content.fileUrl;
  const accentColor = '#14b8a6';

  return (
    <div className={className}>
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[3rem] p-2 shadow-2xl">
        {/* Screen */}
        <div
          className="relative w-full h-full rounded-[2.5rem] overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at top, ${accentColor}15 0%, transparent 50%),
                         linear-gradient(to bottom, #0f172a, #1e293b)`,
          }}
        >
          {/* Floating decorations */}
          <div
            className="absolute top-10 right-8 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="absolute bottom-20 left-4 w-24 h-24 rounded-full blur-2xl opacity-15"
            style={{ backgroundColor: accentColor }}
          />

          {/* Content */}
          <div className="relative h-full px-4 py-6 flex flex-col items-center overflow-y-auto">
            {/* PDF Icon */}
            <div
              className="w-20 h-24 mt-6 mb-4 rounded-lg flex items-center justify-center animate-fade-in"
              style={{
                background: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`,
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
              }}
            >
              <span className="text-white font-bold text-xl">PDF</span>
            </div>

            {/* File Name */}
            <h2
              className="text-sm font-semibold text-white text-center mb-1 px-2 animate-slide-up max-w-full truncate"
              style={{ animationDelay: '100ms' }}
            >
              {fileName}
            </h2>

            {/* File Size */}
            {fileSize > 0 && (
              <p
                className="text-xs text-slate-400 animate-slide-up"
                style={{ animationDelay: '150ms' }}
              >
                {formatFileSize(fileSize)}
              </p>
            )}

            {/* PDF Preview Placeholder */}
            <div
              className="w-full flex-1 mt-4 rounded-xl overflow-hidden border border-white/10 bg-white animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              {hasFile ? (
                <div className="w-full h-full flex flex-col">
                  {/* Simulated PDF header */}
                  <div className="h-6 bg-slate-100 border-b border-slate-200 flex items-center px-2 gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  {/* PDF content simulation */}
                  <div className="flex-1 p-3 space-y-2">
                    <div className="h-2 bg-slate-200 rounded w-3/4" />
                    <div className="h-2 bg-slate-200 rounded w-full" />
                    <div className="h-2 bg-slate-200 rounded w-5/6" />
                    <div className="h-2 bg-slate-200 rounded w-2/3" />
                    <div className="h-2 bg-slate-200 rounded w-full mt-4" />
                    <div className="h-2 bg-slate-200 rounded w-4/5" />
                    <div className="h-2 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-slate-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <p className="text-xs text-slate-400">No PDF uploaded</p>
                  </div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <button
              className="w-full mt-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all animate-slide-up"
              style={{
                animationDelay: '300ms',
                backgroundColor: accentColor,
                color: 'white',
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>

            {/* Powered by */}
            <p className="mt-auto pt-2 text-[10px] text-slate-500">
              Powered by QRWolf
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
