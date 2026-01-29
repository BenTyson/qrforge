# QRWolf Changelog

Session-by-session history of development work. Most recent first.

---

## January 29, 2026

### Logo Crop Modal Bug Fixes

Audited and fixed four issues in the Logo Crop Editor shipped earlier today.

#### Bug Fixes
- **Rounded shape overlay**: The "Rounded" shape option looked identical to "Square" in the crop modal because both mapped to `'rect'`. Added `cropAreaStyle` with `borderRadius: '15%'` to the Cropper component when shape is `'rounded'`, matching the 15% radius used in the canvas output.
- **No background preview**: Background color was only visible after clicking Apply. Added a debounced (150ms) live preview thumbnail (56×56px, checkerboard transparency) next to the zoom slider that calls `getCroppedImage()` whenever crop area, shape, or background settings change.
- **Object URL leak**: If the logo file changed while `createImageUrl()` was still resolving, the old promise's URL was never revoked. Added a `cancelled` flag so late-resolving URLs are revoked immediately and `setImageUrl` is skipped.

#### Files Modified
- `src/components/qr/LogoCropModal.tsx` — Added `useRef` import, preview state/refs, cancelled-flag pattern in image load effect, cleanup effect for preview resources, debounced preview generation effect, `cropAreaStyle` on Cropper, restructured zoom section with preview thumbnail.
- `src/lib/qr/cropUtils.ts` — Updated comment on background fill placement (before clip is intentional: fills corners outside shape mask for QR contrast).

### Logo Editor Enhancement

Replaced the basic upload-and-slider logo experience with a full crop modal and rich inline controls.

#### New Dependency
- `react-easy-crop` (~9 KB gzipped) for interactive image cropping with pinch-to-zoom support

#### New Files
- `src/lib/qr/cropUtils.ts` — Canvas utility: `getCroppedImage()` crops, applies shape mask (square/rounded/circle), fills optional background color, exports PNG blob. `createImageUrl()` handles SVG rasterization for the cropper.
- `src/components/qr/LogoCropModal.tsx` — Dialog modal with `react-easy-crop` Cropper (1:1 aspect), zoom slider (1x–3x), shape selector, background toggle + color picker, Apply/Cancel buttons.

#### Modified Files
- `src/lib/qr/types.ts` — Added `LogoShape` type, `logoShape`, `logoMargin`, `logoBackground` fields to `QRStyleOptions`, added new fields to `PRO_STYLE_FEATURES`
- `src/components/qr/LogoUploader.tsx` — Added `onFileSelected` prop; when provided, delegates to parent (crop modal) instead of uploading directly. Existing callers (CouponForm, MenuForm) unaffected.
- `src/components/qr/wizard/steps/StyleStep.tsx` — Expanded `LogoTabContent`: crop modal integration, logo thumbnail with Edit/Remove, shape selector (square/rounded/circle), size slider (10–35%), margin slider (0–20px), background toggle + color picker. Shape/background changes re-process original file through crop pipeline.
- `src/lib/qr/generator.ts` — `logoMargin` now reads from style options (was hardcoded 4), added `hideBackgroundDots: true` for cleaner logo zone.
- `src/components/qr/LogoBestPractices.tsx` — Updated shape tip to reference built-in shape tool.

#### UX Flow
1. User drops/selects image → crop modal opens with 1:1 cropper
2. User zooms, pans, selects shape, toggles background → clicks Apply
3. Canvas crops + masks + backgrounds → PNG blob uploaded to `/api/qr/upload-media`
4. Inline controls appear (shape, size, margin, background) with live QR preview updates
5. "Edit" reopens crop modal with original file; "Remove" clears logo

### Velite Blog Build Fix

Fixed 2 blog posts (`how-to-make-qr-code-for-link.mdx`, `qr-code-for-google-form.mdx`) failing with `EISDIR: illegal operation on a directory, read content`.

- Root cause: `[QRWolf.com](/)` links with bare `/` URL. Velite's `isRelativePath` regex requires at least one character after the leading slash, so `/` was treated as a relative path, causing Velite to `readFile('content')` (the root directory).
- Fix: Changed `(/)` to `(https://qrwolf.com)` in both files. Blog post count restored to 52.

---

## January 28, 2026

### Embed Modal UX Improvements

Polished the Embed Code Modal with usability improvements across display, preview, and interaction.

#### Truncated Base64 Display
- Long base64 data URIs in the code block are now replaced with `data:image/svg+xml;base64,...` for readability
- Full untruncated code is still copied when clicking "Copy Code"
- Explanatory note appears below code block when truncation is active

#### Visual Preview
- New `<img>` preview section renders the QR code on a white background at `min(size, 160)` px
- Mirrors the border style when the "Show Border" toggle is active
- Shows between the border toggle and the embed code block

#### Format Guidance Hints
- One-sentence contextual hint below the Format select, updating per format
- Covers HTML `<img>`, Inline SVG, Markdown, and Dynamic embed use cases

#### Smart Embed Type Detection
- Modal auto-selects Dynamic for Pro/Business users when a `qrId` is present
- Hides the Static/Dynamic tabs entirely when dynamic embedding is impossible (no `qrId`)
- Pro users can still switch between modes when both are available

#### Minor Fixes
- Renamed code block label from "Preview" to "Embed Code" (visual preview now owns "Preview")
- Updated dialog description to "Generate a snippet to embed this QR code on any webpage or document."
- Added `max-h-[60vh]` scrollable body to prevent modal overflow on smaller viewports
- Added `flex-wrap` to QRCodeCard action buttons to prevent folder/delete buttons from being clipped

---

### Embed Code Generator (Feature #16)

Added a modal that generates copy-pasteable HTML/SVG/Markdown embed snippets for any saved QR code. Available from both the QR Studio download step and dashboard QR code cards.

#### New Files
- `src/lib/qr/embed-templates.ts` — Pure utility with `generateEmbedCode()` supporting static (base64) and dynamic (URL-based) embeds in HTML `<img>`, inline SVG, and Markdown formats. Includes `escapeHtml()` helper and border wrapping option.
- `src/lib/qr/__tests__/embed-templates.test.ts` — 19 unit tests covering all template combinations, escaping, border toggle, size params, and null-qrId fallback.
- `src/components/qr/EmbedCodeModal.tsx` — shadcn Dialog modal following PDFOptionsModal pattern. Tabs for Static/Dynamic embed type, format select, size select (128–512), border toggle, dark code preview, and copy button with checkmark feedback.
- `src/app/api/embed/[id]/route.ts` — Public GET endpoint serving SVG images for dynamic embeds. UUID validation, 60 req/min/IP rate limiting, admin Supabase client (bypasses RLS), server-side QR generation, CORS headers, 5-minute cache. Size clamped to 64–1024px.

#### Modified Files
- `src/components/qr/studio/QRStudio.tsx` — Added embed state, `handleShowEmbed` handler (saves QR if needed, generates SVG + data URL in parallel), "Get Embed Code" button with `</>` icon in DownloadStep, and EmbedCodeModal render.
- `src/components/qr/QRCodeCard.tsx` — Added embed state, handler, `</>` icon button in action row, and EmbedCodeModal render.

#### Tier Gating
- Free: Static HTML `<img>` + Markdown
- Pro/Business: + Dynamic embeds + Inline SVG
- Gated options show "Pro" badge; clicking navigates to `/plans`

#### Tests
- 19 new embed-templates tests, all passing
- Full suite: 216 tests passing, 0 lint errors, type-check clean

---

### Align Static/Dynamic QR Architecture with Product Intent

Resolved the static/dynamic QR code split left over from a Jan 21 emergency fix. All QR codes are now dynamic under the hood (single code path, no race condition risk). Plan definitions, UI copy, and enforcement updated to match.

#### Plan Definition Changes
- Free tier `dynamicQRLimit` changed from `0` to `5` (was incorrectly zero after the all-dynamic migration)
- Free tier feature copy updated: "Unlimited static QR codes" replaced with "5 QR codes"
- Added `getQRCodeLimit()` and `isWithinQRCodeLimit()` helper functions to `plans.ts`

#### QR Code Limit Enforcement
- **Client-side** (`useQRStudioState.ts`): `saveQRCode()` now queries the user's existing QR count before creating. Free users at their 5-code limit see an upgrade CTA. Skipped for edits and unlimited tiers.
- **API route** (`/api/v1/qr-codes`): POST handler enforces the same limit server-side (returns 403 when exceeded). Practically only applies if API access is ever extended beyond Business tier.
- Existing free users with >5 QR codes keep their codes; they just can't create new ones until they upgrade or are under the limit.

#### URL Editing Gated Behind Pro
- `/qr-codes/[id]/edit` page now checks user tier server-side
- Free users redirected to `/qr-codes/[id]?upgrade=edit` instead of seeing the edit form
- Uses `getEffectiveTier()` so trial users retain edit access

#### Code Cleanup
- Removed unused `_requiresDynamicQR` function from `useQRStudioState.ts`
- Removed unused `DYNAMIC_REQUIRED_TYPES` import from the same file
- Pricing page hardcoded feature list updated to match plan definitions

#### Tests
- Updated `plans.test.ts`: free tier limit expectation `0` → `5`, feature test "static" → "5 QR codes"
- Added `getQRCodeLimit` and `isWithinQRCodeLimit` test suites (12 new tests)
- Replaced `requiresDynamicQR` tests with QR limit enforcement tests (free blocked at limit, free allowed under limit, Pro proceeds)
- All 197 tests passing, 0 lint errors, type-check clean

---
### Dashboard & Analytics V2 Overhaul

Complete redesign of `/dashboard` and `/analytics` pages with new data visualizations, trend indicators, and per-QR filtering.

#### Dashboard Enhancements
- **Sparkline chart** on "Scans This Month" card showing last 7 days of activity (Recharts AreaChart)
- **Month-over-month trend badge** with green/red arrow and percentage change
- **Top Performing QR Codes section** showing top 3 by scan count with progress bars and edit links
- **Enriched Recent Activity** with device icons (mobile/desktop/tablet), clickable QR names, device + country display
- **Contextual Quick Actions** that change based on user state (new_user, no_scans, near_limit, default)
- **Two-phase data fetching** for optimized parallel queries

#### Analytics Enhancements
- **QR Code filter dropdown** to view analytics for a single QR code (URL param `?qr=`)
- **Single-QR header card** when filtering, showing name, type, total scans, edit link
- **Traffic Sources breakdown** (referrer domains grouped, "Direct" for empty)
- **Operating Systems breakdown** (new card in 2x2 grid)
- **Enhanced Locations** with expandable city lists per country using `<details>/<summary>`
- **Trend indicators** on hero stat cards (today vs yesterday, week vs last week, month vs last month)
- **Clickable QR names** throughout (Top Performing, Recent Scans table)
- **Analytics icon on hover** for quick per-QR filtering
- **Updated CSV export** includes OS, referrer, city, region fields
- **Updated mock data** for free-tier blurred view with new breakdowns

#### QR Code List Enhancement
- **Analytics chart icon** in QRCodeCard action bar linking to `/analytics?qr={id}`

#### New Files
- `src/components/dashboard/ScanSparkline.tsx` - Recharts sparkline component
- `src/components/analytics/QRCodeFilterSelect.tsx` - Client component for filter dropdown
- `src/lib/analytics/types.ts` - Shared `ScanData` interface

---

## January 27, 2026

### Homepage UX Redesign: Tabbed QR Types & Testimonial Carousel

#### QR Types Section — Tabbed Category Filter
- Replaced overwhelming flat 8-column grid (34 tiles, 4.5 rows) with a tabbed layout using Radix Tabs
- Three tabs: Basics (12 types), Social (13 types), Pro (9 types)
- Default tab is "Basics"; each tab shows at most ~2 rows of tiles
- Added `category` field to `QRType` interface and all 34 entries in `src/constants/homepage.tsx`
- Switched from rigid CSS grid to `flex-wrap justify-center` so smaller groups (like Pro with 9) center naturally
- Component converted to `"use client"` for tab interactivity

#### Testimonials Section — Auto-Rotating Carousel
- Replaced static 6-card grid + 4-card horizontal scroll (10 cards visible at once) with a 3-card rotating carousel
- Auto-advances every 6 seconds, pauses on hover
- Dot-style page indicators (active dot stretches wider) with click-to-navigate
- All 10 testimonials surface across 4 pages; trust badges section unchanged
- Accessible: each dot has `aria-label`

---

### Stripe Billing Portal & Subscription Upgrade Fixes

#### Stripe Portal Error Handling
- Surfaced actual Stripe error messages in portal endpoint instead of generic "Failed to create portal session"
- Diagnosed root cause: admin test account had fake `stripe_customer_id` not matching any real Stripe customer
- Added `portalError` display to BillingSection component (deployed in earlier commit)

#### Double-Billing on Upgrade Fix (Critical)
- Discovered that upgrading from Pro → Business created a second subscription without cancelling the first
- Added automatic cancellation of existing active/trialing subscriptions in both subscription creation paths:
  - `handleCheckoutCompleted` in Stripe webhook (checkout flow)
  - `finalize-subscription/route.ts` (custom subscription flow)
- Old subscriptions are cancelled after the new one is confirmed, preventing double-charges

#### Production Build Fix
- Fixed `useSearchParams()` Suspense boundary error on signup page that blocked Railway deploy
- Wrapped signup form in `<Suspense>` boundary, matching the pattern already used on the login page

---

### Growth Infrastructure: Sentry, Cron Jobs, PDF & Download Fixes

#### Bug Fixes
- Fixed QR Studio download step redirect bug: save from download step no longer auto-routes to dashboard
- Fixed PDF export jspdf dynamic import: replaced broken `Function()` hack with standard `await import('jspdf')`
- Fixed PDF export missing QR code: removed non-existent `addSvgAsImage`, now converts SVG→PNG via canvas with proper dimensions and base64 data URL

#### Sentry Error Tracking (Fully Set Up)
- Installed `@sentry/nextjs` SDK
- Created `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Created `src/instrumentation.ts` for server/edge runtime initialization
- Wired `error.tsx` and `global-error.tsx` to capture exceptions via Sentry
- `next.config.ts` Sentry wrapper now active (was conditional, SDK now installed)
- Production-only (disabled in development)
- Client-side: session replay (1% normal, 100% on error), browser tracing
- Created `/api/test/sentry` endpoint to verify integration post-deploy

#### Cron Jobs (Configured)
- Generated and set `CRON_SECRET` in Railway environment variables
- Configured cron-job.org with two daily jobs:
  - Onboarding emails (9:00 AM UTC): Day 1, 3, 7 emails for free users
  - Milestone emails (10:00 AM UTC): 50 scans, 5 QR codes, 80% usage warning
- Removed Pro users from 80% usage warning to avoid triggering cancellation
- Email targeting: onboarding (free only), milestones (all tiers), usage warning (free only)

#### Email Testing Endpoint
- Created `/api/test/emails` with preview and send capabilities
- GET: List all 12 templates or preview any as rendered HTML in browser
- POST: Send test emails with `[TEST]` subject prefix
- Sample data pre-configured for all templates
- Dev: no auth required; Production: requires Bearer token

#### Growth TODO Updates
- Marked PDF Export and Content CTAs as completed in TODO doc
- Marked Sentry and Cron Jobs as completed
- Renumbered remaining tasks

---

## January 26, 2026

### Content Audit Complete: 58 Articles with ArticleCTAs

#### P1-P4 Article Updates
- Added ArticleCTA components to **58 articles** across all priority levels
- P1 Foundation (4 articles): what-is-a-qr-code, static-vs-dynamic-qr-codes, how-to-create-a-qr-code, qr-code-faqs
- P2 Use-Cases (25 articles): All use-case articles with inline + banner CTAs
- P3 Industries (20 articles): All industry articles with 2-3 relevant CTAs each
- P4 Blog How-To (9 articles): All how-to articles with matching qrTypes

#### Content Skill Updates
- Updated `.claude/skills/content/SKILL.md` with comprehensive CTA documentation
- Added CTA placement guidelines (inline vs banner variants)
- Added full list of 34 available qrTypes for CTAs
- Updated Quality Checklist to require CTA verification
- Updated Workflow to include CTA step before build
- Updated Pre-Submission Audit with CTA checks
- Deprecated old prose CTAs in favor of ArticleCTA component
- Updated QRWolf Features Reference from 16 to 34 types

#### Documentation
- Marked `docs/CONTENT-AUDIT.md` as ✅ Complete
- All future content generation will include CTAs automatically

---

### Growth Cleanup: PDF Export & Content Audit

#### PDF Export UI
- Installed `jspdf` package
- Wired PDF button into QRStudio download step
- Connected existing `PDFOptionsModal` component
- Pro-tier gated (same as SVG export)
- Options: paper size, QR size, bleed, crop marks

#### ArticleCTA Component
- Registered in MDX components (`src/components/content/mdx/index.tsx`)
- Created `QR_TYPE_METADATA` in constants.tsx - single source of truth for all 34 QR types
- Redesigned component with polished styling:
  - Glow effects and gradients
  - Animated shine on hover
  - Scale animations on icons/buttons
  - Banner and inline variants

#### Content Audit: 34 QR Types
- Rewrote `learn/qr-basics/types-of-qr-codes.mdx` from 16 → 34 types
- Added 25+ strategic CTAs throughout the article
- Added missing types: LinkedIn, X, TikTok, Snapchat, Threads, YouTube, Pinterest, Spotify, Reddit, Twitch, Discord, Event, Geo, Google Review
- Created `docs/CONTENT-AUDIT.md` with prioritized audit plan:
  - P1: 4 foundation articles
  - P2: 33 use-case articles
  - P3: 20 industry articles
  - P4: 9 how-to blog posts

#### CTA Injection
- `blog/2026/share-wifi-password-qr-code.mdx` - Added inline + banner WiFi CTAs

---

## January 25, 2026 (Evening Session)

### Growth Roadmap Implementation (Sessions 1-10)
Implemented all 10 sessions from the Growth Roadmap in a single extended session.

#### Session 1: Referral Program
- Database migration: `20260125000001_add_referral_system.sql`
- Added `referral_code`, `referred_by`, `referral_credits` to profiles table
- Created `referrals` tracking table with RLS policies
- `src/lib/referrals/index.ts` - Server-side referral logic
- `src/lib/referrals/client.ts` - Client-side utilities (copy link, generate link)
- `src/components/dashboard/ReferralWidget.tsx` - Dashboard widget with copy link, stats
- Updated signup flow to track `?ref=CODE` parameter
- Stripe webhook credits referrer $5 when referee upgrades

#### Session 2: Onboarding Email Sequence
- Database migration: `20260125000002_add_onboarding_email_tracking.sql`
- Email templates: `OnboardingDay1.tsx`, `OnboardingDay3.tsx`, `OnboardingDay7.tsx`
- Cron endpoint: `/api/cron/onboarding-emails`
- Tracks sent emails to prevent duplicates

#### Session 3: 7-Day Stripe Trial (changed from 14-day database trial)
- Database migration: `20260125000003_add_trial_support.sql`
- **Stripe-based trial** (requires credit card, auto-converts)
- Updated `/api/stripe/checkout` to add `trial_period_days: 7` for Pro plan
- Webhook handles `trialing` status and `customer.subscription.trial_will_end` event
- `src/components/dashboard/TrialBanner.tsx` - Shows days remaining
- `src/components/dashboard/StartTrialPrompt.tsx` - "Start Free Trial" CTA (redirects to Stripe checkout)
- Updated `getEffectiveTier()` and `isTrialActive()` to handle Stripe trial status
- Pricing section shows "7-day free trial" badge on Pro tier

#### Session 4: Sentry Error Tracking (Prepared)
- Made Sentry imports conditional in `next.config.ts`
- Updated `error.tsx` and `global-error.tsx` error boundaries
- Ready to install: `npx @sentry/wizard@latest -i nextjs`

#### Session 5: Password Rate Limiting
- Created `src/lib/rate-limit.ts` with Redis (Upstash) + in-memory fallback
- Updated `/api/qr/verify-password` - 5 attempts per IP per 15 minutes
- Returns 429 Too Many Requests when limit exceeded

#### Session 6: Expanded Social Proof
- Expanded testimonials from 3 to 10 in `src/constants/homepage.tsx`
- Added trust badges to `TestimonialsSection.tsx`:
  - "500+ businesses"
  - "99.9% uptime"
  - "GDPR compliant"
  - "Privacy-first"

#### Session 7: Milestone Emails
- `src/emails/MilestoneEmail.tsx` - 50 scans, 5 QR codes celebration
- `src/emails/UsageLimitWarning.tsx` - 80% usage warning
- Cron endpoint: `/api/cron/milestone-emails`

#### Session 8: Print-Ready PDF Export (Code Only)
- Created `src/lib/qr/pdf-generator.ts` - PDF generation with crop marks, bleed, paper sizes
- Created `src/components/qr/PDFOptionsModal.tsx` - Options UI
- **TODO**: Install `jspdf`, add UI button to QR Studio

#### Session 9: Comparison Pages
- Created `src/lib/competitors.ts` - Competitor data (QR Code Monkey, QR Tiger, Beaconstac)
- Created `/vs/[competitor]/page.tsx` - Dynamic comparison pages
- Pages: `/vs/qr-code-monkey`, `/vs/qr-tiger`, `/vs/beaconstac`

#### Session 10: Content CTAs (Component Only)
- Created `src/components/content/ArticleCTA.tsx` - Inline and banner CTAs
- **TODO**: Add to top-traffic articles

#### Documentation
- Created `docs/GROWTH-IMPLEMENTATION-TODO.md` - Remaining tasks checklist
- Updated `docs/README.md` - Added link to TODO doc

---

## January 25, 2026

### Landing Page Background Modernization
- Complete visual refresh of all 19 landing page types with Apple/Notion-inspired minimalism
- Created shared component library (`src/components/landing/`):
  - `LandingBackground` - warm black base (#09090b), subtle accent glow, grain texture
  - `LandingCard` - refined glass effect (bg-white/[0.03], backdrop-blur-xl)
  - `LandingFooter` - consistent "Powered by QRWolf" footer
  - `LandingLoader` - standardized loading spinner
- Removed visual clutter: 3 animated floating orbs, aggressive dot patterns, accent-colored shadows
- Updated color palette from cold slate to warm zinc throughout
- Refined animations: cubic-bezier(0.16, 1, 0.3, 1) easing for smoother transitions
- Updated pages: event, social, location, business, links, coupon, gallery, menu, vcard, audio, video, pdf, text, wifi, youtube, spotify, review, unlock, landing

### Template Gallery
- 40 pre-designed QR code templates across 7 categories (Restaurant, Business, Marketing, Events, Social, Retail, Creative)
- Templates are style presets: pre-selected QR type + colors, patterns, gradients, and frames
- 13 free templates, 27 Pro templates with tier gating
- Gallery page at `/templates` with category filtering and search
- Template cards show live QR preview with template styling
- Pro upgrade modal for free users clicking Pro templates
- Creator integration: `/qr-codes/create?template=[id]` loads template
- Template banner in content step shows which template is being used
- New components: `TemplateCard`, `TemplateSearch`, `TemplateGallery`, `ProTemplateModal`
- Template data in `src/lib/templates/` with helper functions
- Added "Templates" link to PublicNav and Footer

### A/B Testing for Dynamic QR Codes
- New Pro+ feature for split-testing QR code destinations
- Database schema: `ab_tests`, `ab_variants`, `ab_assignments` tables with RLS policies
- Deterministic variant assignment using hash(test_id + ip_hash) - same visitor always sees same variant
- Configurable traffic split (10-90%) via slider in Options step
- Redirect route integration: checks for active A/B test and routes to selected variant
- Statistical significance calculations with 95% confidence threshold
- A/B Test Dashboard component (`src/components/analytics/ABTestDashboard.tsx`):
  - Variant comparison cards with scan counts and progress bars
  - Statistical confidence indicator with progress bar
  - Improvement percentage display (Variant B vs Control)
  - Pause/Resume/Start test actions
  - "Declare Winner" buttons when statistically significant
- Dedicated A/B test management page at `/qr-codes/[id]/ab-test`
- Link to A/B test management from QR code detail page
- TypeScript types and utilities in `src/lib/ab-testing/`:
  - `types.ts` - ABTest, ABVariant, ABAssignment interfaces
  - `variant-selector.ts` - deterministic selection algorithm
  - `statistics.ts` - z-test significance calculations
- Positions QRWolf as marketing-focused platform

## January 24, 2026

### Geo/Location QR Code Type
- New free-tier QR type for sharing map locations
- Coordinate input with latitude (-90 to 90) and longitude (-180 to 180) validation
- "Use my current location" button using browser Geolocation API
- Optional location name and address fields
- Accent color customization for landing page
- Landing page at `/r/[code]/location` with:
  - OpenStreetMap embed (works on production, placeholder on localhost)
  - "Get Directions" primary CTA (Google Maps directions)
  - "Open in Google Maps" button
  - "Open in Apple Maps" button
  - Coordinates and address display
- Fixed password-protected QR codes for landing page types (geo, event, etc.)
- 28th QR type (now 34 total content types)

### Event/Calendar QR Code Type
- New free-tier QR type for creating calendar event invites
- Event form with title, start/end dates, location, description, event URL, accent color
- All-day event toggle (switches between date and datetime pickers)
- Landing page at `/r/[code]/event` with glassmorphism design
- Calendar buttons: Add to Google Calendar, Apple Calendar (.ics), Outlook
- ICS file generation utility (`src/lib/calendar.ts`) for Apple/Outlook downloads
- Google Calendar URL generation with proper date formatting
- Outlook Web URL generation
- 27th QR type (now 33 total content types)

### Twitch QR Code Type
- New free-tier social QR type for sharing Twitch channels
- Username-based input with smart URL parsing (extracts from twitch.tv URLs)
- Direct redirect to `twitch.tv/username` (no landing page)
- Custom Twitch brand icon in type selector
- 27th QR type

### Discord QR Code Type
- New free-tier social QR type for sharing Discord server invites
- Invite code-based input with smart URL parsing
- Handles both `discord.gg/code` and `discord.com/invite/code` formats
- Direct redirect to `discord.gg/code` (no landing page)
- Custom Discord brand icon in type selector
- 28th QR type

### Spotify QR Code Type
- New free-tier QR type for sharing Spotify content
- Parses all Spotify URL formats and URI schemes (spotify:track:...)
- Supports tracks, albums, playlists, artists, podcasts (shows), and episodes
- Landing page at `/r/[code]/spotify` with embedded Spotify player
- Content type detection with visual badge (Track, Album, Playlist, etc.)
- Localhost fallback placeholder (Spotify embeds blocked on localhost)
- "Open in Spotify" CTA button
- 25th QR type

### Reddit QR Code Type
- New free-tier social QR type for Reddit profile and subreddit links
- Tab-based selection: User Profile (u/username) or Subreddit (r/subreddit)
- Smart URL parsing extracts username/subreddit from reddit.com URLs
- Direct redirect (no landing page) to `reddit.com/u/` or `reddit.com/r/`
- Added to Social category (now 13 social types total)
- 26th QR type

### QR Creator UX Improvements
- **Type selector**: Compact category buttons (4 columns on large screens), auto-scroll to type options when category selected
- **Gradient presets**: Now auto-set dark background (#0f172a) for proper contrast with colorful gradients
- **Gradient section**: Collapses when disabled for cleaner interface
- **Gradient tip**: Added info note explaining dark backgrounds work best with colorful gradients
- **Contrast checker**: Correctly calculates worst-case contrast for gradient colors vs background

---

## January 23, 2026

### QR Card Quick View & Download Options
- Quick View modal: click QR preview on cards to view larger scannable version (300px)
- Download options: PNG + SVG buttons on each card (replaces single download button)
- SVG download gated by Pro/Business tier (free users see "Pro" badge with link to /plans)
- Download buttons also available in Quick View modal footer
- Compact folder manager: redesigned from vertical list to horizontal chip/pill layout
- Removed "Dynamic" badge from QR cards (reduces visual clutter)

### YouTube QR Code Type
- New free-tier QR type for sharing YouTube videos
- Smart URL parsing handles all YouTube formats (youtube.com, youtu.be, shorts, embed, live, music, mobile)
- Landing page at `/r/[code]/youtube` with embedded video player
- Fetches video metadata (title, channel) via YouTube oEmbed API
- Thumbnail fallback for localhost development (embeds blocked on localhost)
- "Watch on YouTube" CTA button
- 23rd QR type

### Pinterest QR Code Type
- New free-tier social QR type for Pinterest profile links
- Username-based input with smart URL parsing (extracts username from pinterest.com URLs)
- Direct redirect to `https://pinterest.com/{username}` (no landing page needed)
- Added to Social category alongside other social platforms
- 24th QR type (11 social types total)

### Blog & Learn Search Bars
- Added search functionality to `/blog` and `/learn` pages
- Real-time filtering by title, description, and tags
- Search results show count and clear button
- Maintains category filters and featured sections when not searching

### Publish Date Removal
- Removed publish dates from article cards on blog/learn pages
- Dates were clustered (all generated within days) which could appear artificial
- Cards now show: category badge, reading time, title, description, tags

### Snapchat & Threads QR Code Types
- Two new free-tier social QR types for Snapchat and Threads profile links
- Username-based input with smart URL parsing
- Direct redirects: `https://snapchat.com/add/{username}` and `https://threads.net/@{username}`
- Added to Social category (now 9 social types total)
- Total QR types: 22 (was 20)

### TikTok QR Code Type
- New free-tier social QR type for TikTok profile links
- Username-based input with smart URL parsing (extracts username from tiktok.com URLs)
- Direct redirect to `https://tiktok.com/@{username}` (no landing page needed)
- Added to Social category alongside WhatsApp, Instagram, Facebook, LinkedIn, X

### X (Twitter) QR Code Type
- New free-tier social QR type for X (Twitter) profile links
- Username-based input with smart URL parsing (extracts username from x.com or twitter.com URLs)
- Direct redirect to `https://x.com/{username}` (no landing page needed)
- Added to Social category alongside WhatsApp, Instagram, Facebook, LinkedIn

### LinkedIn QR Code Type
- New free-tier social QR type for LinkedIn profile links
- Username-based input with smart URL parsing (extracts username from full LinkedIn URLs)
- Direct redirect to `https://linkedin.com/in/{username}` (no landing page needed)
- Added to Social category alongside WhatsApp, Instagram, Facebook
- Updated New QR Type skill with test file step

### SEO Content Expansion (to 135 articles)
- **8 new articles** added targeting high-value SEO keywords
- New blog posts: QR Code Generator for Business, Trends 2026, Best Practices Checklist, Product Labels, Trade Shows, Brochures, QR Code Monkey Alternative
- New learn article: QR Codes for Vehicle Wraps (use-cases)
- All articles written prose-first following quality guidelines
- Total content: 135 pieces (43 blog, 92 learn)
- Progress toward 150-piece target: 90% complete

### Mobile Optimization
- **Admin Area**: Added mobile hamburger menu with sliding drawer navigation
- **Admin Tables**: Hide non-essential columns on mobile (Status, QR Codes, Scans, Joined, Owner, Content, Device, Browser, etc.)
- **Admin Layout**: Responsive padding and margin to prevent sidebar overlap
- **Dashboard**: Mobile card layout for analytics scans table, responsive billing grid, stacked pagination
- **DashboardNav**: Max-width on dropdown to prevent overflow
- **Public Pages**: Responsive hero height and scaled background orbs across HeroSection, FinalCTASection, Tools, and Learn pages
- **Showcase Sections**: Responsive grid gaps on AnalyticsShowcase, BrandingShowcase, and CreativeDesign
- **StatsSection**: Responsive gap scaling
- **18 files updated** across admin, dashboard, and public areas

---

## January 22, 2026

### Google Reviews QR Type
- New free-tier QR type for collecting Google reviews
- Landing page with business name, 5-star visual, and "Leave a Google Review" CTA
- Place ID input with validation and help section
- Customizable accent color for landing page branding
- Created reusable New QR Type skill (`.claude/skills/qr-type/`)
- Total QR types: 17 (was 16)

### Homepage Modularization
- **94% reduction in page.tsx**: Refactored from 1,862 lines to 114 lines
- **22 new components** extracted for maintainability:
  - Constants: `src/constants/homepage.tsx` (FEATURES, FAQS, QR_TYPES, etc.)
  - Icons: `src/components/icons/index.tsx` (28 reusable SVG icons)
  - UI patterns: `src/components/homepage/ui.tsx`
  - 16 section components (Hero, Features, Pricing, FAQ, etc.)

### SEO Content Expansion (to 127 articles)
- 4 new articles: Blog (1), Use-cases (5), Technical (1)
- 3 articles rewritten to prose-first quality
- Quality audit: 77% GOOD, 18% MODERATE, 0% SEVERE

### QR Creator UX Improvements
- Fixed toggle button knobs moving outside track
- Background color picker always visible (moved outside gradient section)
- Updated all 8 color presets to 7:1+ contrast (Excellent)

### Contrast Checker Integration
- Shared contrast utilities (`src/lib/qr/contrast.ts`)
- Fixed bug where incomplete hex showed "Excellent" contrast
- New ContrastIndicator component in StyleStep

### Critical URL Handling Fixes
- URLs without protocols (e.g., `lumengrave.com`) caused download prompts
- Added `getAppUrl()` helper with validation
- Redirect route normalizes URLs missing protocol
- Save-time URL normalization via `normalizeContentUrls()`

---

## January 21, 2026

### Analytics Bug Fixes & Pro Dynamic QR Codes
- **Critical fix**: Missing `scan_limit_notified_at` column broke ALL QR redirects
- **Critical fix**: Missing `on_scan_created` trigger prevented scan count increments
- Pro/Business users now always get dynamic QR codes

### SEO Content Expansion
- 24 new articles across 3 batches
- Total: 26 blog posts, 61 learn articles (87 total)

### Content Quality Audit
- Full audit of all 97 articles for "bullet bloat"
- Results: 53% GOOD, 33% MODERATE, 14% SEVERE
- Created `.claude/skills/content/BULLET-BLOAT-AUDIT.md`

### Free QR Code Tools
- Tools Hub page at `/tools`
- Size Calculator (`/tools/size-calculator`)
- Contrast Checker (`/tools/contrast-checker`)
- QR Code Reader (`/tools/qr-reader`)

### Critical QR Download Bug Fix
- Downloads were checking `type === 'dynamic'` instead of `short_code`
- Now all QR codes with short_codes are trackable

---

## January 22, 2026 (earlier sessions)

### Critical System Audit & Fixes
- Root cause: QR codes saved with `type='static'` due to race condition
- Database remediation: Fixed 30 customer QR codes
- 11 critical bugs fixed across 10 files
- Tests updated: All 185 tests passing

### System Audit & Testing Improvement
- Fixed race condition with `userTierLoading` state
- Created WiFi, Text, vCard landing pages
- Added 26 new tests
- Total tests: 185 passing across 8 test suites

---

## January 20, 2026

### QR Pattern & Shape Customization
- Switched from `qrcode` to `qr-code-styling` library
- 6 module patterns: Square, Dots, Rounded, Extra Rounded, Classy, Classy Rounded
- 6 corner square styles, 6 corner dot styles
- Decorative frames with text support
- Pro feature tier gating

### QR Studio UX Polish & Bug Fixes
- Password protection bug fix (was storing plaintext)
- Sidebar step indicator fix
- StyleStep tab reorder: Colors → Pattern → Frame → Logo
- Save flow redesign: Hidden save button until final step
- PNG download fix (was saving SVG data as .png)
- Bulk Studio sync with QR Studio

### Creative Design Homepage Section
- New section showcasing Pro styling features
- Updated Pro plan features across 8 files

### Scan Limit Email Notifications
- Email when free/pro users hit monthly scan limit
- `ScanLimitReachedEmail` template

---

## January 19, 2026

### Superadmin Dashboard Overhaul
- User detail pages (`/admin/users/[id]`)
- QR code detail pages (`/admin/qr-codes/[id]`)
- Shared admin components
- Admin actions API (reset scans, update tier, disable QR)
- Data export API (CSV/JSON)

### Admin Financials Section
- MRR and ARR cards
- Revenue breakdown by tier

---

## January 18, 2026

### Branding Cleanup
- Replaced all "QRForge" references with "QRWolf"
- Enhanced Open Graph metadata with explicit images

### Analytics Charts
- Recharts library integration
- LineChart, PieChart, BarChart
- Date range filtering, CSV export

---

## January 17, 2026

### Development Environment & Data Protection
- Separate dev Supabase project (`qrwolf-dev`)
- Environment validation
- Safe admin client
- Jest test suite (159 tests)
- CI/CD with GitHub Actions

---

## December 30-31, 2025

### Dynamic QR Type Upgrades
- All 9 dynamic types with modern glassmorphism UI
- Phone mockup preview components

### Blog & Learn Knowledge Base
- Velite MDX content system
- `/learn` and `/blog` routes
- 12 initial articles

### API Launch Readiness
- Request counting
- Monthly limit enforcement (10,000/month)
- Per-minute rate limiting (60/min)
- Content validation for all 19 QR types

---

## December 29, 2025

### Code Modularization
- Created `src/components/qr/wizard/` directory
- Created `src/lib/constants/limits.ts`

### Email Branding System
- Resend integration
- React Email templates
- Supabase auth email templates

### URL Normalization
- `normalizeUrl()` utility function
- Fixed landing page URL issues

---

## December 28, 2025

### QR Wizard Polish
- Default colors: classic black on white
- QR code naming in Content step
- Logo upload functional
- Preview buttons for landing page types

### 5-Step Wizard Flow
- Type → Content → Style → Options → Download
- Options step with Pro features

### Save-Before-Download
- QR codes saved to database before download
- Real short_code URLs generated

### Feature Parity Audit
- Synced features across plans.ts and UI
- Updated all docs to qrwolf.com domain

---

## Earlier (December 2025)

### Core Features Built
- Next.js 15 app with TypeScript + Tailwind CSS v4
- QR generator with 16 content types
- Real-time preview with customization
- Authentication (Supabase + Google OAuth)
- Dashboard with stats
- Dynamic QR codes with redirects
- Scan tracking with geolocation
- Analytics dashboard
- Stripe integration (checkout, webhooks, portal)
- Admin dashboard
- Bulk QR generation
- API access (Business tier)
- Folder organization

### Launch
- Live at qrwolf.com (December 28, 2025)
- Railway deployment from `main` branch
- Custom domain configured
