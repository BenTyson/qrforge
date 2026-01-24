'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DiscordContent } from '@/lib/qr/types';

interface DiscordFormProps {
  content: Partial<DiscordContent>;
  onChange: (content: DiscordContent) => void;
}

/**
 * Extracts Discord invite code from various input formats:
 * - "abc123" -> "abc123"
 * - "discord.gg/abc123" -> "abc123"
 * - "https://discord.gg/abc123" -> "abc123"
 * - "https://discord.com/invite/abc123" -> "abc123"
 */
function extractInviteCode(input: string): string {
  const trimmed = input.trim();

  // Check for discord.gg URL pattern
  const discordGgPattern = /(?:https?:\/\/)?(?:www\.)?discord\.gg\/([^/?]+)/i;
  const ggMatch = trimmed.match(discordGgPattern);
  if (ggMatch && ggMatch[1]) {
    return ggMatch[1].replace(/\/$/, '');
  }

  // Check for discord.com/invite URL pattern
  const discordComPattern = /(?:https?:\/\/)?(?:www\.)?discord\.com\/invite\/([^/?]+)/i;
  const comMatch = trimmed.match(discordComPattern);
  if (comMatch && comMatch[1]) {
    return comMatch[1].replace(/\/$/, '');
  }

  return trimmed;
}

export function DiscordForm({ content, onChange }: DiscordFormProps) {
  const handleChange = (value: string) => {
    const inviteCode = extractInviteCode(value);
    onChange({
      type: 'discord',
      inviteCode,
    });
  };

  const inviteCode = content.inviteCode || '';
  const previewUrl = inviteCode ? `https://discord.gg/${inviteCode}` : '';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="discordInvite">Discord Invite</Label>
        <Input
          id="discordInvite"
          type="text"
          placeholder="invite code or discord.gg/invite"
          value={content.inviteCode || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your Discord invite code or paste your invite URL
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
