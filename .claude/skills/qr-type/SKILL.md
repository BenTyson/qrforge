# New QR Code Type Implementation Skill

This skill provides a comprehensive checklist for adding any new QR code type to QRWolf.

## Pre-Implementation Checklist

Before starting, determine:

- [ ] **Tier**: Free / Pro / Business
- [ ] **Landing Page**: Required (dynamic) or Direct redirect (static)
- [ ] **Content Interface**: Define all fields needed
- [ ] **Category Placement**: Which category in type selector (basic, social, reviews, media, landing)

---

## Files to Modify (ALL required for any new type)

### 1. Database Migration - `supabase/migrations/YYYYMMDD_add_[type]_type.sql` (NEW)

```sql
-- Drop and recreate the content_type CHECK constraint
ALTER TABLE qr_codes
DROP CONSTRAINT IF EXISTS qr_codes_content_type_check;

ALTER TABLE qr_codes
ADD CONSTRAINT qr_codes_content_type_check
CHECK (content_type IN (
  -- Add your new type to the appropriate category
  'url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms',
  'whatsapp', 'facebook', 'instagram', 'apps',
  'google-review',  -- Reviews
  'pdf', 'images', 'video', 'mp3',
  'menu', 'business', 'links', 'coupon', 'social',
  'YOUR-NEW-TYPE'  -- <-- Add here
));
```

### 2. Type System - `src/lib/qr/types.ts`

- [ ] Add to `QRContentType` union type
- [ ] Create `[Type]Content` interface with all fields
- [ ] Add to `QRContent` union type
- [ ] Add to `QR_TYPE_LABELS` record
- [ ] Add to `QR_TYPE_ICONS` record
- [ ] If Pro+: Add to `PRO_ONLY_TYPES` array
- [ ] If needs landing page: Add to `DYNAMIC_REQUIRED_TYPES` array

### 3. Form Component - `src/components/qr/forms/[Type]Form.tsx` (NEW)

Create form following existing pattern:

```tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { [Type]Content } from '@/lib/qr/types';

interface [Type]FormProps {
  content: Partial<[Type]Content>;
  onChange: (content: [Type]Content) => void;
}

export function [Type]Form({ content, onChange }: [Type]FormProps) {
  const handleChange = (field: keyof [Type]Content, value: string) => {
    onChange({
      type: '[type]',
      // Include all required fields with defaults
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Form fields */}
    </div>
  );
}
```

### 4. Form Barrel - `src/components/qr/forms/index.ts`

- [ ] Export new form component

### 5. Type Selector - `src/components/qr/QRTypeSelector.tsx`

- [ ] Add to `TYPE_CONFIG` with label and icon SVG
- [ ] Add to appropriate `CATEGORIES` array (or create new category)
- [ ] Set `proOnly: true` on category if Pro+ tier

### 6. Wizard Constants - `src/components/qr/wizard/constants.tsx`

- [ ] Add to `TYPE_CATEGORIES` with name/description/icon
- [ ] Set `pro: true` on type if Pro+ tier
- [ ] If has preview: Add to `PREVIEWABLE_TYPES` array

### 7. Content Validation - `src/lib/qr/generator.ts`

- [ ] Add case to `validateContent()` switch
- [ ] Add case to `contentToString()` for preview URL
- [ ] Add case to `normalizeContentUrls()` if has URL fields

### 7b. QR Preview - `src/components/qr/QRPreview.tsx`

- [ ] Add case to `hasValidContent` switch (determines when to show QR vs placeholder)

### 8. API Validation - `src/lib/api/auth.ts`

- [ ] Add type to `isValidContentType()` array
- [ ] Add case to `validators.validateContent()` switch

### 9. QR Studio - `src/components/qr/studio/QRStudio.tsx`

- [ ] Import content type interface
- [ ] Import form component
- [ ] Add case in `renderForm()` switch (ContentStep)

### 10. Routing - `src/app/r/[code]/route.ts`

- [ ] If landing page: Add to `LANDING_PAGE_ROUTES` mapping
- [ ] If direct redirect: Add URL construction case in switch

### 11. Landing Page - `src/app/r/[code]/[route]/page.tsx` (NEW if landing page type)

Create landing page following existing patterns:

```tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { [Type]Content } from '@/lib/qr/types';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function [Type]LandingPage({ params }: PageProps) {
  const [content, setContent] = useState<[Type]Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { code } = await params;
      const supabase = createClient();

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('content')
        .eq('short_code', code)
        .eq('content_type', '[type]')
        .single();

      if (error || !qrCode) {
        setLoading(false);
        return;
      }

      setContent(qrCode.content as [Type]Content);
      setLoading(false);
    }

    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    notFound();
  }

  // Render landing page with glassmorphism design
  return (
    <div className="min-h-screen ...">
      {/* Content */}

      {/* Powered by QRWolf footer */}
      <p className="mt-10 text-center text-sm text-slate-500">
        Powered by{' '}
        <Link href="/" className="font-medium transition-colors hover:text-primary">
          QRWolf
        </Link>
      </p>
    </div>
  );
}
```

### 12. Preview Component (Optional) - `src/components/[type]/[Type]Preview.tsx`

If the type has a landing page, create a phone mockup preview:

- [ ] Create preview component
- [ ] Add preview case in `QRStudio.tsx` preview panel section

---

## Plan Features Updates (Tier-Dependent)

### If FREE Tier:
- Usually no feature list updates needed (basic QR types aren't marketed as "features")

### If PRO Tier - Update ALL:
- [ ] `src/lib/stripe/plans.ts` - Add to `pro.features[]`
- [ ] `src/constants/homepage.tsx` - Add to `FEATURES[]` array if highlight feature
- [ ] `src/constants/homepage.tsx` - Add to `jsonLd.featureList[]` for SEO
- [ ] `src/components/pricing/PricingSection.tsx` - Add to Pro features list
- [ ] `src/app/(dashboard)/plans/page.tsx` - Add to `PLANS.pro.features[]`
- [ ] `src/emails/SubscriptionConfirmEmail.tsx` - Add if listing specific features

### If BUSINESS Tier - Update ALL:
- [ ] `src/lib/stripe/plans.ts` - Add to `business.features[]`
- [ ] `src/constants/homepage.tsx` - Add to `FEATURES[]` if highlight feature
- [ ] `src/constants/homepage.tsx` - Add to `jsonLd.featureList[]` for SEO
- [ ] `src/components/pricing/PricingSection.tsx` - Add to Business features list
- [ ] `src/app/(dashboard)/plans/page.tsx` - Add to `PLANS.business.features[]`

---

## Bulk Studio Compatibility

- [ ] If URL-based type: Works automatically (BulkStudio is URL-only)
- [ ] If complex type: May need BulkStudio updates for future support

---

## Testing Matrix

| Context | Test |
|---------|------|
| Create (QRStudio) | Type selection, form, validation, save, download |
| Edit | Load existing, modify, save changes |
| Landing Page | Renders correctly, CTA works, mobile responsive |
| Analytics | Scans tracked, geolocation works |
| API | Validation accepts, creation works |
| Tier Gating | Free users blocked from Pro+ types |

---

## Post-Implementation

- [ ] Run `npm run precommit` (lint, type-check, tests)
- [ ] Test manually in browser
- [ ] Update `docs/FEATURE-ROADMAP.md` (move to Completed)
- [ ] Consider blog/learn content for SEO
