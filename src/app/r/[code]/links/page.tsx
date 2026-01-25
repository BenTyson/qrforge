import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { LinksContent } from '@/lib/qr/types';
import type { ReactNode } from 'react';
import { normalizeUrl } from '@/lib/utils';
import {
  LandingBackground,
  LandingCard,
  LandingCardContent,
  LandingFooter
} from '@/components/landing';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function LinksLandingPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('content, style')
    .eq('short_code', code)
    .eq('content_type', 'links')
    .single();

  if (error || !qrCode) {
    notFound();
  }

  const content = qrCode.content as LinksContent;
  const accentColor = content.accentColor || '#14b8a6';

  return (
    <LandingBackground accentColor={accentColor} className="py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Profile Card */}
        <LandingCard className="mb-8">
          <LandingCardContent className="text-center">
            {/* Avatar */}
            {content.avatarUrl ? (
              <div className="relative inline-block mb-4">
                <Image
                  src={content.avatarUrl}
                  alt={content.title}
                  width={112}
                  height={112}
                  className="w-28 h-28 rounded-full object-cover border-2 border-white/10"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="w-28 h-28 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white border-2 border-white/10"
                style={{ backgroundColor: `${accentColor}30` }}
              >
                {content.title?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-2">{content.title}</h1>

            {/* Description */}
            {content.description && (
              <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                {content.description}
              </p>
            )}
          </LandingCardContent>
        </LandingCard>

        {/* Links */}
        <div className="space-y-3">
          {content.links.map((link, index) => (
            <a
              key={index}
              href={normalizeUrl(link.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full p-4 rounded-xl text-center font-medium
                         bg-white/[0.03] backdrop-blur-md border border-white/[0.06]
                         transition-all duration-300 hover:scale-[1.02]
                         hover:bg-white/[0.05] animate-slide-up"
              style={{
                animationDelay: `${index * 80}ms`,
                animationFillMode: 'backwards',
              }}
            >
              <span className="text-white group-hover:text-white/90 transition-colors">
                {link.title}
              </span>
            </a>
          ))}
        </div>

        {/* Social Icons */}
        {content.socialLinks && content.socialLinks.length > 0 && (
          <div
            className="flex justify-center gap-3 mt-10 animate-fade-in"
            style={{ animationDelay: `${content.links.length * 80 + 200}ms`, animationFillMode: 'backwards' }}
          >
            {content.socialLinks.map((social, index) => (
              <a
                key={index}
                href={normalizeUrl(social.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-11 h-11 rounded-full bg-white/[0.03] border border-white/[0.06]
                           flex items-center justify-center transition-all duration-300
                           hover:scale-110 hover:bg-white/[0.05]"
                title={social.platform}
              >
                <SocialIcon platform={social.platform} />
              </a>
            ))}
          </div>
        )}

        <LandingFooter accentColor={accentColor} delay={content.links.length * 80 + 400} />
      </div>
    </LandingBackground>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, ReactNode> = {
    twitter: (
      <svg className="w-5 h-5 text-white/70 group-hover:text-[#1DA1F2] transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5 text-white/70 group-hover:text-[#E4405F] transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    youtube: (
      <svg className="w-5 h-5 text-white/70 group-hover:text-[#FF0000] transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5 text-white/70 group-hover:text-[#0A66C2] transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    tiktok: (
      <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    github: (
      <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5 text-white/70 group-hover:text-[#1877F2] transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    twitch: (
      <svg className="w-5 h-5 text-white/70 group-hover:text-[#9146FF] transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
      </svg>
    ),
    discord: (
      <svg className="w-5 h-5 text-white/70 group-hover:text-[#5865F2] transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
      </svg>
    ),
  };

  return icons[platform] || <span className="text-white/70 text-xs">{platform.charAt(0).toUpperCase()}</span>;
}
