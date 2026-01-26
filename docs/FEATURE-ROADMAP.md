# QRWolf Feature Roadmap

> **Last Updated**: January 26, 2026
> **Status**: Active development
> **Current Features**: 34 QR types, Analytics, Bulk generation, API, A/B Testing, Template Gallery, PDF Export, 151 SEO articles
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
| Print-Ready PDF Export | 2026-01-26 | Pro feature. jsPDF integration. Options: paper size (Letter/A4/custom), QR size, bleed area, crop marks. PDFOptionsModal component. Button in QRStudio download step. |
| Template Gallery | 2026-01-25 | 40 templates across 7 categories (Restaurant, Business, Marketing, Events, Social, Retail, Creative). Templates are style presets (type + colors/patterns/frames). 13 free, 27 Pro. Gallery at `/templates` with filtering/search. Creator integration via `?template=` param. |
| A/B Testing for Dynamic QR Codes | 2026-01-25 | Pro+ feature. Split traffic between destinations with configurable weights (10-90%). Deterministic variant assignment (same visitor = same variant). Statistical significance calculations with 95% confidence threshold. Dashboard with comparison charts, pause/resume, declare winner. Separate tables: ab_tests, ab_variants, ab_assignments. |
| Geo/Location QR Code Type | 2026-01-24 | 28th QR type. Coordinates input with "Use my current location" button. Landing page with OpenStreetMap embed, Open in Google Maps, Open in Apple Maps, and Get Directions buttons. Free tier. |
| Event/Calendar QR Code Type | 2026-01-24 | 27th QR type. Event form with title, dates, location, description. Landing page with Add to Google Calendar, Apple Calendar (.ics), and Outlook buttons. All-day event support. Free tier. |
| Discord QR Code Type | 2026-01-24 | 28th QR type. Invite code-based input with URL parsing (discord.gg and discord.com/invite). Direct redirect to discord.gg/code. Free tier social type. |
| Twitch QR Code Type | 2026-01-24 | 27th QR type. Username-based input with URL parsing. Direct redirect to twitch.tv/username. Free tier social type. |
| Reddit QR Code Type | 2026-01-24 | 26th QR type. Supports user profiles (u/username) and subreddits (r/subreddit). Tab-based selection in form. Direct redirect to reddit.com. Free tier social type. |
| Spotify QR Code Type | 2026-01-24 | 25th QR type. Parses Spotify URLs and URIs for tracks, albums, playlists, artists, shows, and episodes. Landing page with Spotify embed player. Free tier. |
| Pinterest QR Code Type | 2026-01-23 | 24th QR type. Username-based input with URL parsing. Direct redirect to pinterest.com/username. Free tier social type. |
| YouTube QR Code Type | 2026-01-23 | 23rd QR type. Smart URL parsing for all YouTube formats. Landing page with video embed, metadata via oEmbed. Free tier. |
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
| 2026-01-26 | Completed PDF Export (Feature #10), ArticleCTA component, Content Audit plan, updated types article to 34 types |
| 2026-01-25 | Completed Template Gallery (Feature #9), 40 templates across 7 categories |
| 2026-01-24 | Completed Geo/Location QR Code Type, 28th QR type with landing page and map buttons |
| 2026-01-24 | Completed Event/Calendar QR Code Type, 27th QR type with landing page and calendar buttons |
| 2026-01-24 | Completed Spotify QR Code Type (Feature #12), 25th QR type with landing page and embed |
| 2026-01-24 | Completed Reddit QR Code Type, 26th QR type (users and subreddits) |
| 2026-01-23 | Completed YouTube QR Code Type (Feature #12), 23rd QR type with landing page |
| 2026-01-23 | Completed Pinterest QR Code Type, 24th QR type |
| 2026-01-23 | Completed Snapchat and Threads QR Code Types, 21st/22nd QR types |
| 2026-01-23 | Completed TikTok QR Code Type (Feature #14), 20th QR type |
| 2026-01-23 | Completed X (Twitter) QR Code Type, 19th QR type |
| 2026-01-23 | Completed LinkedIn QR Code Type, updated priorities |
| 2026-01-21 | Completed Contrast Checker and QR Reader tools - Tools section complete |
| 2026-01-21 | Completed Tools Hub Page (Feature #4), added Tools to nav |
| 2026-01-21 | Completed QR Code Size Calculator Tool (Feature #1) |
| 2026-01-21 | Initial roadmap created with 25 prioritized features |
