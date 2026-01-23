'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { XContent } from '@/lib/qr/types';

interface XFormProps {
  content: Partial<XContent>;
  onChange: (content: XContent) => void;
}

/**
 * Extracts X (Twitter) username from various input formats:
 * - "johndoe" -> "johndoe"
 * - "@johndoe" -> "johndoe"
 * - "x.com/johndoe" -> "johndoe"
 * - "twitter.com/johndoe" -> "johndoe"
 * - "https://x.com/johndoe" -> "johndoe"
 * - "https://twitter.com/johndoe/" -> "johndoe"
 */
function extractUsername(input: string): string {
  const trimmed = input.trim();

  // Check for X/Twitter URL patterns
  const urlPatterns = [
    /(?:https?:\/\/)?(?:www\.)?x\.com\/([^/?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?twitter\.com\/([^/?]+)/i,
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

export function XForm({ content, onChange }: XFormProps) {
  const handleChange = (value: string) => {
    const username = extractUsername(value);
    onChange({
      type: 'x',
      username,
    });
  };

  const username = content.username || '';
  const previewUrl = username ? `https://x.com/${username}` : '';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="xUsername">X (Twitter) Profile</Label>
        <Input
          id="xUsername"
          type="text"
          placeholder="username or x.com/username"
          value={content.username || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your X username or paste your profile URL
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
