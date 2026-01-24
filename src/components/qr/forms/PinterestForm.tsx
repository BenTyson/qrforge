'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PinterestContent } from '@/lib/qr/types';

interface PinterestFormProps {
  content: Partial<PinterestContent>;
  onChange: (content: PinterestContent) => void;
}

export function PinterestForm({ content, onChange }: PinterestFormProps) {
  const handleChange = (value: string) => {
    // Extract username from URL if pasted
    let username = value.trim();

    // Handle various Pinterest URL formats
    const urlMatch = username.match(/(?:pinterest\.com\/)([^/?]+)/i);
    if (urlMatch) {
      username = urlMatch[1];
    }

    // Remove @ if present
    username = username.replace(/^@/, '');

    onChange({
      type: 'pinterest',
      username,
    });
  };

  const previewUrl = content.username
    ? `https://pinterest.com/${content.username}`
    : '';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pinterestUsername">Pinterest Username</Label>
        <Input
          id="pinterestUsername"
          type="text"
          placeholder="username or pinterest.com/username"
          value={content.username || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your Pinterest username or paste your profile URL
        </p>
      </div>

      {content.username && (
        <div className="text-xs text-muted-foreground bg-secondary/30 rounded-md p-2">
          <span className="font-medium">Redirect URL:</span>{' '}
          <span className="text-primary">{previewUrl}</span>
        </div>
      )}
    </div>
  );
}
