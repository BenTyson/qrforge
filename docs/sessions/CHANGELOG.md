# QRWolf Changelog

Session-by-session history of development work. Most recent first.

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
