import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { BusinessContent } from '@/lib/qr/types';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function BusinessLandingPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('content')
    .eq('short_code', code)
    .eq('content_type', 'business')
    .single();

  if (error || !qrCode) {
    notFound();
  }

  const content = qrCode.content as BusinessContent;
  const accentColor = content.accentColor || '#14b8a6';

  // Generate vCard data
  const vCardData = generateVCard(content);
  const vCardUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardData)}`;

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background: `linear-gradient(135deg, ${accentColor}15 0%, #0f172a 100%)`,
      }}
    >
      <div className="max-w-md mx-auto">
        {/* Profile Card */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 shadow-xl border border-slate-700/50">
          {/* Photo */}
          {content.photoUrl && (
            <div className="flex justify-center mb-4">
              <img
                src={content.photoUrl}
                alt={content.name}
                className="w-28 h-28 rounded-full object-cover border-4 shadow-lg"
                style={{ borderColor: accentColor }}
              />
            </div>
          )}

          {/* Name & Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">{content.name}</h1>
            {content.title && (
              <p className="text-slate-300 mt-1">{content.title}</p>
            )}
            {content.company && (
              <p className="text-slate-400 text-sm mt-1">{content.company}</p>
            )}
          </div>

          {/* Bio */}
          {content.bio && (
            <p className="text-slate-300 text-center mb-6 text-sm">{content.bio}</p>
          )}

          {/* Contact Info */}
          <div className="space-y-3">
            {content.email && (
              <a
                href={`mailto:${content.email}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}30` }}>
                  <svg className="w-5 h-5" style={{ color: accentColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-white text-sm truncate">{content.email}</p>
                </div>
              </a>
            )}

            {content.phone && (
              <a
                href={`tel:${content.phone}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}30` }}>
                  <svg className="w-5 h-5" style={{ color: accentColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-white text-sm truncate">{content.phone}</p>
                </div>
              </a>
            )}

            {content.website && (
              <a
                href={content.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}30` }}>
                  <svg className="w-5 h-5" style={{ color: accentColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400">Website</p>
                  <p className="text-white text-sm truncate">{content.website}</p>
                </div>
              </a>
            )}

            {content.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(content.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}30` }}>
                  <svg className="w-5 h-5" style={{ color: accentColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400">Address</p>
                  <p className="text-white text-sm">{content.address}</p>
                </div>
              </a>
            )}
          </div>

          {/* Save Contact Button */}
          <div className="mt-6">
            <a
              href={vCardUrl}
              download={`${content.name.replace(/\s+/g, '_')}.vcf`}
              className="flex items-center justify-center gap-2 w-full p-4 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Contact
            </a>
          </div>
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

function generateVCard(content: BusinessContent): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${content.name}`,
    `N:;${content.name};;;`,
  ];

  if (content.title) lines.push(`TITLE:${content.title}`);
  if (content.company) lines.push(`ORG:${content.company}`);
  if (content.email) lines.push(`EMAIL:${content.email}`);
  if (content.phone) lines.push(`TEL:${content.phone}`);
  if (content.website) lines.push(`URL:${content.website}`);
  if (content.address) lines.push(`ADR:;;${content.address};;;;`);
  if (content.bio) lines.push(`NOTE:${content.bio}`);

  lines.push('END:VCARD');
  return lines.join('\r\n');
}
