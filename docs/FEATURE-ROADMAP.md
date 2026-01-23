# QRWolf Feature Roadmap

> **Last Updated**: January 23, 2026
> **Status**: Active development
> **Current Features**: 22 QR types, Analytics, Bulk generation, API, 151 SEO articles
> **Strategy**: Build features that align with SEO content for maximum conversion

This document tracks planned features in priority order. Work through sequentially unless dependencies require otherwise.

---

## How to Use This Document

1. **Each session**: Check "NEXT UP" section for the next feature to build
2. **When complete**: Move feature to "Completed" section with date
3. **Update**: Add implementation notes and any follow-up tasks
4. **Content sync**: Note which articles can be published after feature ships

---

## Feature Tiers

| Tier | Description | Typical Effort |
|------|-------------|----------------|
| **QUICK WIN** | < 1 day, standalone, high SEO value | Low |
| **STANDARD** | 1-3 days, moderate complexity | Medium |
| **MAJOR** | 1-2 weeks, significant architecture | High |
| **EPIC** | Multi-week, requires planning phase | Very High |

---

## NEXT UP

### 1. Event/Calendar QR Code Type
**Tier**: STANDARD | **Priority**: 6 of 24 | **Effort**: ~1-2 days

**What**: QR code that adds an event to the user's calendar (iCal format).

**Why build this**:
- Already in your roadmap
- Common use case (conferences, weddings, appointments)
- Differentiator from basic generators

**Implementation**:
- New QR type: `event`
- Input: Event name, date/time, end time, location, description
- Output: Either vCalendar data URI or landing page with "Add to Calendar" button

**UI Components (Content Step)**:
- Event name input
- Date picker
- Start time / End time
- Location (optional)
- Description (optional)
- All-day toggle

**Two approaches**:
1. **Direct iCal**: Encode vCalendar data in QR (works offline, limited data)
2. **Landing page**: `/r/[code]/event` with Add to Calendar buttons (Google, Apple, Outlook)

**Recommendation**: Landing page approach - more reliable, better UX, enables analytics

**Landing page** (`/r/[code]/event`):
- Event details display
- "Add to Google Calendar" button
- "Add to Apple Calendar" button (.ics download)
- "Add to Outlook" button
- Share buttons

**Files to create/modify**:
- `src/components/qr/forms/EventForm.tsx`
- `src/app/r/[code]/event/page.tsx`
- `src/lib/calendar.ts` (iCal generation utility)
- Update type definitions

**Content to publish after**:
- New article: "QR Codes for Events: Complete Guide"

**Acceptance criteria**:
- [ ] Event form with all fields
- [ ] Landing page with calendar buttons
- [ ] Google Calendar link works
- [ ] .ics file download works
- [ ] Timezone handling correct
- [ ] All-day events supported

---

### 7. Geo/Location QR Code Type
**Tier**: STANDARD | **Priority**: 7 of 24 | **Effort**: ~1 day

**What**: QR code that opens a specific location in the user's maps app.

**Why build this**:
- Already in your roadmap
- Simple to implement (geo: URI scheme)
- Useful for physical locations, parking spots, etc.

**Implementation**:
- New QR type: `geo`
- Input: Address search OR manual lat/long
- Output: `geo:LAT,LONG` URI (universal) or landing page

**UI Components (Content Step)**:
- Address search with autocomplete
- OR manual coordinates input
- Map preview showing pin
- Location name (for display purposes)

**Landing page** (`/r/[code]/location`):
- Map embed showing location
- "Open in Google Maps" button
- "Open in Apple Maps" button
- Address display
- "Get Directions" CTA

**Files to create/modify**:
- `src/components/qr/forms/GeoForm.tsx`
- `src/app/r/[code]/location/page.tsx`
- Update type definitions

**Acceptance criteria**:
- [ ] Address search works
- [ ] Manual coordinates work
- [ ] Map preview in form
- [ ] Landing page with map embed
- [ ] Opens native maps apps correctly

---

### 8. A/B Testing for Dynamic QR Codes
**Tier**: MAJOR | **Priority**: 8 of 24 | **Effort**: ~1 week

**What**: Split traffic between two destinations to test which performs better.

**Why build this**:
- No free QR generator offers this
- Strong upsell to Pro/Business (marketing teams need this)
- Positions QRWolf as "marketing-focused"

**Implementation**:
- Pro feature (or Business only)
- Add A/B configuration to dynamic QR codes
- Split traffic 50/50 (or configurable)
- Track conversions per variant

**Database changes**:
```sql
-- Add to qr_codes table
ab_enabled BOOLEAN DEFAULT false,
ab_variant_b_url TEXT,
ab_split_percentage INTEGER DEFAULT 50, -- percentage to variant B

-- Add to scans table
ab_variant CHAR(1) -- 'A' or 'B'
```

**UI Components**:
- Toggle: "Enable A/B Testing" in Options step
- Input: Variant B destination URL
- Slider: Traffic split percentage
- Analytics: Side-by-side comparison chart

**Redirect logic update** (`/r/[code]/route.ts`):
```typescript
if (qrCode.ab_enabled && qrCode.ab_variant_b_url) {
  const variant = Math.random() * 100 < qrCode.ab_split_percentage ? 'B' : 'A';
  const destination = variant === 'B' ? qrCode.ab_variant_b_url : qrCode.destination_url;
  // Log variant in scan record
  // Redirect to destination
}
```

**Analytics UI**:
- Variant A vs B scan counts
- Conversion tracking (requires destination pixel/callback)
- Statistical significance indicator
- "Winner" declaration when confidence reached

**Files to create/modify**:
- Update Options step with A/B toggle
- Update redirect route with split logic
- `src/components/analytics/ABTestResults.tsx`
- Database migration

**Content to publish after**:
- New article: "QR Code A/B Testing Guide"

**Acceptance criteria**:
- [ ] A/B toggle in QR options (Pro+)
- [ ] Variant B URL input
- [ ] Traffic split works correctly
- [ ] Scans tracked per variant
- [ ] Analytics shows comparison
- [ ] Can disable A/B test

---

### 9. Template Gallery
**Tier**: STANDARD | **Priority**: 9 of 24 | **Effort**: ~2-3 days

**What**: Pre-designed QR code templates by industry/use case.

**Why build this**:
- Reduces friction for new users
- SEO opportunity: "QR code template for restaurant"
- Upsell path (Pro templates with logos)

**Implementation**:
```
Route: /templates
Route: /templates/[category]
```

**Template structure**:
```typescript
interface QRTemplate {
  id: string;
  name: string;
  category: 'restaurant' | 'retail' | 'real-estate' | 'events' | 'business';
  description: string;
  qrType: QRContentType;
  defaultContent: Partial<QRContent>;
  style: QRStyleConfig;
  thumbnail: string;
  isPro: boolean;
}
```

**Categories**:
- Restaurants (menu, reviews, wifi)
- Retail (product info, loyalty, feedback)
- Real Estate (listing, contact, virtual tour)
- Events (registration, schedule, feedback)
- Business Cards (vCard, LinkedIn, portfolio)

**UI Components**:
- Template gallery grid
- Category filters
- "Use This Template" button → pre-fills QR creator
- Pro badge on premium templates

**Files to create**:
- `src/app/(marketing)/templates/page.tsx`
- `src/app/(marketing)/templates/[category]/page.tsx`
- `src/lib/templates/index.ts` (template definitions)
- `src/components/templates/TemplateCard.tsx`
- `src/components/templates/TemplateGallery.tsx`

**Content to publish after**:
- New blog: "QR Code Templates for Every Industry"

**Acceptance criteria**:
- [ ] Gallery page with all templates
- [ ] Category filtering
- [ ] "Use Template" pre-fills creator
- [ ] Pro templates marked
- [ ] Templates look professional
- [ ] Mobile responsive gallery

---

### 10. Print-Ready PDF Export
**Tier**: STANDARD | **Priority**: 10 of 24 | **Effort**: ~1-2 days

**What**: Download QR codes as print-ready PDF with crop marks and bleed.

**Why build this**:
- Professional users need this
- Differentiator from basic generators
- Pro feature upsell

**Implementation**:
- New download format option: "PDF (Print-Ready)"
- Options: Include crop marks, bleed area, CMYK conversion

**Technical**:
- Use `jsPDF` or `pdf-lib` for PDF generation
- SVG → PDF conversion
- Add crop marks as vector lines
- Optional: CMYK color conversion (complex, may skip)

**UI Components**:
- Download dropdown: PNG | SVG | PDF
- PDF options modal:
  - Include crop marks (checkbox)
  - Bleed area: 0.125" / 0.25" / custom
  - Paper size: Letter / A4 / Custom
  - QR position on page

**Files to create/modify**:
- `src/lib/qr/pdf-generator.ts`
- Update download step with PDF option
- `src/components/qr/PDFOptionsModal.tsx`

**Acceptance criteria**:
- [ ] PDF download works
- [ ] Crop marks optional
- [ ] Bleed area configurable
- [ ] QR code is vector (not raster) in PDF
- [ ] Multiple paper sizes supported

---

### 11. Simple Feedback Form QR Type
**Tier**: MAJOR | **Priority**: 11 of 24 | **Effort**: ~1 week

**What**: QR code that links to a simple branded feedback form, responses collected in dashboard.

**Why build this**:
- High demand for quick feedback collection
- Reduces need for external survey tools
- Strong upsell (Pro: unlimited responses, Business: export)

**Implementation**:
- New QR type: `feedback`
- Built-in form builder (simple: rating + comment)
- Landing page with form
- Dashboard to view responses

**Form options**:
- Rating type: Stars (1-5) / NPS (0-10) / Thumbs up/down
- Optional comment field
- Optional email field
- Custom thank you message

**Database**:
```sql
CREATE TABLE feedback_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID REFERENCES qr_codes(id),
  rating INTEGER,
  comment TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);
```

**Landing page** (`/r/[code]/feedback`):
- Branded header (business name/logo)
- Rating selector
- Comment textarea
- Submit button
- Thank you confirmation

**Dashboard**:
- Average rating
- Response count
- Recent responses list
- Export to CSV

**Files to create**:
- `src/components/qr/forms/FeedbackForm.tsx`
- `src/app/r/[code]/feedback/page.tsx`
- `src/app/(dashboard)/qr-codes/[id]/feedback/page.tsx`
- API route for form submission
- Database migration

**Tier gating**:
- Free: 10 responses/month
- Pro: 1,000 responses/month
- Business: Unlimited + export

**Acceptance criteria**:
- [ ] Feedback QR type in selector
- [ ] Form builder with rating options
- [ ] Landing page works
- [ ] Responses stored in database
- [ ] Dashboard shows responses
- [ ] Export to CSV (Business)
- [ ] Tier limits enforced

---

### 12. YouTube QR Code Type (Enhanced)
**Tier**: STANDARD | **Priority**: 12 of 24 | **Effort**: ~1 day

**What**: Dedicated YouTube QR type with video preview landing page.

**Why build this**:
- "youtube qr code" high search volume
- Better UX than plain URL
- Showcases landing page capabilities

**Implementation**:
- New QR type: `youtube`
- Input: YouTube URL or video ID
- Parse and validate YouTube URLs
- Landing page with embedded video

**Landing page** (`/r/[code]/youtube`):
- Video thumbnail/embed
- Video title (fetched via oEmbed)
- Channel name
- "Watch on YouTube" button
- Subscribe button

**Technical**:
- YouTube oEmbed API for metadata (no API key needed)
- URL parsing for video ID extraction
- Embedded player option

**Files to create**:
- `src/components/qr/forms/YouTubeForm.tsx`
- `src/app/r/[code]/youtube/page.tsx`
- `src/lib/youtube.ts` (URL parsing, oEmbed fetching)

**Acceptance criteria**:
- [ ] Accepts various YouTube URL formats
- [ ] Extracts video ID correctly
- [ ] Landing page shows video info
- [ ] Embedded player works
- [ ] Mobile responsive

---

### 13. Spotify QR Code Type (Enhanced)
**Tier**: STANDARD | **Priority**: 13 of 24 | **Effort**: ~1 day

**What**: Dedicated Spotify QR type for tracks, albums, playlists, or artists.

**Why build this**:
- "spotify qr code" growing search volume
- Musicians/podcasters are target users
- Aligns with existing Audio type

**Implementation**:
- New QR type: `spotify`
- Input: Spotify URL
- Parse track/album/playlist/artist
- Landing page with Spotify embed

**Landing page** (`/r/[code]/spotify`):
- Spotify embed player
- Track/album artwork
- "Listen on Spotify" button
- Artist info

**Technical**:
- Spotify oEmbed for embed code
- URL parsing for content type detection

**Files to create**:
- `src/components/qr/forms/SpotifyForm.tsx`
- `src/app/r/[code]/spotify/page.tsx`

**Acceptance criteria**:
- [ ] Accepts Spotify URLs
- [ ] Detects content type (track/album/playlist/artist)
- [ ] Embed player works
- [ ] Mobile responsive

---

### 14. TikTok QR Code Type
**Tier**: QUICK WIN | **Priority**: 14 of 24 | **Effort**: ~4-6 hours

**What**: Dedicated TikTok QR for profiles or videos.

**Why build this**:
- Growing platform, younger demographic
- "tiktok qr code" increasing searches
- Aligns with social media focus

**Implementation**:
- New QR type: `tiktok`
- Input: TikTok profile or video URL
- Landing page with TikTok branding

**Files to create**:
- `src/components/qr/forms/TikTokForm.tsx`
- `src/app/r/[code]/tiktok/page.tsx`

---

### 15. Multi-Platform Review QR (Google + Yelp + TripAdvisor)
**Tier**: STANDARD | **Priority**: 15 of 24 | **Effort**: ~2 days

**What**: Landing page with buttons for multiple review platforms.

**Why build this**:
- Businesses want reviews everywhere
- Higher-value than single-platform
- Pro feature differentiation

**Implementation**:
- Enhanced version of Google Reviews type
- Input: URLs for each platform (optional)
- Landing page with multiple buttons

**Landing page**:
- "Leave us a review" header
- Google Reviews button
- Yelp button
- TripAdvisor button
- Facebook Reviews button
- Custom platform support

---

### 16. Embed Code Generator
**Tier**: QUICK WIN | **Priority**: 16 of 24 | **Effort**: ~4 hours

**What**: Generate HTML embed code to display QR code on websites.

**Why build this**:
- Common request
- Easy to implement
- Increases QR code visibility (marketing)

**Implementation**:
- New option in download step: "Embed Code"
- Generates `<img>` tag or `<iframe>` for dynamic codes
- Copy button

**Options**:
- Static embed (image URL)
- Dynamic embed (updates when QR changes)
- Size options
- With/without border

---

### 17. Campaign Grouping
**Tier**: STANDARD | **Priority**: 17 of 24 | **Effort**: ~2-3 days

**What**: Group QR codes into campaigns with combined analytics.

**Why build this**:
- Marketing teams run multi-QR campaigns
- Aggregate reporting is valuable
- Pro/Business feature

**Implementation**:
- Campaigns as a layer above folders
- Combined analytics dashboard
- Campaign-level reporting

**Database**:
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add to qr_codes
campaign_id UUID REFERENCES campaigns(id)
```

---

### 18. QR Code Scheduling (Enhanced)
**Tier**: QUICK WIN | **Priority**: 18 of 24 | **Effort**: ~4 hours

**What**: Improve existing scheduling with timezone support and recurring schedules.

**Why build this**:
- Existing feature can be improved
- Timezone issues are common pain point

**Enhancements**:
- Timezone selector
- Recurring schedules (daily, weekly)
- Preview of active periods

---

### 19. Bulk QR Code Analytics
**Tier**: STANDARD | **Priority**: 19 of 24 | **Effort**: ~1-2 days

**What**: Combined analytics view for bulk-generated QR codes.

**Why build this**:
- Bulk generation exists but analytics is per-code
- Businesses need aggregate view

**Implementation**:
- Batch-level analytics dashboard
- Compare codes within batch
- Export batch report

---

### 20. Webhook Notifications
**Tier**: MAJOR | **Priority**: 20 of 24 | **Effort**: ~1 week

**What**: Send HTTP webhooks when QR codes are scanned.

**Why build this**:
- Business tier feature
- Enables integrations (Zapier, custom apps)
- Already in planned roadmap

**Implementation**:
- Webhook URL configuration per QR code
- Retry logic for failed deliveries
- Webhook logs in dashboard

---

### 21. Custom Short URL Slugs
**Tier**: STANDARD | **Priority**: 21 of 24 | **Effort**: ~1 day

**What**: Let users choose their own short code (e.g., qrwolf.com/r/mybrand).

**Why build this**:
- Pro feature - branding value
- Easy to implement

**Implementation**:
- Input field for custom slug
- Availability checker
- Reserved words blocklist

---

### 22. QR Code Duplication
**Tier**: QUICK WIN | **Priority**: 22 of 24 | **Effort**: ~2 hours

**What**: One-click duplicate a QR code with all settings.

**Why build this**:
- Common workflow need
- Very easy to implement
- Improves UX

---

### 23. QR Code Archive/Restore
**Tier**: QUICK WIN | **Priority**: 23 of 24 | **Effort**: ~4 hours

**What**: Archive QR codes instead of deleting, with restore option.

**Why build this**:
- Prevents accidental data loss
- Professional feature expectation

---

### 24. White-Label Landing Pages
**Tier**: EPIC | **Priority**: 24 of 24 | **Effort**: ~2-3 weeks

**What**: Remove QRWolf branding from landing pages (Business tier).

**Why build this**:
- High-value Business tier feature
- Agencies need this

**Implementation**:
- Custom domain support
- Remove "Powered by QRWolf"
- Custom CSS theming

---

## Completed Features

| Feature | Completed | Notes |
|---------|-----------|-------|
| Snapchat QR Code Type | 2026-01-23 | 21st QR type. Username-based input. Direct redirect to snapchat.com/add/username. Free tier social type. |
| Threads QR Code Type | 2026-01-23 | 22nd QR type. Username-based input. Direct redirect to threads.net/@username. Free tier social type. |
| TikTok QR Code Type | 2026-01-23 | 20th QR type. Username-based input with smart URL parsing. Direct redirect to tiktok.com/@username. Free tier social type. |
| X (Twitter) QR Code Type | 2026-01-23 | 19th QR type. Username-based input with smart URL parsing (x.com/twitter.com). Direct redirect. Free tier social type. |
| LinkedIn QR Code Type | 2026-01-23 | 18th QR type. Username-based input with smart URL parsing. Direct redirect (no landing page). Free tier social type. |
| Google Reviews QR Type | 2026-01-22 | 17th QR type. Landing page at `/r/[code]/review` with business name, 5-star visual, customizable accent color. Place ID input with validation. Free tier. |
| QR Code Reader Tool | 2026-01-21 | Route: `/tools/qr-reader`. Drag-and-drop image upload, camera support on mobile, jsQR decoding, content type detection (URL, email, phone, WiFi, vCard), copy to clipboard, action buttons. |
| QR Code Contrast Checker Tool | 2026-01-21 | Route: `/tools/contrast-checker`. Dual color pickers, WCAG contrast ratio calculation, pass/fail indicator with scale, live QR preview, preset color combinations, deep link to QR creator with colors. |
| Tools Hub Page | 2026-01-21 | Route: `/tools`. Lists all free tools with cards. Added "Tools" link to PublicNav and Footer. |
| QR Code Size Calculator Tool | 2026-01-21 | Route: `/tools/size-calculator`. Interactive calculator with distance slider, error correction selection, unit toggles (feet/meters, inches/cm/feet), minimum/recommended size cards, size comparison visual, and CTA to create QR code. |

---

## Parking Lot (Future Consideration)

Features not prioritized but worth tracking:

- **Custom domains for short URLs** - Complex, DNS management needed
- **Team permissions** - Role-based access within teams
- **QR code versioning** - History of changes with rollback
- **Internationalization** - Multi-language landing pages
- **Dark mode landing pages** - User preference detection
- **QR code watermarking** - "Sample" overlay for previews
- **Animated QR codes** - GIF/video QR codes
- **NFC + QR combo** - Generate both from same data

---

## Dependencies Map

```
Size Calculator ──┐
                  ├──► Tools Hub Page
Contrast Checker ─┤
                  │
QR Decoder ───────┘

Google Reviews ───► Multi-Platform Reviews

Event QR ─────────► Template Gallery (event templates)

A/B Testing ──────► Campaign Grouping (campaign-level A/B)
```

---

## Content-Feature Alignment

| Feature | Enables Content |
|---------|-----------------|
| Size Calculator | "QR Code Size Guide" (update), "How to Print QR Codes" (update) |
| Contrast Checker | "QR Code Colors Guide" (new) |
| QR Decoder | "How to Test QR Code" (new) |
| Google Reviews | "Google Reviews QR Code" (new) |
| Event QR | "Event QR Codes" (new) |
| A/B Testing | "QR Code A/B Testing Guide" (new) |
| Templates | "QR Code Templates for [Industry]" (series) |
| Feedback Form | "QR Codes for Customer Feedback" (new) |

---

## Revision History

| Date | Changes |
|------|---------|
| 2026-01-23 | Completed Snapchat and Threads QR Code Types, 21st/22nd QR types |
| 2026-01-23 | Completed TikTok QR Code Type (Feature #14), 20th QR type |
| 2026-01-23 | Completed X (Twitter) QR Code Type, 19th QR type |
| 2026-01-23 | Completed LinkedIn QR Code Type, updated priorities |
| 2026-01-21 | Completed Contrast Checker and QR Reader tools - Tools section complete |
| 2026-01-21 | Completed Tools Hub Page (Feature #4), added Tools to nav |
| 2026-01-21 | Completed QR Code Size Calculator Tool (Feature #1) |
| 2026-01-21 | Initial roadmap created with 25 prioritized features |
