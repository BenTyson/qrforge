'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { generateQRDataURL } from '@/lib/qr/generator';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';
import { cn } from '@/lib/utils';

interface QRPreviewProps {
  content: QRContent | null;
  style: QRStyleOptions;
  className?: string;
  showPlaceholder?: boolean;
}

export function QRPreview({
  content,
  style,
  className,
  showPlaceholder = true,
}: QRPreviewProps) {
  const [qrDataURL, setQrDataURL] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Reset states when content is empty
    if (!content) {
      setQrDataURL(null);
      setError(null);
      return;
    }

    // Check if content has valid data
    const hasValidContent = (() => {
      switch (content.type) {
        case 'url':
          return content.url && content.url.length > 0;
        case 'text':
          return content.text && content.text.length > 0;
        case 'wifi':
          return content.ssid && content.ssid.length > 0;
        case 'vcard':
          return (content.firstName && content.firstName.length > 0) ||
                 (content.lastName && content.lastName.length > 0);
        case 'email':
          return content.email && content.email.length > 0;
        case 'phone':
          return content.phone && content.phone.length > 0;
        case 'sms':
          return content.phone && content.phone.length > 0;
        case 'whatsapp':
          return content.phone && content.phone.length > 0;
        case 'facebook':
          return content.profileUrl && content.profileUrl.length > 0;
        case 'instagram':
          return content.username && content.username.length > 0;
        case 'linkedin':
          return content.username && content.username.length > 0;
        case 'x':
          return content.username && content.username.length > 0;
        case 'tiktok':
          return content.username && content.username.length > 0;
        case 'snapchat':
          return content.username && content.username.length > 0;
        case 'threads':
          return content.username && content.username.length > 0;
        case 'youtube':
          return content.videoId && content.videoId.length > 0;
        case 'pinterest':
          return content.username && content.username.length > 0;
        case 'spotify':
          return content.spotifyId && content.spotifyId.length > 0;
        case 'reddit':
          return (content.username && content.username.length > 0) ||
                 (content.subreddit && content.subreddit.length > 0);
        case 'twitch':
          return content.username && content.username.length > 0;
        case 'discord':
          return content.inviteCode && content.inviteCode.length > 0;
        case 'apps':
          return (content.appStoreUrl && content.appStoreUrl.length > 0) ||
                 (content.playStoreUrl && content.playStoreUrl.length > 0) ||
                 (content.fallbackUrl && content.fallbackUrl.length > 0);
        case 'google-review':
          return content.placeId && content.placeId.length >= 20 &&
                 content.businessName && content.businessName.length > 0;
        case 'event': {
          if (!content.title || content.title.length === 0) return false;
          if (!content.startDate || content.startDate.length === 0) return false;
          if (!content.endDate || content.endDate.length === 0) return false;
          const start = new Date(content.startDate);
          const end = new Date(content.endDate);
          return end > start;
        }
        case 'geo':
          return content.latitude !== undefined && content.longitude !== undefined &&
                 content.latitude >= -90 && content.latitude <= 90 &&
                 content.longitude >= -180 && content.longitude <= 180;
        // Pro types - these generate preview QR codes
        case 'pdf':
          return (content.fileUrl && content.fileUrl.length > 0) || (content.fileName && content.fileName.length > 0);
        case 'images':
          return content.images && content.images.length > 0;
        case 'video':
          return (content.videoUrl && content.videoUrl.length > 0) || (content.embedUrl && content.embedUrl.length > 0);
        case 'mp3':
          return (content.audioUrl && content.audioUrl.length > 0) || (content.embedUrl && content.embedUrl.length > 0);
        case 'menu':
          return content.restaurantName && content.restaurantName.length > 0;
        case 'business':
          return content.name && content.name.length > 0;
        case 'links':
          return content.title && content.title.length > 0;
        case 'coupon':
          return (content.businessName && content.businessName.length > 0) && (content.headline && content.headline.length > 0);
        case 'social':
          return content.name && content.name.length > 0;
        default:
          return false;
      }
    })();

    if (!hasValidContent) {
      setQrDataURL(null);
      setError(null);
      return;
    }

    // Debounce the QR generation
    setIsGenerating(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const dataURL = await generateQRDataURL(content, style);
        setQrDataURL(dataURL);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate QR code');
        setQrDataURL(null);
      } finally {
        setIsGenerating(false);
      }
    }, 150); // 150ms debounce for smooth real-time updates

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [content, style]);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-2xl transition-all duration-300',
        className
      )}
      style={{ backgroundColor: style.backgroundColor }}
    >
      {/* QR Code Display */}
      {qrDataURL && (
        <Image
          src={qrDataURL}
          alt="QR Code"
          width={300}
          height={400}
          className={cn(
            'w-full h-auto rounded-lg transition-all duration-300',
            isGenerating && 'opacity-50'
          )}
          style={{ imageRendering: 'pixelated' }}
          unoptimized
        />
      )}

      {/* Placeholder State */}
      {!qrDataURL && showPlaceholder && !error && (
        <div className="flex flex-col items-center justify-center p-8" style={{ color: style.foregroundColor, opacity: 0.4 }}>
          <svg
            className="w-16 h-16 mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="3" height="3" />
            <rect x="18" y="14" width="3" height="3" />
            <rect x="14" y="18" width="3" height="3" />
            <rect x="18" y="18" width="3" height="3" />
          </svg>
          <p className="text-sm text-center opacity-80">
            Enter content to generate<br />your QR code
          </p>
        </div>
      )}

      {/* Loading Indicator */}
      {isGenerating && qrDataURL && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${style.backgroundColor}80` }}>
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center text-red-400 p-8">
          <svg
            className="w-12 h-12 mb-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
