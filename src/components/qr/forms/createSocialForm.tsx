'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { QRContent } from '@/lib/qr/types';
import type { SocialFormConfig } from './social-form-configs';

interface SocialFormProps {
  content: Partial<{ username?: string; type?: string }>;
  onChange: (content: QRContent | null) => void;
}

/**
 * Extracts a username from raw input using the config's URL patterns.
 * Falls back to stripping @ and trimming.
 */
function extractUsername(input: string, config: SocialFormConfig): string {
  const trimmed = input.trim();

  for (const pattern of config.urlPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1].replace(/\/$/, '');
    }
  }

  // Not a URL — clean up the raw value
  return config.stripAt ? trimmed.replace(/^@/, '') : trimmed;
}

/**
 * Factory that creates a social media form component from a config object.
 * Each generated component handles username extraction from pasted URLs,
 * shows a preview URL, and renders a consistent layout.
 */
export function createSocialForm(config: SocialFormConfig) {
  function SocialForm({ content, onChange }: SocialFormProps) {
    const handleChange = (value: string) => {
      const username = extractUsername(value, config);
      onChange({ type: config.type, username } as QRContent);
    };

    const username = content.username || '';
    const previewUrl = username ? config.buildPreviewUrl(username) : '';

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor={config.inputId}>{config.label}</Label>
          {config.showAtPrefix ? (
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id={config.inputId}
                type="text"
                placeholder={config.placeholder}
                value={username}
                onChange={(e) => handleChange(e.target.value)}
                className="pl-8 bg-secondary/50"
              />
            </div>
          ) : (
            <Input
              id={config.inputId}
              type="text"
              placeholder={config.placeholder}
              value={content.username || ''}
              onChange={(e) => handleChange(e.target.value)}
              className="mt-1 bg-secondary/50"
            />
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {config.helpText}
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

  SocialForm.displayName = `${config.type.charAt(0).toUpperCase() + config.type.slice(1)}Form`;
  return SocialForm;
}
