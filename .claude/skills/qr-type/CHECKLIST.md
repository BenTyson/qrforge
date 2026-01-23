# New QR Type - Quick Checklist

Condensed checklist for adding a new QR code type.

## Pre-Implementation
- [ ] Tier: _________ (Free / Pro / Business)
- [ ] Landing page required: _________ (Yes / No)
- [ ] Category: _________ (basic / social / reviews / media / landing / NEW)

## Required Files (11-12 files)

### Database
- [ ] `supabase/migrations/YYYYMMDD_add_[type]_type.sql` - Add to CHECK constraint

### Type System
- [ ] `src/lib/qr/types.ts`
  - [ ] Add to `QRContentType` union
  - [ ] Create `[Type]Content` interface
  - [ ] Add to `QRContent` union
  - [ ] Add to `QR_TYPE_LABELS`
  - [ ] Add to `QR_TYPE_ICONS`
  - [ ] If Pro+: Add to `PRO_ONLY_TYPES`
  - [ ] If landing page: Add to `DYNAMIC_REQUIRED_TYPES`

### Form
- [ ] `src/components/qr/forms/[Type]Form.tsx` - Create form
- [ ] `src/components/qr/forms/index.ts` - Export form

### Selectors
- [ ] `src/components/qr/QRTypeSelector.tsx` - Add to TYPE_CONFIG & CATEGORIES
- [ ] `src/components/qr/wizard/constants.tsx` - Add to TYPE_CATEGORIES

### Validation
- [ ] `src/lib/qr/generator.ts` - Add validateContent() & contentToString() cases
- [ ] `src/lib/api/auth.ts` - Add isValidContentType() & validateContent() cases
- [ ] `src/components/qr/QRPreview.tsx` - Add hasValidContent() case

### Studio
- [ ] `src/components/qr/studio/QRStudio.tsx`
  - [ ] Import type & form
  - [ ] Add renderForm() case

### Routing
- [ ] `src/app/r/[code]/route.ts` - Add to LANDING_PAGE_ROUTES (or redirect case)

### Landing Page (if needed)
- [ ] `src/app/r/[code]/[route]/page.tsx` - Create landing page

## If Pro+ Tier
- [ ] `src/lib/stripe/plans.ts`
- [ ] `src/constants/homepage.tsx`
- [ ] `src/components/pricing/PricingSection.tsx`
- [ ] `src/app/(dashboard)/plans/page.tsx`

## Verification
- [ ] `npm run type-check`
- [ ] `npm run lint`
- [ ] Manual test: create, edit, scan, landing page
