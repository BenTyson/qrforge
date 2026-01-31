'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { FeedbackContent } from '@/lib/qr/types';

interface FeedbackFormProps {
  content: Partial<FeedbackContent>;
  onChange: (content: FeedbackContent) => void;
}

export function FeedbackForm({ content, onChange }: FeedbackFormProps) {
  const handleChange = (field: keyof FeedbackContent, value: string | boolean) => {
    onChange({
      type: 'feedback',
      businessName: content.businessName || '',
      ratingType: content.ratingType || 'stars',
      commentEnabled: content.commentEnabled ?? true,
      emailEnabled: content.emailEnabled ?? false,
      formTitle: content.formTitle,
      thankYouMessage: content.thankYouMessage,
      accentColor: content.accentColor,
      ctaUrl: content.ctaUrl,
      ctaLabel: content.ctaLabel,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Business Name */}
      <div>
        <Label htmlFor="feedbackBusinessName">Business Name *</Label>
        <Input
          id="feedbackBusinessName"
          type="text"
          placeholder="Your Business Name"
          value={content.businessName || ''}
          onChange={(e) => handleChange('businessName', e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Displayed at the top of the feedback form
        </p>
      </div>

      {/* Form Title */}
      <div>
        <Label htmlFor="feedbackTitle">Form Title (optional)</Label>
        <Input
          id="feedbackTitle"
          type="text"
          placeholder="How was your experience?"
          value={content.formTitle || ''}
          onChange={(e) => handleChange('formTitle', e.target.value)}
          className="mt-1 bg-secondary/50"
        />
      </div>

      {/* Rating Type */}
      <div>
        <Label>Rating Type</Label>
        <div className="flex gap-2 mt-1">
          {(['stars', 'emoji', 'numeric'] as const).map((ratingType) => (
            <button
              key={ratingType}
              type="button"
              onClick={() => handleChange('ratingType', ratingType)}
              className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                (content.ratingType || 'stars') === ratingType
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/50 border-border hover:border-primary/30'
              }`}
            >
              {ratingType === 'stars' && 'Stars'}
              {ratingType === 'emoji' && 'Emoji'}
              {ratingType === 'numeric' && 'Numeric'}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {(content.ratingType || 'stars') === 'stars' && 'Five clickable stars (1-5)'}
          {content.ratingType === 'emoji' && 'Five emoji faces from terrible to great'}
          {content.ratingType === 'numeric' && 'Five numbered buttons (1-5)'}
        </p>
      </div>

      {/* Comment Toggle */}
      <div className="flex items-center justify-between py-2">
        <div>
          <Label>Comment Field</Label>
          <p className="text-xs text-muted-foreground">Allow optional text comments</p>
        </div>
        <Switch
          checked={content.commentEnabled ?? true}
          onCheckedChange={(checked) => handleChange('commentEnabled', checked)}
        />
      </div>

      {/* Email Toggle */}
      <div className="flex items-center justify-between py-2">
        <div>
          <Label>Email Field</Label>
          <p className="text-xs text-muted-foreground">Ask for an optional email address</p>
        </div>
        <Switch
          checked={content.emailEnabled ?? false}
          onCheckedChange={(checked) => handleChange('emailEnabled', checked)}
        />
      </div>

      {/* Thank You Message */}
      <div>
        <Label htmlFor="feedbackThankYou">Thank You Message (optional)</Label>
        <textarea
          id="feedbackThankYou"
          placeholder="Thank you for your feedback!"
          value={content.thankYouMessage || ''}
          onChange={(e) => handleChange('thankYouMessage', e.target.value)}
          className="mt-1 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={2}
        />
      </div>

      {/* Accent Color */}
      <div>
        <Label htmlFor="feedbackAccent">Accent Color (optional)</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="feedbackAccent"
            type="color"
            value={content.accentColor || '#f59e0b'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="w-12 h-10 p-1 bg-secondary/50"
          />
          <Input
            type="text"
            value={content.accentColor || '#f59e0b'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="flex-1 bg-secondary/50"
            placeholder="#f59e0b"
          />
        </div>
      </div>

      {/* CTA Button (Thank You Page) */}
      <div>
        <Label htmlFor="feedbackCtaUrl">Thank-You Page Button URL (optional)</Label>
        <Input
          id="feedbackCtaUrl"
          type="url"
          placeholder="https://yourbusiness.com"
          value={content.ctaUrl || ''}
          onChange={(e) => handleChange('ctaUrl', e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Add a button to the thank-you screen that links back to your website
        </p>
      </div>

      {/* CTA Label (only when URL is set) */}
      {content.ctaUrl && (
        <div>
          <Label htmlFor="feedbackCtaLabel">Button Label (optional)</Label>
          <Input
            id="feedbackCtaLabel"
            type="text"
            placeholder="Visit Our Website"
            value={content.ctaLabel || ''}
            onChange={(e) => handleChange('ctaLabel', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4h2v4h-2zm0-6V7h2v4h-2z" />
          </svg>
          <div className="text-sm">
            <p className="text-amber-100 font-medium mb-1">How it works</p>
            <p className="text-amber-200/80">
              When scanned, customers see a simple form to rate their experience and leave optional comments.
              View submissions from the <strong>Responses</strong> button on your QR code card in the dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Tier hint */}
      <p className="text-xs text-center text-muted-foreground">
        Free: 10 responses/mo &middot; Pro: 1,000/mo &middot; Business: Unlimited
      </p>
    </div>
  );
}
