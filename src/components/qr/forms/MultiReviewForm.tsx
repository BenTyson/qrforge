'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MultiReviewContent, ReviewPlatformEntry, ReviewPlatform } from '@/lib/qr/types';

interface MultiReviewFormProps {
  content: Partial<MultiReviewContent>;
  onChange: (content: MultiReviewContent) => void;
}

const PLATFORM_META: Record<ReviewPlatform, { label: string; placeholder: string; urlHint: string }> = {
  google: {
    label: 'Google Reviews',
    placeholder: 'https://search.google.com/local/writereview?placeid=...',
    urlHint: 'Paste your Google review link or Place ID URL',
  },
  yelp: {
    label: 'Yelp',
    placeholder: 'https://www.yelp.com/biz/your-business',
    urlHint: 'Paste your Yelp business page URL',
  },
  tripadvisor: {
    label: 'TripAdvisor',
    placeholder: 'https://www.tripadvisor.com/...',
    urlHint: 'Paste your TripAdvisor listing URL',
  },
  facebook: {
    label: 'Facebook Reviews',
    placeholder: 'https://www.facebook.com/your-business/reviews',
    urlHint: 'Paste your Facebook reviews page URL',
  },
  custom: {
    label: 'Custom Platform',
    placeholder: 'https://...',
    urlHint: 'Any other review platform URL',
  },
};

const PLATFORM_ICONS: Record<ReviewPlatform, React.ReactNode> = {
  google: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  ),
  yelp: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF1A1A">
      <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 0 1 1.596-.206l2.039 1.635c.633.508.42 1.55-.37 3.076zm-7.842-4.61l.975-5.11c.168-.882 1.307-1.063 1.72-.273l1.785 3.42c.261.5-.003 1.094-.547 1.25l-2.747.786c-.837.24-1.47-.657-1.186-2.073zm-3.2 7.273l-5.08-1.032c-.89-.18-.99-1.345-.15-1.756l3.63-1.78c.496-.243 1.08.032 1.214.57l.68 2.73c.206.825-.711 1.476-2.293 1.268zm.828 1.378l2.542 4.367c.443.762-.24 1.67-1.034 1.37l-3.437-1.303c-.504-.19-.738-.782-.49-1.26l1.256-2.412c.382-.733 1.582-.5 1.163-.762zm-1.024-5.08l-4.56-2.826c-.797-.493-.434-1.682.547-1.795l4.253-.49c.58-.067 1.04.412.972.994l-.33 2.936c-.106.944-1.295 1.382-.882 1.18z" />
    </svg>
  ),
  tripadvisor: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#00AF87">
      <path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 0 0 4.04 10.43 5.976 5.976 0 0 0 4.075-1.6L12.006 20l1.928-2.387a5.976 5.976 0 0 0 4.075 1.6 5.997 5.997 0 0 0 4.04-10.43L24 6.648h-4.35a13.573 13.573 0 0 0-7.644-2.353zM6.003 17.213a3.997 3.997 0 1 1 0-7.994 3.997 3.997 0 0 1 0 7.994zm11.994 0a3.997 3.997 0 1 1 0-7.994 3.997 3.997 0 0 1 0 7.994zM6.003 11.219a2 2 0 1 0 0 3.998 2 2 0 0 0 0-3.998zm11.994 0a2 2 0 1 0 0 3.998 2 2 0 0 0 0-3.998z" />
    </svg>
  ),
  facebook: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  custom: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

const DEFAULT_PLATFORMS: ReviewPlatform[] = ['google', 'yelp', 'tripadvisor', 'facebook'];

export function MultiReviewForm({ content, onChange }: MultiReviewFormProps) {
  const platforms = content.platforms || [];

  const emitChange = (updates: Partial<MultiReviewContent>) => {
    onChange({
      type: 'multi-review',
      businessName: content.businessName || '',
      platforms: content.platforms || [],
      accentColor: content.accentColor,
      ...updates,
    });
  };

  const updatePlatform = (index: number, updates: Partial<ReviewPlatformEntry>) => {
    const updated = [...platforms];
    updated[index] = { ...updated[index], ...updates };
    emitChange({ platforms: updated });
  };

  const addPlatform = (platform: ReviewPlatform) => {
    emitChange({
      platforms: [...platforms, { platform, url: '', label: platform === 'custom' ? '' : undefined }],
    });
  };

  const removePlatform = (index: number) => {
    emitChange({ platforms: platforms.filter((_, i) => i !== index) });
  };

  // Which default platforms haven't been added yet?
  const addedPlatformTypes = new Set(platforms.map((p) => p.platform));
  const availablePlatforms = DEFAULT_PLATFORMS.filter((p) => !addedPlatformTypes.has(p));

  return (
    <div className="space-y-4">
      {/* Business Name */}
      <div>
        <Label htmlFor="multiReviewBusinessName">Business Name *</Label>
        <Input
          id="multiReviewBusinessName"
          type="text"
          placeholder="Your Business Name"
          value={content.businessName || ''}
          onChange={(e) => emitChange({ businessName: e.target.value })}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Displayed on the review landing page
        </p>
      </div>

      {/* Platform URLs */}
      <div>
        <Label>Review Platforms *</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Add links to your review profiles. At least one platform is required.
        </p>

        <div className="space-y-3">
          {platforms.map((entry, index) => {
            const meta = PLATFORM_META[entry.platform];
            return (
              <div
                key={index}
                className="p-3 bg-secondary/30 rounded-lg border border-border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {PLATFORM_ICONS[entry.platform]}
                    <span className="text-sm font-medium">
                      {entry.platform === 'custom' ? (entry.label || 'Custom Platform') : meta.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePlatform(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    aria-label="Remove platform"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {entry.platform === 'custom' && (
                  <Input
                    type="text"
                    placeholder="Platform name (e.g., Trustpilot)"
                    value={entry.label || ''}
                    onChange={(e) => updatePlatform(index, { label: e.target.value })}
                    className="bg-secondary/50 text-sm"
                  />
                )}

                <Input
                  type="url"
                  placeholder={meta.placeholder}
                  value={entry.url}
                  onChange={(e) => updatePlatform(index, { url: e.target.value })}
                  className="bg-secondary/50 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">{meta.urlHint}</p>
              </div>
            );
          })}
        </div>

        {/* Add Platform Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {availablePlatforms.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => addPlatform(platform)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-secondary/50 hover:bg-secondary rounded-lg border border-border transition-colors"
            >
              {PLATFORM_ICONS[platform]}
              <span>{PLATFORM_META[platform].label}</span>
              <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          ))}
          {/* Always show custom option */}
          <button
            type="button"
            onClick={() => addPlatform('custom')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-secondary/50 hover:bg-secondary rounded-lg border border-border transition-colors"
          >
            {PLATFORM_ICONS.custom}
            <span>Custom</span>
            <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <Label htmlFor="multiReviewAccent">Accent Color (optional)</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="multiReviewAccent"
            type="color"
            value={content.accentColor || '#f59e0b'}
            onChange={(e) => emitChange({ accentColor: e.target.value })}
            className="w-12 h-10 p-1 bg-secondary/50"
          />
          <Input
            type="text"
            value={content.accentColor || '#f59e0b'}
            onChange={(e) => emitChange({ accentColor: e.target.value })}
            className="flex-1 bg-secondary/50"
            placeholder="#f59e0b"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Colors the landing page background glow, buttons, and branding
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4h2v4h-2zm0-6V7h2v4h-2z" />
          </svg>
          <div className="text-sm">
            <p className="text-amber-100 font-medium mb-1">How it works</p>
            <p className="text-amber-200/80">
              When scanned, customers see a landing page with buttons for each review platform you&apos;ve added. They choose where to leave their review, making it easy to collect feedback across multiple sites.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
