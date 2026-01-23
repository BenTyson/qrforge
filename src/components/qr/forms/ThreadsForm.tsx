'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ThreadsContent } from '@/lib/qr/types';

interface ThreadsFormProps {
  content: Partial<ThreadsContent>;
  onChange: (content: ThreadsContent) => void;
}

/**
 * Extracts Threads username from various input formats:
 * - "johndoe" -> "johndoe"
 * - "@johndoe" -> "johndoe"
 * - "threads.net/@johndoe" -> "johndoe"
 * - "https://www.threads.net/@johndoe" -> "johndoe"
 */
function extractUsername(input: string): string {
  const trimmed = input.trim();

  // Check for Threads URL patterns
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?threads\.net\/@?([^/?]+)/i;
  const match = trimmed.match(urlPattern);
  if (match && match[1]) {
    return match[1].replace(/\/$/, '');
  }

  return trimmed.replace(/^@/, '');
}

export function ThreadsForm({ content, onChange }: ThreadsFormProps) {
  const handleChange = (value: string) => {
    const username = extractUsername(value);
    onChange({
      type: 'threads',
      username,
    });
  };

  const username = content.username || '';
  const previewUrl = username ? `https://threads.net/@${username}` : '';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="threadsUsername">Threads Profile</Label>
        <Input
          id="threadsUsername"
          type="text"
          placeholder="username or threads.net/@username"
          value={content.username || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your Threads username or paste your profile URL
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
