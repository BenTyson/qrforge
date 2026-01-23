'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LinkedInContent } from '@/lib/qr/types';

interface LinkedInFormProps {
  content: Partial<LinkedInContent>;
  onChange: (content: LinkedInContent) => void;
}

/**
 * Extracts LinkedIn username from various input formats:
 * - "johndoe" -> "johndoe"
 * - "@johndoe" -> "johndoe"
 * - "linkedin.com/in/johndoe" -> "johndoe"
 * - "https://linkedin.com/in/johndoe" -> "johndoe"
 * - "https://www.linkedin.com/in/johndoe/" -> "johndoe"
 */
function extractUsername(input: string): string {
  const trimmed = input.trim();

  // Check for LinkedIn URL patterns
  const urlPatterns = [
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^/?]+)/i,
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

export function LinkedInForm({ content, onChange }: LinkedInFormProps) {
  const handleChange = (value: string) => {
    const username = extractUsername(value);
    onChange({
      type: 'linkedin',
      username,
    });
  };

  const username = content.username || '';
  const previewUrl = username ? `https://linkedin.com/in/${username}` : '';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="linkedinUsername">LinkedIn Profile</Label>
        <Input
          id="linkedinUsername"
          type="text"
          placeholder="username or linkedin.com/in/username"
          value={content.username || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your LinkedIn username or paste your profile URL
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
