# QRWolf Changelog

Session-by-session history of development work. Most recent first.

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
