import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { VCardActions } from './VCardActions';

interface PageProps {
  params: Promise<{ code: string }>;
}

interface VCardContent {
  type: 'vcard';
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  title?: string;
  website?: string;
  address?: string;
}

export default async function VCardPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('id, content, content_type, name')
    .eq('short_code', code)
    .single();

  if (error || !qrCode || qrCode.content_type !== 'vcard') {
    notFound();
  }

  const content = qrCode.content as VCardContent;
  const fullName = [content.firstName, content.lastName].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          {/* Contact Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">
                {(content.firstName?.[0] || content.lastName?.[0] || '?').toUpperCase()}
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">
            {fullName || 'Contact'}
          </h1>
          {content.title && (
            <p className="text-slate-400 text-center mb-1">{content.title}</p>
          )}
          {content.organization && (
            <p className="text-slate-500 text-center mb-6">{content.organization}</p>
          )}

          {/* Contact Details */}
          <div className="space-y-3 mt-6">
            {content.phone && (
              <a
                href={`tel:${content.phone}`}
                className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Phone</p>
                  <p className="text-white">{content.phone}</p>
                </div>
              </a>
            )}

            {content.email && (
              <a
                href={`mailto:${content.email}`}
                className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <EmailIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Email</p>
                  <p className="text-white">{content.email}</p>
                </div>
              </a>
            )}

            {content.website && (
              <a
                href={content.website.startsWith('http') ? content.website : `https://${content.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <GlobeIcon className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Website</p>
                  <p className="text-white">{content.website}</p>
                </div>
              </a>
            )}

            {content.address && (
              <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <MapIcon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Address</p>
                  <p className="text-white">{content.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Download vCard Button */}
          <div className="mt-8">
            <VCardActions content={content} fullName={fullName} />
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

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
