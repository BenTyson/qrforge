'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SnapchatContent } from '@/lib/qr/types';

interface SnapchatFormProps {
  content: Partial<SnapchatContent>;
  onChange: (content: SnapchatContent) => void;
}

/**
 * Extracts Snapchat username from various input formats:
 * - "johndoe" -> "johndoe"
 * - "snapchat.com/add/johndoe" -> "johndoe"
 * - "https://www.snapchat.com/add/johndoe" -> "johndoe"
 */
function extractUsername(input: string): string {
  const trimmed = input.trim();

  // Check for Snapchat URL patterns
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?snapchat\.com\/add\/([^/?]+)/i;
  const match = trimmed.match(urlPattern);
  if (match && match[1]) {
    return match[1].replace(/\/$/, '');
  }

  return trimmed;
}

export function SnapchatForm({ content, onChange }: SnapchatFormProps) {
  const handleChange = (value: string) => {
    const username = extractUsername(value);
    onChange({
      type: 'snapchat',
      username,
    });
  };

  const username = content.username || '';
  const previewUrl = username ? `https://snapchat.com/add/${username}` : '';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="snapchatUsername">Snapchat Profile</Label>
        <Input
          id="snapchatUsername"
          type="text"
          placeholder="username or snapchat.com/add/username"
          value={content.username || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your Snapchat username or paste your profile URL
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
