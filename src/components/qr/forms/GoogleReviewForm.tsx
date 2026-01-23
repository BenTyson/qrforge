'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GoogleReviewContent } from '@/lib/qr/types';

interface GoogleReviewFormProps {
  content: Partial<GoogleReviewContent>;
  onChange: (content: GoogleReviewContent) => void;
}

// Place ID validation: Google Place IDs are typically 20+ alphanumeric characters with underscores/hyphens
const PLACE_ID_REGEX = /^[a-zA-Z0-9_-]{20,}$/;

export function GoogleReviewForm({ content, onChange }: GoogleReviewFormProps) {
  const [showHelp, setShowHelp] = useState(false);

  const handleChange = (field: keyof GoogleReviewContent, value: string) => {
    onChange({
      type: 'google-review',
      placeId: content.placeId || '',
      businessName: content.businessName || '',
      accentColor: content.accentColor,
      [field]: value,
    });
  };

  const isValidPlaceId = content.placeId && PLACE_ID_REGEX.test(content.placeId);
  const placeIdTouched = content.placeId !== undefined && content.placeId !== '';

  return (
    <div className="space-y-4">
      {/* Business Name */}
      <div>
        <Label htmlFor="reviewBusinessName">Business Name *</Label>
        <Input
          id="reviewBusinessName"
          type="text"
          placeholder="Your Business Name"
          value={content.businessName || ''}
          onChange={(e) => handleChange('businessName', e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Displayed on the review landing page
        </p>
      </div>

      {/* Place ID */}
      <div>
        <Label htmlFor="placeId">Google Place ID *</Label>
        <Input
          id="placeId"
          type="text"
          placeholder="ChIJ..."
          value={content.placeId || ''}
          onChange={(e) => handleChange('placeId', e.target.value.trim())}
          className={`mt-1 bg-secondary/50 font-mono ${
            placeIdTouched && !isValidPlaceId ? 'border-red-500/50' : ''
          }`}
        />
        {placeIdTouched && !isValidPlaceId && (
          <p className="text-xs text-red-500 mt-1">
            Place ID should be at least 20 characters (letters, numbers, underscores, hyphens)
          </p>
        )}
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          How to find your Place ID
        </button>
      </div>

      {/* Help Section - Collapsible */}
      {showHelp && (
        <div className="p-4 bg-secondary/50 rounded-lg border border-border text-sm space-y-3 animate-in fade-in slide-in-from-top-2">
          <p className="font-medium">Finding your Google Place ID:</p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>
              Go to{' '}
              <a
                href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google&apos;s Place ID Finder
              </a>
            </li>
            <li>Search for your business name and location</li>
            <li>Click on your business in the results</li>
            <li>Copy the Place ID shown (starts with &quot;ChIJ...&quot;)</li>
          </ol>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Example Place ID: <code className="bg-background px-1 rounded">ChIJN1t_tDeuEmsRUsoyG83frY4</code>
            </p>
          </div>
        </div>
      )}

      {/* Accent Color */}
      <div>
        <Label htmlFor="reviewAccent">Accent Color (optional)</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="reviewAccent"
            type="color"
            value={content.accentColor || '#4285F4'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="w-12 h-10 p-1 bg-secondary/50"
          />
          <Input
            type="text"
            value={content.accentColor || '#4285F4'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="flex-1 bg-secondary/50"
            placeholder="#4285F4"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Colors the landing page background glow, button, and branding when scanned
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4h2v4h-2zm0-6V7h2v4h-2z" />
          </svg>
          <div className="text-sm">
            <p className="text-blue-100 font-medium mb-1">How it works</p>
            <p className="text-blue-200/80">
              When scanned, users see a friendly landing page with your business name and a button to leave a Google review. This makes it easy for happy customers to share their experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
