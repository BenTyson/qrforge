# QRWolf Feature Roadmap

> **Last Updated**: January 31, 2026
> **Status**: Active development
> **Current Features**: 36 QR types, Analytics, Bulk Batch Analytics, Campaign Grouping, Enhanced Scheduling, Bulk generation, API, A/B Testing, Template Gallery, PDF Export, Embed Code Generator, Logo Crop Editor, Sentry error tracking, Cron-based email automation, Feedback Forms, Contact Form, 151 SEO articles (all with CTAs)
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
| Bulk QR Code Analytics | 2026-01-31 | Business tier feature. Batch-level analytics via `?batch=` URL param. BatchFilterSelect dropdown, BatchComparisonTable with per-code ranking/percentages/CSV export, amber batch header card. "Analytics" button on BulkBatchCard. Mutual exclusivity with QR/campaign filters. No migration needed. 4 new files, 3 modified. 14 new tests (257 total). |
| Enhanced QR Code Scheduling | 2026-01-31 | Pro+ feature. Timezone selector (~55 IANA timezones), recurring schedules (daily/weekly), 7-day active periods preview, SchedulePreview component, info callout for creators. `isActiveAtTime()` enforces schedule on redirect route. Backward compatible — existing one-time schedules unchanged. 4 new files, 12 modified. 27 new tests. |
| Campaign Grouping | 2026-01-31 | Pro/Business feature. Independent from folders (QR can be in both). `campaigns` table with full CRUD API. Chip-based CampaignManager UI (indigo accent) with create/edit/delete modal. Campaign badge on QR cards. Campaign filter on QR codes page and analytics page. Analytics reuse existing aggregation by narrowing qrCodeIds. Tier limits: free=0, pro=5, business=unlimited. 10 new files, 10 modified. |
| Multi-Platform Review QR | 2026-01-31 | 36th QR type (free tier). Landing page at `/r/[code]/reviews` with branded buttons for Google, Yelp, TripAdvisor, Facebook, and custom platforms. Dynamic platform management in form. Phone-mockup preview. Platform logos on buttons. Accent color customization. 5 new files, 12 modified. |
| QR Code Duplication | 2026-01-31 | One-click duplicate with POST `/api/qr/[id]/duplicate`. Copies content, style, folder, schedule, password. Resets name to "(Copy)", scan_count to 0, clears bulk_batch_id and archived_at. Tier limit enforcement. Duplicate button on dashboard cards. |
| QR Code Archive/Restore | 2026-01-31 | Soft-delete with `archived_at` column. Active/Archived tab toggle on QR codes page. Archive replaces delete button (amber). Restore + permanent delete in archived view. Archived codes still resolve when scanned. Dashboard stats and v1 API exclude archived by default (`?include_archived=true` to include). Optimistic UI updates. |
| Feedback Form QR Type | 2026-01-30 | 35th QR type (free tier). Branded feedback form with 3 rating variants (stars/emoji/numeric), optional comment + email. Landing page at `/r/[code]/feedback`. Public API with honeypot spam prevention + IP rate limiting. Dashboard with summary cards, rating distribution, paginated responses, CSV export (Business). Tier limits: Free 10/mo, Pro 1,000/mo, Business unlimited. 7 new files, 15 modified. |
| Embed Code Generator | 2026-01-28 | Quick win. Modal with static (base64) and dynamic (URL-based) embeds in HTML `<img>`, inline SVG, Markdown formats. Public `/api/embed/[id]` endpoint for dynamic embeds. Available in QR Studio download step and dashboard cards. Free: static HTML + Markdown. Pro: + dynamic + inline SVG. UX polish: truncated base64 display, visual preview, format hints, smart embed-type auto-detection, scrollable modal. |
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

- **Dashboard page modularization** - Break monolithic dashboard pages into smaller, composable components
- **Enhanced admin analytics** - Deeper admin-level analytics and insights
- **Map API for Location QR** - Integrate a map API (e.g., Google Maps) into the Geo/Location QR type for richer previews
- **Additional social media QR types** - Expand social platform coverage beyond current set
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
| 2026-01-31 | Completed Bulk QR Code Analytics (Feature #19). Business tier. Batch filter, per-code comparison table, CSV export, batch header card. 4 new files, 3 modified. 257 tests passing (14 new). |
| 2026-01-31 | Completed Enhanced QR Code Scheduling (Feature #18). Pro+ feature. Timezone selector, daily/weekly recurring schedules, 7-day preview, `isActiveAtTime()` enforcement. Backward compatible. 4 new files, 12 modified. 243 tests passing (27 new). |
| 2026-01-31 | Completed Campaign Grouping (Feature #17). Pro/Business feature. Campaigns table, CRUD API, CampaignManager/CampaignModal UI, campaign badge on QR cards, campaign filter on analytics, Edit button relocated to card header, Tooltip components on all icon buttons. 10 new files, 10 modified. 216 tests passing. |
| 2026-01-31 | Completed Multi-Platform Review QR (Feature #15). 36th QR type (free tier). Landing page with branded platform buttons (Google, Yelp, TripAdvisor, Facebook, custom). Dynamic platform management, phone-mockup preview, platform logos. 5 new files, 12 modified. 216 tests passing. |
| 2026-01-31 | Completed QR Code Duplication (Feature #22) and Archive/Restore (Feature #23). One-click duplicate with tier limit checks. Soft-delete archive with Active/Archived tabs, restore, permanent delete. Dashboard and API exclude archived by default. 3 new files, 6 modified. |
| 2026-01-31 | Landing Page Previews: added phone-mockup previews for 8 QR types (text, google-review, wifi, vcard, spotify, youtube, event, geo). All 18 landing-page types now have Content-step sidebar previews. 8 new files, 1 modified. |
| 2026-01-31 | Contact Form: replaced static mailto page with working form, Resend email integration, rate limiting, honeypot, React Email template. 3 new files, 3 modified. |
| 2026-01-30 | FAQ Overhaul: 10 static cards → 22-item categorized accordion FAQ with Radix component, 5 category filter tabs, contact CTA. QR Types badge fixed to 35. |
| 2026-01-30 | Feedback UX Improvements: dashboard Responses button on feedback cards, thank-you page CTA button (ctaUrl/ctaLabel fields), updated creator info box. 6 files modified. |
| 2026-01-30 | Completed Feedback Form QR Type (Feature #11). 35th QR type. 7 new files, 15 modified. 216 tests passing. |
| 2026-01-29 | QR Studio Modularization Refactor (6 phases): unified validation module, form/preview registries, extracted ContentStep + DownloadStep, split monolithic hook into 5 focused hooks, social form factory (8 forms), StyleStep tab extraction, QRStudioContext to eliminate prop drilling. 20 new files, 24 modified, ~800 lines removed, 0 behavior changes. |
| 2026-01-29 | QR Studio UI refinements: compact pill color presets (14 total), Logo tab reordered to 2nd, branded SVG icons for all 34 QR types in type selector. |
| 2026-01-29 | Logo Crop Modal bug fixes: rounded shape overlay, live preview thumbnail, object URL leak fix. |
| 2026-01-29 | Logo Editor Enhancement: react-easy-crop crop modal, shape masking (square/rounded/circle), margin slider, background color picker. Velite blog build fix (2 posts restored). |
| 2026-01-28 | Embed Modal UX polish: truncated base64 display, visual QR preview, format hints, smart embed-type auto-detection, scrollable modal, card button wrap fix. |
| 2026-01-28 | Completed Embed Code Generator (Feature #16). Modal with static/dynamic embeds, public SVG endpoint, tier gating. |
| 2026-01-28 | Static/dynamic QR architecture alignment: Free tier now gets 5 QR codes (was "unlimited static" + 0 dynamic). Limit enforcement in client + API. URL editing gated behind Pro. Dead code cleanup. |
| 2026-01-28 | Dashboard & Analytics V2: Sparkline charts, trend badges, Top Performing section, enriched Recent Activity, contextual Quick Actions, per-QR filtering, Traffic Sources/OS breakdowns, expandable locations. |
| 2026-01-27 | Homepage UX redesign: QR Types section split into 3 tabbed categories (Basics/Social/Pro), Testimonials section replaced with auto-rotating 3-card carousel with dot navigation. |
| 2026-01-27 | Fixed critical double-billing bug on subscription upgrades (old subscription now auto-cancelled). Surfaced real Stripe errors in portal endpoint. Fixed signup page Suspense boundary for production build. |
| 2026-01-27 | Sentry error tracking fully installed. Cron jobs configured via cron-job.org. Email test endpoint created. PDF export bugs fixed (redirect, import, rendering). Pro users excluded from usage warnings. |
| 2026-01-26 | Completed Content Audit: 58 articles updated with ArticleCTAs (P1-P4). Updated content skill with CTA requirements for future content generation. |
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
