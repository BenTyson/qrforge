'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TikTokContent } from '@/lib/qr/types';

interface TikTokFormProps {
  content: Partial<TikTokContent>;
  onChange: (content: TikTokContent) => void;
}

/**
 * Extracts TikTok username from various input formats:
 * - "johndoe" -> "johndoe"
 * - "@johndoe" -> "johndoe"
 * - "tiktok.com/@johndoe" -> "johndoe"
 * - "https://tiktok.com/@johndoe" -> "johndoe"
 * - "https://www.tiktok.com/@johndoe/" -> "johndoe"
 */
function extractUsername(input: string): string {
  const trimmed = input.trim();

  // Check for TikTok URL patterns
  const urlPatterns = [
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([^/?]+)/i,
    /(?:https?:\/\/)?(?:vm\.)?tiktok\.com\/@?([^/?]+)/i,
  ];

  for (const pattern of urlPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1].replace(/\/$/, ''); // Remove trailing slash
    }
  }

  // Not a URL, just clean up the username
  return trimmed.replace(/^@/, '');
}

export function TikTokForm({ content, onChange }: TikTokFormProps) {
  const handleChange = (value: string) => {
    const username = extractUsername(value);
    onChange({
      type: 'tiktok',
      username,
    });
  };

  const username = content.username || '';
  const previewUrl = username ? `https://tiktok.com/@${username}` : '';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tiktokUsername">TikTok Profile</Label>
        <Input
          id="tiktokUsername"
          type="text"
          placeholder="username or tiktok.com/@username"
          value={content.username || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your TikTok username or paste your profile URL
        </p>
      </div>

      {previewUrl && (
        <div className="text-xs text-muted-foreground bg-secondary/30 rounded-md p-2">
          <span className="font-medium">Redirect URL:</span>{' '}
          <span className="text-primary">{previewUrl}</span>
        </div>
      )}
    </div>
  );
}
