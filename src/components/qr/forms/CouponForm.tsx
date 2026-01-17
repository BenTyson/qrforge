'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoUploader } from '@/components/qr/LogoUploader';
import type { CouponContent } from '@/lib/qr/types';

interface CouponFormProps {
  content: Partial<CouponContent>;
  onChange: (content: CouponContent) => void;
}

export function CouponForm({ content, onChange }: CouponFormProps) {
  const handleChange = (field: keyof CouponContent, value: string) => {
    onChange({
      type: 'coupon',
      businessName: content.businessName || '',
      headline: content.headline || '',
      description: content.description || '',
      logoUrl: content.logoUrl,
      code: content.code,
      terms: content.terms,
      validUntil: content.validUntil,
      accentColor: content.accentColor,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Business Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="couponBusiness">Business Name *</Label>
          <Input
            id="couponBusiness"
            type="text"
            placeholder="Your Business"
            value={content.businessName || ''}
            onChange={(e) => handleChange('businessName', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div className="col-span-2">
          <Label>Business Logo (optional)</Label>
          <LogoUploader
            value={content.logoUrl}
            onChange={(url) => handleChange('logoUrl', url || '')}
            placeholder="Upload business logo"
            className="mt-1"
          />
        </div>
      </div>

      {/* Coupon Details */}
      <div>
        <Label htmlFor="couponHeadline">Headline *</Label>
        <Input
          id="couponHeadline"
          type="text"
          placeholder="20% OFF"
          value={content.headline || ''}
          onChange={(e) => handleChange('headline', e.target.value)}
          className="mt-1 bg-secondary/50 text-lg font-bold"
        />
        <p className="text-xs text-muted-foreground mt-1">
          The main offer (e.g., &quot;20% OFF&quot;, &quot;Buy 1 Get 1&quot;, &quot;Free Shipping&quot;)
        </p>
      </div>

      <div>
        <Label htmlFor="couponDescription">Description *</Label>
        <Input
          id="couponDescription"
          type="text"
          placeholder="Your entire purchase"
          value={content.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Additional details about the offer
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="couponCode">Promo Code (optional)</Label>
          <Input
            id="couponCode"
            type="text"
            placeholder="SAVE20"
            value={content.code || ''}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            className="mt-1 bg-secondary/50 font-mono"
          />
        </div>
        <div>
          <Label htmlFor="couponExpiry">Valid Until (optional)</Label>
          <Input
            id="couponExpiry"
            type="date"
            value={content.validUntil || ''}
            onChange={(e) => handleChange('validUntil', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="couponTerms">Terms & Conditions (optional)</Label>
        <textarea
          id="couponTerms"
          placeholder="Cannot be combined with other offers. One per customer."
          value={content.terms || ''}
          onChange={(e) => handleChange('terms', e.target.value)}
          className="w-full h-16 mt-1 px-3 py-2 rounded-md bg-secondary/50 border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
      </div>

      {/* Accent Color */}
      <div>
        <Label htmlFor="couponAccent">Accent Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="couponAccent"
            type="color"
            value={content.accentColor || '#14b8a6'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="w-12 h-10 p-1 bg-secondary/50"
          />
          <Input
            type="text"
            value={content.accentColor || '#14b8a6'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="flex-1 bg-secondary/50"
            placeholder="#14b8a6"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
        Create a digital coupon. When scanned, users will see the offer and can copy the promo code.
      </p>
    </div>
  );
}
