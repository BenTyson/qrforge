'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TwitchContent } from '@/lib/qr/types';

interface TwitchFormProps {
  content: Partial<TwitchContent>;
  onChange: (content: TwitchContent) => void;
}

/**
 * Extracts Twitch username from various input formats:
 * - "ninja" -> "ninja"
 * - "twitch.tv/ninja" -> "ninja"
 * - "https://www.twitch.tv/ninja" -> "ninja"
 */
function extractUsername(input: string): string {
  const trimmed = input.trim();

  // Check for Twitch URL patterns
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([^/?]+)/i;
  const match = trimmed.match(urlPattern);
  if (match && match[1]) {
    return match[1].replace(/\/$/, '');
  }

  return trimmed;
}

export function TwitchForm({ content, onChange }: TwitchFormProps) {
  const handleChange = (value: string) => {
    const username = extractUsername(value);
    onChange({
      type: 'twitch',
      username,
    });
  };

  const username = content.username || '';
  const previewUrl = username ? `https://twitch.tv/${username}` : '';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="twitchUsername">Twitch Channel</Label>
        <Input
          id="twitchUsername"
          type="text"
          placeholder="username or twitch.tv/username"
          value={content.username || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your Twitch username or paste your channel URL
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
