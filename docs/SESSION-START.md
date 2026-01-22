# QRWolf - Session Start Guide

> **Last Updated**: January 21, 2026 (Content Quality Audit: 97 articles assessed, skill guidelines strengthened)
> **Status**: Live
> **Live URL**: https://qrwolf.com
> **Admin Dashboard**: https://qrwolf.com/admin (restricted to ideaswithben@gmail.com)

---

## ⚠️ CRITICAL: Development Safety

**Local development uses a SEPARATE database to protect customer data.**

```
Local dev → Dev Supabase (fxcvxomvkgioxwbwmbsy) ✅ Safe to experiment
Production → Prod Supabase (otdlggbhsmgqhsviazho) ⚠️ LIVE CUSTOMERS
```

**Before making any changes:**
```bash
npm run safety-check  # Verify dev environment (should show "SAFE")
npm run dev           # Start dev server on port 3322
```

See `docs/DEVELOPMENT.md` for full environment setup.

---

## ⚠️ CRITICAL: Branch Workflow

```
YOU ARE ON: develop (default)
PRODUCTION: main (DO NOT push directly)
```

**Before making any changes, verify:**
```bash
git branch        # Should show: * develop
git checkout develop   # If not on develop
git pull origin develop
```

**After finishing work:**
```bash
npm run precommit     # Run lint + type-check + test
git push origin develop
# Tell user: "Changes pushed to develop. Create PR to main to deploy."
```

**NEVER run:** `git push origin main`

See `docs/WORKFLOW.md` for full details.

---

## ⚠️ Testing Infrastructure

**159 tests** across 4 test suites ensure code quality:

| Suite | Tests | Coverage |
|-------|-------|----------|
| API Validation | 47 | URL validation, hex colors, content types, API keys |
| QR Generation | 58 | Content generation, WiFi, vCard, validation |
| Subscription Plans | 31 | Tier limits, features, scan limits |
| Environment Safety | 23 | Environment detection, safety blocks |

**Commands:**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
npm run precommit     # lint + type-check + test (before commits!)
```

See `docs/DEVELOPMENT.md` for test data factories and CI/CD info.

---

## Quick Context

QRWolf is a premium QR code generator with analytics and dynamic codes. Goal: passive income via SEO-driven traffic and recurring subscriptions.

## QR Code Types (16 Total)

### Basic Types (All Tiers)
| Type | Description | Output |
|------|-------------|--------|
| **URL** | Website link | Direct URL QR |
| **Text** | Plain text | Text QR |
| **WiFi** | WiFi credentials | WiFi connect QR |
| **vCard** | Contact card | vCard download |
| **Email** | Email with subject | mailto: link |
| **Phone** | Phone number | tel: link |
| **SMS** | SMS with message | sms: link |

### Simple URL Types (All Tiers)
| Type | Description | Output |
|------|-------------|--------|
| **WhatsApp** | WhatsApp chat link | wa.me link |
| **Facebook** | Facebook profile | facebook.com link |
| **Instagram** | Instagram profile | instagram.com link |
| **Apps** | App store links | Smart app redirect |

### File Upload Types (Pro+ Only)
| Type | Description | Landing Page |
|------|-------------|--------------|
| **PDF** | Hosted PDF | Viewer + download |
| **Images** | Image gallery | Lightbox gallery |
| **Video** | Video player | YouTube/Vimeo/upload |
| **MP3** | Audio player | Spotify/SoundCloud/upload |

### Landing Page Types (Pro+ Only)
| Type | Description | Landing Page |
|------|-------------|--------------|
| **Menu** | Restaurant menu | Categories + items |
| **Business** | Digital business card | vCard download |
| **Links** | Link list (Linktree-style) | Branded link page |
| **Coupon** | Promotional coupon | Coupon display + copy code |
| **Social** | Social media aggregator | Profile + social links |

**Landing Page Routes:**
- `/r/[code]/pdf` - PDF viewer
- `/r/[code]/gallery` - Image gallery
- `/r/[code]/video` - Video player
- `/r/[code]/audio` - Audio player
- `/r/[code]/menu` - Restaurant menu
- `/r/[code]/business` - Business card
- `/r/[code]/links` - Link list
- `/r/[code]/coupon` - Coupon display
- `/r/[code]/social` - Social profile

## Current Status

### Completed
- Next.js 15 app with TypeScript + Tailwind CSS v4
- **QR generator with 16 content types** (see QR Types section below)
- Real-time preview with style customization
- PNG and SVG downloads
- Full landing page with pricing, features, FAQ
- Authentication system (Supabase - email + Google OAuth ready)
- Protected dashboard with navigation
- **QR code creation and saving to database**
- **QR code list page with actions (edit, delete, download, copy link)**
- **Dashboard with real-time stats from database**
- Dynamic QR codes with short URL redirects (`/r/[code]`)
- **Scan tracking with geolocation (IP-API integration)**
- **Full analytics dashboard (Pro feature)**
- Database schema deployed to Supabase with RLS
- **Stripe integration complete** - checkout, webhooks, customer portal
- Billing UI with subscription details (status, renewal date, billing interval)
- **V2 UI Polish** - Dark navy theme with teal/cyan accents, enhanced glassmorphism
- **SEO Optimized** - Meta tags, OpenGraph, sitemap, robots.txt, JSON-LD structured data
- **Railway deployment** - Live at qrforge-production.up.railway.app
- **Scan limits** - Free: 100/mo, Pro: 10k/mo, Business: unlimited + usage bar
- **QR expiration dates** - Set expiry on dynamic QR codes (Pro+)
- **Password protection** - Require password to access QR destination (Pro+)
- **Branch workflow** - develop → PR → main (production)
- **Bulk QR generation** - CSV upload for batch creation (Business tier)
- **Bulk style customization** - Apply colors, logos, features to bulk batches
- **Bulk batch grouping** - Bulk-generated codes grouped separately in QR list
- **API access** - Full REST API with key management (Business tier)
- **Developer portal** - `/developers` page with API docs, key management, usage stats
- **Landing page enhancements** - Branding showcase, upgrade CTAs
- **Logo upload as Pro feature** - Dedicated card for logo upload (extracted from style editor)
- **Centralized plans page** - `/plans` page for all upgrade flows with billing cycle toggle
- **Subscription success page** - `/subscription/success` with confetti animation and feature summary
- **Custom Stripe checkout** - Branded payment form at `/checkout/[plan]` using Stripe Elements
- **Google OAuth** - Sign in with Google configured
- **Admin dashboard** - Site-wide metrics at `/admin` (users, QR codes, scans, revenue)
- **Simplified contact page** - Single email (hello@qrwolf.com) at `/contact`
- **On-brand QR defaults** - Default QR colors are teal on dark navy (not black on white)
- **QR Types Expansion** - Expanded from 7 to 16 QR code types with landing pages
- **QR Wizard Polish** (December 28, 2025):
  - Default colors changed to classic black on white
  - QR code naming in Content step (used for download filenames)
  - Logo upload functional in Style step (Pro+ feature)
  - Logo size slider (15-30%) when logo is uploaded
  - Preview buttons for landing page types (menu, business, links, coupon, social)
  - Mobile phone mockup preview showing final landing page
  - LogoUploader component for file uploads
  - Forms updated to use file uploads instead of URL inputs (Menu, Business, Coupon, Links, Social)
  - qr-media storage bucket created for file uploads
- **QR Wizard Options Step** (December 28, 2025):
  - 5-step wizard flow: Type → Content → Style → Options → Download
  - Options step with 3 Pro features:
    - Expiration Date - Set when QR code stops working
    - Password Protection - Require password to view content
    - Scheduled Activation - Set active from/until dates
  - On-brand teal/primary color scheme (no random colors)
  - Pro badges and upgrade CTAs for free users
  - Enabled options summary with badges
- **Save-Before-Download** (December 28, 2025):
  - QR codes saved to database before download (ensures proper tracking)
  - Real short_code URLs generated (no more preview URLs)
  - QR codes appear in dashboard after download
  - Anonymous users prompted to sign up before download
  - "Done" and "Create Another" buttons on download step
- **Feature Parity Audit** (December 28, 2025):
  - Synced advertised features across plans.ts, PricingSection, and Plans page
  - Removed "Custom domains" from Business tier (not yet implemented)
  - Removed "Webhook integrations" from Business tier (not yet implemented)
  - Added "Team members (up to 3)" to Business tier displays
  - Updated all docs to use qrwolf.com domain (was qrforge-production.up.railway.app)
  - Added SESSION-START.md cross-references to all documentation files
- **Code Modularization** (December 29, 2025):
  - Created `src/components/qr/wizard/` directory with step components:
    - `constants.tsx` - TYPE_CATEGORIES, COLOR_PRESETS, WIZARD_STEPS
    - `steps/TypeStep.tsx` - QR type selection step
    - `steps/StyleStep.tsx` - Style step with Colors | Logo tabs
    - `steps/OptionsStep.tsx` - Pro options (expiration, password, scheduling)
    - `steps/DownloadStep.tsx` - Save and download step
  - Created `src/lib/constants/limits.ts` - Centralized constants:
    - FILE_SIZE_LIMITS, ALLOWED_MIME_TYPES
    - VALIDATION_LIMITS, PAGINATION
    - RATE_LIMITS, SCAN_LIMITS, DYNAMIC_QR_LIMITS
  - Updated upload routes to use centralized constants
  - QRWizard.tsx now imports from wizard module (reduced duplication)
- **Email Branding System** (December 29, 2025):
  - Resend integration for transactional emails (`src/lib/email.ts`)
  - React Email templates with QRWolf branding (`src/emails/`):
    - `BaseLayout.tsx` - Branded email wrapper with dark navy/teal theme
    - `WelcomeEmail.tsx` - Welcome email for new signups
    - `TeamInviteEmail.tsx` - Team invitation emails
    - `SubscriptionConfirmEmail.tsx` - Subscription confirmation
    - `PaymentFailedEmail.tsx` - Payment failure notification
  - Supabase auth email templates (on-brand):
    - Confirmation, Magic Link, Password Reset, Email Change, Invite
    - Templates stored in `supabase/templates/*.html`
    - Config in `supabase/config.toml` for CLI push
  - Email integrations:
    - Auth callback sends welcome email on first login
    - Team invites route sends branded invite emails
    - Stripe webhook sends subscription/payment emails
  - Domain verified with Resend (DNS records: DKIM, SPF, MX)
- **URL Normalization** (December 29, 2025):
  - Added `normalizeUrl()` utility function (`src/lib/utils.ts`)
  - Ensures all user-input URLs have https:// protocol
  - Prevents relative URL issues in landing pages
  - Fixed landing pages:
    - `/r/[code]/links` - Links and social links
    - `/r/[code]/business` - Website URL
    - `/r/[code]/social` - Custom profile URLs
  - Also added `isValidUrl()` validation helper
- **API Launch Readiness** (December 30, 2025):
  - Request counting implemented (`incrementRequestCount()` in `src/lib/api/auth.ts`)
  - All API routes now track successful requests in database:
    - `request_count` - Total lifetime requests
    - `monthly_request_count` - Current month requests
    - `last_used_at` - Timestamp of last API call
  - Monthly limit enforcement (10,000 requests/month):
    - `validateApiKey()` checks `monthlyLimitExceeded`
    - Returns 429 with `X-RateLimit-Monthly-*` headers when exceeded
    - Auto-resets on 1st of each month
  - Per-minute rate limiting (60 requests/minute):
    - In-memory rate limiter per API key
    - Returns 429 with `Retry-After` header when exceeded
  - Content type validation for all 19 QR types:
    - `validateContent()` validates required fields per type
    - URL, text, wifi, vcard, email, phone, sms, whatsapp validated
    - File/landing page types have permissive validation
  - Business tier gating enforced on all API endpoints
- **Dynamic QR Type Upgrades** (December 30, 2025):
  - All 9 dynamic QR types upgraded with modern UI:
    - **Menu** - Glassmorphism design, floating orbs, staggered animations
    - **Links** - Linktree-style with social icons, link hover effects
    - **Business** - Professional card with vCard download, social links
    - **Social** - Platform-colored buttons, animated profile card
    - **Coupon** - Animated promo code copy, expiration badges
    - **Gallery** - Modern grid with zoom, lightbox with thumbnail strip
    - **PDF** - Document header card, embedded viewer with toolbar
    - **Video** - YouTube/Vimeo badging, floating orbs
    - **Audio** - Spotify/SoundCloud detection, vinyl-style cover art
  - Phone mockup preview components for all types:
    - `src/components/menu/MenuPreview.tsx`
    - `src/components/links/LinksPreview.tsx`
    - `src/components/business/BusinessPreview.tsx`
    - `src/components/social/SocialPreview.tsx`
    - `src/components/coupon/CouponPreview.tsx`
    - `src/components/gallery/GalleryPreview.tsx`
    - `src/components/pdf/PDFPreview.tsx`
    - `src/components/video/VideoPreview.tsx`
    - `src/components/audio/AudioPreview.tsx`
  - QRStudio shows live preview during content creation
  - Consistent design language across all landing pages:
    - Dark navy/teal theme with accent color support
    - Glassmorphism cards with `backdrop-blur-xl`
    - Floating orb decorations with `animate-pulse`
    - Dot pattern backgrounds
    - Staggered `animate-fade-in` and `animate-slide-up`
  - SocialLinksEditor component reused across Business, Links, Social types
- **Blog & Learn Knowledge Base** (December 30, 2025):
  - Velite MDX content system for static content generation
  - `/learn` - QR code knowledge base with 6 categories:
    - QR Basics, How It Works, Use Cases, Industries, Best Practices, Technical
  - `/learn/[slug]` - Individual wiki articles with TOC sidebar
  - `/learn/category/[category]` - Category listing pages
  - `/blog` - Blog listing with featured posts and category filters
  - `/blog/[slug]` - Individual blog posts with JSON-LD Article schema
  - `/blog/category/[category]` - Category-filtered blog posts
  - Blog accessible via "Latest from the Blog" section on /learn page
  - Content stored in `content/blog/` and `content/learn/` directories
  - MDX components: Callout, styled headings, tables, code blocks
  - Auto-generated table of contents with scroll-spy
  - Related articles section on each page
  - Dynamic sitemap includes all blog/learn pages
  - Initial content: 2 blog posts, 12 wiki articles (all 6 categories populated)
  - Components: ArticleCard, TableOfContents, LearnSidebar, MDXContent
  - SEO: Per-article metadata, JSON-LD schema, OpenGraph tags
- **Blog & Learn V2 UI Polish** (December 30, 2025):
  - Upgraded all 11 blog/learn pages and components to match V2 design language
  - ArticleCard: Shine effect on hover, gradient image overlay, scale/translate animations
  - Hub pages (learn/page.tsx, blog/page.tsx): Floating orbs, dot patterns, staggered animations
  - TableOfContents: Progress line with gradient, indicator dots, glass-heavy styling
  - LearnSidebar: Category icons in gradient boxes, vertical progress line, active badges
  - Article pages: Breadcrumb navigation, floating backgrounds, enhanced headers
  - MDX components: Enhanced typography, anchor links on headings, styled blockquotes/tables/code
  - Callout component: 5 variants (info, warning, tip, error, note) with icon boxes
  - RelatedArticles: Gradient divider, staggered card animations
  - Category pages: Consistent V2 styling with orbs and animations
  - Design patterns: Glassmorphism, `animate-slide-up` with 80ms delays, `hover:scale-[1.02]`
- **Learn Content Expansion** (December 31, 2025):
  - Added 7 new learn articles using content skill
  - All 6 categories now have 2+ articles (12 total):
    - `qr-basics/` - what-is-a-qr-code, static-vs-dynamic-qr-codes
    - `how-it-works/` - qr-code-error-correction, how-qr-code-scanning-works
    - `use-cases/` - restaurant-menu-qr-codes, business-card-qr-codes
    - `industries/` - qr-codes-for-retail, qr-codes-for-healthcare
    - `best-practices/` - qr-code-design-best-practices, qr-code-placement-guide
    - `technical/` - qr-code-data-capacity, qr-code-versions-explained
  - Each article includes Callout components, tables, internal links, CTAs
  - Proper relatedSlugs cross-linking between articles
- **Google OAuth Branding Fix** (December 31, 2025):
  - Domain verified in Google Search Console (DNS TXT record via Porkbun)
  - OAuth consent screen now shows "QRWolf" branding (was showing Supabase URL)
  - Submitted sitemap to Google Search Console: `https://qrwolf.com/sitemap.xml`
  - Cleaned up stale sitemaps from previous domain owner (2020/2023 data)
- **QR Codes Page V2 Upgrade** (December 31, 2025):
  - V2 UI polish: Floating orbs, dot patterns, gradient text, staggered animations
  - QRCodeCard: Shine effect, `hover:scale-[1.02] hover:-translate-y-1`, folder badge
  - BulkBatchCard: Enhanced hover states and animations
  - Stats cards with enhanced glassmorphism
  - Page background decorations matching V2 design language
- **Folder Organization** (December 31, 2025):
  - New `folders` table in Supabase for organizing QR codes
  - `folder_id` column added to `qr_codes` table
  - FolderManager component: Create, edit, delete folders with color coding
  - FolderModal component: Name input + 8 preset color options
  - QRFilters component: Search, type filter (grouped by category), status filter
  - Folder dropdown on QRCodeCard for quick folder assignment
  - Optimistic updates for instant UI feedback
  - Tier-gated: Free=0 folders, Pro=10 folders, Business=unlimited
  - API routes: `/api/folders`, `/api/folders/[id]`, `/api/qr/[id]/folder`
- **Plausible Analytics** (December 31, 2025):
  - Privacy-first website analytics (no cookie banner needed)
  - Custom script URL integration in layout.tsx
  - Environment variable: `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL`
  - Dashboard: https://plausible.io/qrwolf.com
- **Logo Upload UX Enhancement** (January 1, 2026):
  - StyleStep refactored with "Colors" | "Logo" tabs
  - LogoBestPractices component with 5 tips:
    - Recommended dimensions (300×300px+, square ratio)
    - Keep it simple (bold, minimal logos)
    - Square or circular shapes
    - High contrast (PNG with transparency)
    - Test before printing (2-3 phones/apps)
  - Clickable "Add a logo" pill under QR preview for discoverability
  - Best practices visible to all users (Pro and Free)
  - Applied to all QR builder variants:
    - QRWizard (create page)
    - BulkStudio (bulk page)
    - QRLogoUploader (edit page)
- **Image Optimization** (January 1, 2026):
  - Sharp library for server-side image processing
  - Media images (JPEG, PNG, WebP): Resize to max 2000px, convert to WebP, 80% quality
  - GIFs: Resize to max 2000px if needed, preserve animation
  - Logos (PNG, JPEG): Resize to max 500px, compress at 85% quality, keep original format
  - SVGs: Sanitization only (no image processing)
  - Typical 40-70% file size reduction
  - Graceful fallback to original if optimization fails
  - Server logs show compression ratio for monitoring
- **Development Environment & Data Protection** (January 17, 2026):
  - Separate dev Supabase project (`qrwolf-dev`) to protect customer data
  - Environment validation prevents dev connecting to production
  - Startup safety check (`npm run safety-check`)
  - Safe admin client blocks destructive operations in production
  - Jest test suite with 159 tests across 4 suites
  - Test data factories for consistent mock data
  - CI/CD with GitHub Actions (lint, type-check, test, build, security-check)
  - PR check workflow warns on migrations and env changes
- **SEO Content Strategy & Blog Expansion** (January 17, 2026):
  - Added 6 new articles: 2 blog posts + 4 learn articles
  - Blog: QR Code Tracking/ROI, WiFi QR Codes Complete Guide
  - Learn: Event Marketing, Product Packaging, Real Estate, QR vs Barcode
  - Created SEO-focused content plan (`.claude/skills/content/CONTENT-PLAN.md`)
  - 4-tier keyword priority system with search volume estimates
  - Mapped content to QRWolf features for conversion tracking
  - Prioritized backlog of 30+ planned articles
  - Total content now: 4 blog posts, 16 learn articles
- **Branding Cleanup & Link Sharing Metadata** (January 18, 2026):
  - Replaced all "QRForge" references with "QRWolf" across codebase
  - Updated package.json, supabase config, schema, docs, CSS comments
  - Enhanced Open Graph metadata with explicit image URLs (1200x630)
  - Updated opengraph-image.tsx to include QRWolf wolf logo
  - Added Twitter card metadata with explicit image references
  - Added icons metadata (favicon, apple-touch-icon) to layout.tsx
  - Added applicationName for better PWA/sharing support
  - Clean branded preview when sharing links via SMS/social media
- **Analytics Charts & Content Expansion** (January 18, 2026):
  - Added Recharts library for interactive analytics visualizations
  - LineChart for scans over time with date range filtering (7d/30d/All)
  - PieChart for device distribution breakdown
  - BarChart for top browsers horizontal view
  - Date range selector tabs for filtering analytics data
  - CSV export button for downloading scan data
  - New AnalyticsCharts client component with responsive design
  - Code cleanup: Removed deprecated QRWizard.tsx file
  - 4 new SEO content articles:
    - Learn: How WiFi QR Codes Work (how-it-works category)
    - Learn: QR Codes for Education (industries category)
    - Learn: QR Code Size Requirements (best-practices category)
    - Blog: QR Code Marketing Strategies for 2026
  - Total content now: 7 blog posts, 24 learn articles
- **Superadmin Dashboard Overhaul** (January 19, 2026):
  - Fixed admin access: Added `ADMIN_EMAIL` to env files, fixed `isAdmin()` usage in layout
  - User detail pages (`/admin/users/[id]`):
    - Full user profile with avatar, tier/status badges
    - Stats cards (QR codes, scans, monthly usage, member since)
    - Account details with Stripe customer link
    - User's QR codes table with drill-down links
    - Analytics charts (reusing AnalyticsCharts component)
  - QR code detail pages (`/admin/qr-codes/[id]`):
    - QR header with preview, type/content badges
    - Owner info with link to user detail
    - Full QR details (short code, destination, expiration, password, style)
    - Content data display and style settings
    - Paginated scan history table
    - Analytics section with charts
  - Shared admin components:
    - `AdminBreadcrumb.tsx` - Navigation breadcrumbs
    - `AdminDetailSection.tsx` - Key-value detail cards
    - `AdminTabs.tsx` - URL-based tab navigation
    - `AdminExportButton.tsx` - CSV/JSON export button
  - Admin actions API:
    - `/api/admin/users/[id]` - Reset scans, update tier/status
    - `/api/admin/qr-codes/[id]` - Reset scans, disable/enable, transfer ownership, delete
    - Audit logging table (`admin_audit_log`) for tracking admin actions
  - Data export API (`/api/admin/export`):
    - Export users, QR codes, or scans as CSV/JSON
    - Date range filtering for scans export
    - Export buttons added to Users, QR Codes, Analytics pages
  - Row links added to Users and QR Codes list pages for drill-down
- **Admin Financials Section** (January 19, 2026):
  - Added Financials section to `/admin` overview page
  - Monthly Revenue (MRR) with emerald gradient card
  - Yearly Projection (ARR) with primary gradient card
  - Revenue breakdown by tier (Pro × $9, Business × $29)
  - Link to detailed `/admin/subscriptions` page
- **SEO Content Expansion** (January 19, 2026):
  - Added 5 new learn articles across multiple categories and tiers:
    - `qr-code-for-pdf` (use-cases) - PDF sharing with 15+ use cases
    - `qr-code-not-scanning` (best-practices) - Troubleshooting 12 common issues
    - `qr-codes-for-hotels` (industries) - 15 hospitality use cases with ROI
    - `qr-codes-for-video` (use-cases) - Video marketing strategies
    - `qr-code-security` (technical) - Security risks and best practices
  - Total content now: 6 blog posts, 28 learn articles
- **QR Pattern & Shape Customization** (January 20, 2026):
  - Switched from `qrcode` library to `qr-code-styling` for advanced pattern support
  - 6 module patterns: Square, Dots, Rounded, Extra Rounded, Classy, Classy Rounded
  - 6 corner square styles with independent customization
  - 6 corner dot styles with linkable or independent control
  - Decorative frames with thickness, color, radius, and top/bottom text
  - PatternSelector, EyeStyleSelector, and FrameEditor components
  - StyleStep refactored with Pattern | Colors | Logo | Frame tabs
  - Pro feature tier gating (Square pattern free, all others Pro+)
  - Server-side generation support via JSDOM
  - Backward compatible: existing QR codes render identically
- **QR Studio UX Polish & Bug Fixes** (January 20, 2026):
  - **Password protection bug fix**: Was storing plaintext passwords instead of bcrypt hashes. Fixed `useQRStudioState.ts` to call `/api/qr/hash-password` before saving. Fixed `loadQRCode` to not populate password field with hash on edit.
  - **Sidebar step indicator fix**: Steps were incorrectly showing checkmarks for future uncompleted steps. Fixed `isStepComplete` logic to only mark steps complete if user has passed through them. Future steps now show step numbers instead of icons with dimmed styling.
  - **Removed duplicate UI elements**:
    - Removed duplicate "Create QR Code" title from sidebar (already in top nav)
    - Removed duplicate "+ New QR Code" button from /qr-codes page content (already in nav)
  - **Bulk Generate button visibility**: Now visible for all tiers with "Business" badge. Non-business users see upgrade CTA linking to /plans.
  - **StyleStep tab reorder**: Changed tab order to Colors → Pattern → Frame → Logo (Colors first as most commonly used). Made Colors the default active tab.
  - **Gradient section visibility**: Gradient color options now always visible but disabled/greyed out for non-Pro users with upgrade overlay.
  - **Durability & Border Space moved**: Moved from Colors tab to Options tab for better organization. Added "Default" badge when Border Space is at default value (2).
  - **Save flow redesign**: Hidden save button in create mode. Final step now shows "Save & Create QR Code" button, then reveals download options after save completes.
  - **Scroll to top on step change**: Added useEffect to scroll to top when navigating between wizard steps.
  - **PNG download fix**: Downloads were saving SVG data as .png (unopenable). Fixed by converting SVG to canvas then exporting as PNG blob.
  - **Frame preview padding**: Increased text padding in frame generator for better spacing.
  - **Bulk Studio sync with QR Studio**:
    - Both now share same `StyleStep` and `OptionsStep` components (updates apply to both)
    - Fixed default margin (was 4 in bulk, now 2 to match normal)
    - Added `activeUntil` support to bulk generator for full scheduling options
  - **Bulk upload error handling**: Improved format detection with helpful guidance:
    - Detects binary/Excel files: "Save as CSV or copy/paste directly"
    - Detects JSON format: "Use CSV format instead"
    - Detects URLs without names: "Each line needs a name AND URL"
    - Shows "How to fix" hints for all error types
    - Auto-skips header rows containing "name" and "url"
- **Creative Design Homepage Section** (January 20, 2026):
  - Added stunning "Creative Design" section to homepage showcasing Pro styling features
  - 2-panel visual showcase using actual QR code images (gradient dots, connected pattern)
  - Updated Branding Showcase section with real QR code images
  - Updated Pro plan features across 8 files with new creative features:
    - "Custom patterns & shapes", "Gradient colors", "Decorative frames"
  - Added features to JSON-LD structured data for SEO
- **Scan Limit Email Notifications** (January 20, 2026):
  - Email notification when free/pro users hit their monthly scan limit
  - `ScanLimitReachedEmail` template with congratulatory tone and upgrade CTAs
  - One notification per month (tracked via `scan_limit_notified_at` column)
  - Non-blocking async email send in scan redirect route
  - Migration: `20260120000001_add_scan_limit_notified.sql`
- **QR Code Default Margin Increase** (January 20, 2026):
  - Increased default quiet zone from 2 to 4 modules
  - Better visual spacing between QR code and artboard edge
  - Applied to all future QR codes (existing codes unaffected)
  - Updated in types.ts, generator.ts, server-generator.ts, useQRStudioState.ts
- **Analytics Bug Fixes & Pro Dynamic QR Codes** (January 21, 2026):
  - **Critical fix**: Missing `scan_limit_notified_at` column was causing ALL QR redirects to fail
  - **Critical fix**: Missing `on_scan_created` trigger was preventing scan counts from incrementing
  - Pro/Business users now always get dynamic QR codes (regardless of content type)
  - Added debug logging to redirect route for easier troubleshooting
  - Applied migrations directly to production database
  - Manually synced 20 QR codes with mismatched scan counts
  - Re-linked Supabase CLI to correct production project
- **SEO Content Expansion** (January 21, 2026):
  - Added 3 new blog posts:
    - How to Make a QR Code for a Link (high-intent "how to" keyword)
    - How to Print QR Codes: Size and Quality Guide
    - How to Create a QR Code for a Google Form
  - Added 6 new learn articles:
    - QR Code Size Guide (best-practices)
    - QR Codes for Gyms & Fitness (industries)
    - QR Codes for Nonprofits & Donations (industries)
    - Links QR Code / Linktree Alternative (use-cases)
    - QR Codes for App Downloads (use-cases)
    - QR Codes for Audio & Podcasts (use-cases)
  - Rewrote 4 articles to prose-first style (removing bullet bloat):
    - static-vs-dynamic-qr-codes.mdx
    - qr-codes-for-video.mdx
    - qr-codes-for-education.mdx
    - qr-codes-for-retail.mdx
  - Total content now: 14 blog posts, 37 learn articles
- **Google Search Appearance Improvements** (January 21, 2026):
  - New favicon.ico with proper sizing
  - Organization and WebSite JSON-LD schemas for sitelinks
  - Improved OpenGraph metadata
- **SEO Content Batch 3** (January 21, 2026):
  - QR Code Glossary: 50+ Terms You Should Know (qr-basics)
  - Types of QR Codes: Complete Guide to All 16 (qr-basics)
  - QR Code FAQs: 30 Common Questions Answered (qr-basics)
  - Best Free QR Code Generators in 2026 (blog - competitive piece)
  - Total content now: 17 blog posts, 46 learn articles (63 total)
- **SEO Content Expansion** (January 21, 2026):
  - 24 new articles created across 3 batches
  - Blog posts (9): Google Reviews, YouTube, Statistics 2026, LinkedIn, Spotify, Business Cards, Print Materials, TikTok, Google Docs
  - Use-cases (8): Text, Email, Phone, SMS QR codes, Facebook, Image Gallery
  - Industries (6): Restaurants Beyond Menus, Construction, Law Firms, Automotive, Travel & Tourism, Beauty Salons
  - Best-practices (2): How to Test QR Codes, How to Make QR Code Smaller
  - Technical (1): QR Code Colors & Contrast Guide
  - Total content now: 26 blog posts, 61 learn articles (87 total)
- **Content Quality Audit & Guidelines Update** (January 21, 2026):
  - Full audit of all 97 content articles for "bullet bloat" (outline-style writing)
  - Results: 53% GOOD, 33% MODERATE, 14% SEVERE (needs rewrite)
  - 11 articles identified for prose-first rewrites
  - Rewrote qr-codes-for-product-packaging.mdx as example
  - Created comprehensive audit report: `.claude/skills/content/BULLET-BLOAT-AUDIT.md`
  - Strengthened content skill with explicit anti-bullet-bloat guidelines:
    - Hard rules: max 20% bullets, prose-first for every H2
    - "Instant Fail Patterns" showing what NOT to do
    - Mandatory pre-submission bullet audit checklist
  - Total content: 28 blog posts, 69 learn articles (97 total)

### Planned Enhancements
- Webhooks for scan notifications
- Custom domain for short URLs

## Environment Setup

### Development (`.env.development.local`)
```
ENVIRONMENT=development
NEXT_PUBLIC_SUPABASE_URL=https://fxcvxomvkgioxwbwmbsy.supabase.co  # Dev database
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_test_...  # Test mode
NEXT_PUBLIC_APP_URL=http://localhost:3322
```

### Production (`.env.local` - used by Railway)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://otdlggbhsmgqhsviazho.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3322

# Stripe (configured)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_YEARLY=price_...

# Resend (email)
RESEND_API_KEY=re_...

# Plausible Analytics (optional)
NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL=https://plausible.io/js/pa-XXXXX.js
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page + JSON-LD + branding showcase
│   ├── layout.tsx                  # Root layout + meta tags
│   ├── sitemap.ts                  # Dynamic sitemap (includes blog/learn)
│   ├── robots.ts                   # Robots.txt config
│   ├── globals.css                 # Theme + custom CSS
│   ├── expired/page.tsx            # QR code expired page
│   ├── limit-reached/page.tsx      # Scan limit exceeded page
│   ├── not-active/page.tsx         # Scheduled QR not yet active
│   ├── blog/
│   │   ├── page.tsx                # Blog listing with featured posts
│   │   ├── [slug]/page.tsx         # Individual blog post
│   │   └── category/[category]/page.tsx # Category-filtered posts
│   ├── learn/
│   │   ├── page.tsx                # Knowledge base home + blog section
│   │   ├── [slug]/page.tsx         # Individual wiki article
│   │   └── category/[category]/page.tsx # Category listing
│   ├── (admin)/
│   │   ├── layout.tsx              # Admin layout with auth guard (uses isAdmin())
│   │   └── admin/
│   │       ├── page.tsx            # Admin overview dashboard
│   │       ├── users/
│   │       │   ├── page.tsx        # User list with drill-down links + export
│   │       │   └── [id]/page.tsx   # User detail page with QR codes + analytics
│   │       ├── qr-codes/
│   │       │   ├── page.tsx        # QR code list with drill-down links + export
│   │       │   └── [id]/page.tsx   # QR code detail page with scans + analytics
│   │       ├── analytics/page.tsx  # Site-wide scan analytics + export
│   │       └── subscriptions/page.tsx # Revenue tracking
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login (+ Google OAuth)
│   │   ├── signup/page.tsx         # Signup (+ Google OAuth)
│   │   └── callback/route.ts       # OAuth callback
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout
│   │   ├── dashboard/page.tsx      # Overview with real stats + usage bar
│   │   ├── qr-codes/page.tsx       # QR list with V2 UI, filters, folders
│   │   ├── qr-codes/QRCodesContent.tsx # Client component for filters/state
│   │   ├── qr-codes/new/page.tsx   # Create QR (with expiry/password/landing)
│   │   ├── qr-codes/[id]/page.tsx  # Edit QR (dynamic only)
│   │   ├── qr-codes/bulk/page.tsx  # Bulk QR generator (Business)
│   │   ├── analytics/page.tsx      # Full analytics dashboard
│   │   ├── developers/page.tsx     # API dashboard (Business)
│   │   ├── developers/docs/page.tsx # Interactive API documentation
│   │   ├── plans/page.tsx          # Centralized upgrade page
│   │   ├── subscription/success/page.tsx # Post-checkout success page
│   │   └── settings/page.tsx       # Settings + Billing
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts   # Create checkout session (legacy)
│   │   │   ├── create-subscription/route.ts  # SetupIntent for custom checkout
│   │   │   ├── finalize-subscription/route.ts # Complete subscription after payment
│   │   │   ├── webhook/route.ts    # Handle Stripe events
│   │   │   └── portal/route.ts     # Customer portal
│   │   ├── qr/
│   │   │   ├── verify-password/route.ts  # Password verification
│   │   │   ├── upload-logo/route.ts      # Logo upload to Supabase
│   │   │   ├── delete-logo/route.ts      # Logo deletion
│   │   │   ├── upload-media/route.ts     # Media upload for file types
│   │   │   └── hash-password/route.ts    # Password hashing
│   │   ├── folders/                # Folder management (Pro+)
│   │   │   ├── route.ts            # List/create folders
│   │   │   └── [id]/route.ts       # Get/update/delete folder
│   │   ├── api-keys/               # API key management
│   │   │   ├── route.ts            # Create/list keys
│   │   │   └── [id]/route.ts       # Revoke key
│   │   ├── admin/                  # Admin API endpoints
│   │   │   ├── users/[id]/route.ts # Admin user actions (reset scans, update tier/status)
│   │   │   ├── qr-codes/[id]/route.ts # Admin QR actions (reset, disable, transfer, delete)
│   │   │   └── export/route.ts     # Data export (users, qr-codes, scans as CSV/JSON)
│   │   └── v1/                     # Public REST API (Business)
│   │       └── qr-codes/
│   │           ├── route.ts        # List/create QR codes
│   │           └── [id]/
│   │               ├── route.ts    # Get/update/delete QR code
│   │               └── image/route.ts  # Generate QR image
│   ├── checkout/
│   │   └── [plan]/page.tsx         # Custom Stripe Elements checkout
│   ├── contact/page.tsx            # Contact page (hello@qrwolf.com)
│   └── r/[code]/
│       ├── route.ts                # Dynamic QR redirect + tracking
│       ├── landing/page.tsx        # Custom branded landing page
│       ├── unlock/page.tsx         # Password entry page
│       ├── pdf/page.tsx            # PDF viewer landing
│       ├── gallery/page.tsx        # Image gallery landing
│       ├── video/page.tsx          # Video player landing
│       ├── audio/page.tsx          # Audio player landing
│       ├── menu/page.tsx           # Restaurant menu landing
│       ├── business/page.tsx       # Business card landing
│       ├── links/page.tsx          # Links list landing
│       ├── coupon/page.tsx         # Coupon display landing
│       └── social/page.tsx         # Social profile landing
├── components/
│   ├── admin/
│   │   ├── AdminNav.tsx            # Admin sidebar navigation
│   │   ├── AdminStatsCard.tsx      # Reusable stats card
│   │   ├── AdminBreadcrumb.tsx     # Breadcrumb navigation for detail pages
│   │   ├── AdminDetailSection.tsx  # Key-value detail section cards
│   │   ├── AdminTabs.tsx           # URL-based tab navigation
│   │   └── AdminExportButton.tsx   # CSV/JSON export button with format selector
│   ├── ui/                         # shadcn components
│   ├── qr/
│   │   ├── QRGenerator.tsx         # QR generation form (homepage)
│   │   ├── QRCodeCard.tsx          # QR list item with actions + folder dropdown
│   │   ├── QRStyleEditor.tsx       # Color/preset customization
│   │   ├── QRLogoUploader.tsx      # Logo upload (Pro feature) + best practices
│   │   ├── LogoBestPractices.tsx   # Logo upload best practices guide
│   │   ├── QRTypeSelector.tsx      # Categorized type selector with Pro badges
│   │   ├── QRWizard.tsx            # 5-step QR creation wizard (Type→Content→Style→Options→Download)
│   │   ├── QRFilters.tsx           # Search, type filter, status filter, folder filter
│   │   ├── FolderManager.tsx       # Folder list sidebar (Pro+ feature)
│   │   ├── FolderModal.tsx         # Create/edit folder dialog
│   │   ├── LogoUploader.tsx        # Single image upload component for logos/avatars
│   │   ├── MediaUploader.tsx       # File upload component for media types
│   │   ├── BulkBatchCard.tsx       # Expandable bulk batch display
│   │   └── forms/                  # Type-specific form components
│   │       ├── WhatsAppForm.tsx    # WhatsApp content form
│   │       ├── FacebookForm.tsx    # Facebook content form
│   │       ├── InstagramForm.tsx   # Instagram content form
│   │       ├── AppsForm.tsx        # Apps content form
│   │       ├── PDFForm.tsx         # PDF upload form
│   │       ├── ImagesForm.tsx      # Images upload form
│   │       ├── VideoForm.tsx       # Video upload/embed form
│   │       ├── MP3Form.tsx         # Audio upload/embed form
│   │       ├── MenuForm.tsx        # Menu builder form
│   │       ├── BusinessForm.tsx    # Business card form
│   │       ├── LinksForm.tsx       # Links list form
│   │       ├── CouponForm.tsx      # Coupon form
│   │       ├── SocialForm.tsx      # Social profile form
│   │       └── SocialLinksEditor.tsx # Reusable social links editor
│   ├── dashboard/
│   │   └── DashboardNav.tsx        # Nav with tier-aware profile dropdown
│   ├── menu/
│   │   └── MenuPreview.tsx         # Phone mockup preview for menu
│   ├── links/
│   │   └── LinksPreview.tsx        # Phone mockup preview for links
│   ├── business/
│   │   └── BusinessPreview.tsx     # Phone mockup preview for business card
│   ├── social/
│   │   └── SocialPreview.tsx       # Phone mockup preview for social profile
│   ├── coupon/
│   │   └── CouponPreview.tsx       # Phone mockup preview for coupon
│   ├── gallery/
│   │   └── GalleryPreview.tsx      # Phone mockup preview for gallery
│   ├── pdf/
│   │   └── PDFPreview.tsx          # Phone mockup preview for PDF
│   ├── video/
│   │   └── VideoPreview.tsx        # Phone mockup preview for video
│   ├── audio/
│   │   └── AudioPreview.tsx        # Phone mockup preview for audio
│   ├── analytics/
│   │   └── AnalyticsCharts.tsx     # Recharts (Line/Pie/Bar) with date range + CSV export
│   ├── content/                    # Blog/Learn content components
│   │   ├── ArticleCard.tsx         # Card for article listings
│   │   ├── TableOfContents.tsx     # Sticky TOC with scroll-spy
│   │   ├── LearnSidebar.tsx        # Category tree navigation
│   │   ├── RelatedArticles.tsx     # Related content section
│   │   ├── MDXContent.tsx          # Client-side MDX renderer
│   │   └── mdx/                    # MDX component overrides
│   │       ├── index.tsx           # Component exports
│   │       └── Callout.tsx         # Info/warning/tip callouts
│   ├── pricing/                    # PricingSection component
│   └── billing/                    # BillingSection component
├── content/                        # MDX content (Velite)
│   ├── blog/                       # Blog posts by year
│   │   └── 2025/*.mdx
│   └── learn/                      # Wiki articles by category
│       ├── qr-basics/*.mdx
│       ├── how-it-works/*.mdx
│       ├── use-cases/*.mdx
│       ├── industries/*.mdx
│       ├── best-practices/*.mdx
│       └── technical/*.mdx
├── hooks/
│   └── useStripe.ts                # Checkout & portal hooks
├── lib/
│   ├── qr/                         # QR generation
│   ├── supabase/                   # Supabase clients
│   ├── stripe/                     # Stripe config (with SCAN_LIMITS)
│   ├── api/                        # API authentication helpers
│   ├── content/
│   │   └── utils.ts                # Content helpers (formatDate, categories)
│   ├── email.ts                    # Resend email sending utility
│   ├── utils.ts                    # Utilities (cn, normalizeUrl, isValidUrl)
│   ├── constants/
│   │   └── limits.ts               # Centralized limits and constants
│   └── admin/
│       └── auth.ts                 # Admin auth (ADMIN_EMAIL, createAdminClient)
├── emails/                         # React Email templates
│   ├── BaseLayout.tsx              # Branded email wrapper
│   ├── WelcomeEmail.tsx            # New user welcome
│   ├── TeamInviteEmail.tsx         # Team invitation
│   ├── SubscriptionConfirmEmail.tsx # Subscription confirmation
│   ├── PaymentFailedEmail.tsx      # Payment failure alert
│   └── ScanLimitReachedEmail.tsx   # Scan limit notification
└── middleware.ts                   # Auth protection
```

## Analytics Features

The analytics dashboard (`/analytics`) includes:
- Total scans with trend indicators
- Unique visitors count
- Scans today
- Top country
- Time period breakdowns (This Week, This Month, Avg Daily)
- **Interactive Charts (Recharts)**:
  - LineChart for scans over time
  - PieChart for device distribution
  - BarChart for browser breakdown
  - Date range selector (7 Days / 30 Days / All Time)
  - CSV export button for data download
- Top QR codes by scan count
- Device type breakdown (mobile/desktop/tablet)
- Browser breakdown (Chrome/Safari/Firefox/Edge)
- Country/city breakdown (Pro feature indicator)
- Recent scans table with location data

## Geolocation Tracking

Scan tracking in `/r/[code]/route.ts`:
- Uses IP-API (free tier: 45 requests/minute)
- Captures: country, city, region
- Skips private/local IPs
- 2-second timeout (non-blocking)
- Stores in `scans` table

## SEO Configuration

**Files:**
- `src/app/layout.tsx` - Comprehensive meta tags, OpenGraph, Twitter cards
- `src/app/sitemap.ts` - Auto-generated sitemap at `/sitemap.xml` (includes blog/learn)
- `src/app/robots.ts` - Search engine rules at `/robots.txt`
- `src/app/page.tsx` - JSON-LD structured data (WebApplication schema)
- `src/app/blog/[slug]/page.tsx` - JSON-LD Article schema for blog posts
- `src/app/learn/[slug]/page.tsx` - JSON-LD Article schema for wiki articles

**Keywords targeted:**
- qr code generator, free qr code, qr code maker
- dynamic qr code, qr code tracking, qr code analytics
- wifi qr code, menu qr code, vcard qr code
- restaurant qr code, business qr code, digital business card qr
- whatsapp qr code, instagram qr code, facebook qr code
- pdf qr code, video qr code, linktree alternative qr
- coupon qr code, social media qr code
- what is a qr code, how qr codes work, qr code history
- static vs dynamic qr code, qr code best practices

**Google Search Console:** Configured
- Domain verified via DNS TXT record (Porkbun)
- Sitemap submitted: `https://qrwolf.com/sitemap.xml`
- URL: https://search.google.com/search-console (property: qrwolf.com)

## Database (Supabase)

**Tables deployed:**
- `profiles` - User profiles with subscription_tier, stripe_customer_id, subscription_status, **monthly_scan_count**, **scan_count_reset_at**, **scan_limit_notified_at**
- `qr_codes` - QR codes with content, style, short_code, scan_count, **expires_at**, **password_hash**, **active_from**, **active_until**, **show_landing_page**, **landing_page_title/description/button_text/theme**, **bulk_batch_id**, **media_files**, **folder_id**
- `folders` - QR code organization (user_id, name, color) - Pro+ feature
- `scans` - Scan analytics (device_type, os, browser, country, city, region, referrer)
- `api_keys` - API keys for Business tier:
  - `key_hash` - SHA-256 hash of API key
  - `key_prefix` - First 8 chars for identification
  - `request_count` - Total lifetime requests
  - `monthly_request_count` - Current month requests (auto-resets)
  - `monthly_reset_at` - When monthly counter resets
  - `last_used_at` - Timestamp of last use
  - `expires_at` - Optional expiration date
  - `ip_whitelist` - Optional IP restrictions
  - `permissions` - Granted permissions array
- `teams` - Team management for Business tier
- `team_members` - Team membership with roles
- `team_invites` - Pending team invitations
- `admin_audit_log` - Admin action audit trail (admin_id, action_type, target_type, target_id, details)

**Storage buckets:**
- `qr-logos` - Logo uploads for QR code branding
- `qr-media` - Media files for file upload types (PDF, images, video, audio)

**QR Types constraint:**
```sql
content_type IN (
  'url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms',
  'whatsapp', 'facebook', 'instagram', 'apps',
  'pdf', 'images', 'video', 'mp3',
  'menu', 'business', 'links', 'coupon', 'social'
)
```

RLS policies active. Trigger auto-creates profile on signup. Trigger auto-increments monthly_scan_count on scan.

## Key Commands

```bash
cd /Users/bentyson/QRForge
npm run dev               # Dev server on port 3322
npm run build             # Production build
railway status            # Check Railway deployment
railway logs              # View deployment logs
```

## Local Development with Stripe

For webhook testing, run Stripe CLI in a separate terminal:
```bash
stripe listen --forward-to localhost:3322/api/stripe/webhook
```

Test card: `4242 4242 4242 4242` (any future expiry, any CVC)

## Business Model

| Tier | Price | Dynamic QRs | Analytics | Features |
|------|-------|-------------|-----------|----------|
| Free | $0 | 0 | No | Basic 11 QR types (URL, Text, WiFi, vCard, Email, Phone, SMS, WhatsApp, Facebook, Instagram, Apps) |
| Pro | $9/mo | 50 | Yes | All 16 QR types, Logo upload, File uploads (PDF/Images/Video/MP3), Landing pages (Menu/Business/Links/Coupon/Social), Expiration, Password protection |
| Business | $29/mo | Unlimited | Yes | All Pro + Bulk generation, API access (10k requests/mo, 60/min), Team management |

## Revenue Mechanics

Dynamic QR codes are the key lock-in:
- User prints QR code on menus/cards/materials
- QR points to our short URL (qrwolf.com/r/abc123)
- We redirect to their destination
- User CAN'T churn without reprinting all materials

## User Journey (Complete)

1. **Create** - Generate QR code with customization
2. **Save** - Store in database with metadata
3. **View** - See all QR codes in list view
4. **Manage** - Edit destination, delete, download
5. **Track** - View analytics and scan data

## Subscription Flow

1. User clicks any "Upgrade" button across the app
2. Redirected to `/plans` page (centralized upgrade hub)
3. User sees current plan, all features, and monthly/yearly toggle
4. User selects plan and clicks "Upgrade"
5. Redirected to Stripe Checkout
6. User completes payment
7. Stripe webhook fires `checkout.session.completed`
8. Webhook updates `profiles.subscription_tier` and `subscription_status`
9. User redirected to `/subscription/success` with confetti celebration
10. Success page shows unlocked features and CTA to create QR codes
11. Settings page shows subscription details (status, billing cycle, renewal date)
12. "Manage Subscription" button opens Stripe Customer Portal

---

## Launch Status

**Current:** Live at https://qrwolf.com

**Production Configuration:**
- Railway deploys from `main` branch
- Stripe in live mode with production webhook
- Supabase auth URLs configured for qrwolf.com
- Google OAuth enabled
- Custom domain DNS configured

**Admin Access:**
- URL: https://qrwolf.com/admin
- Restricted to: ideaswithben@gmail.com (set via `ADMIN_EMAIL` env var)
- Features:
  - Dashboard overview with site-wide metrics
  - User list with drill-down to user detail pages
  - QR code list with drill-down to QR detail pages
  - Site-wide scan analytics with charts
  - Revenue/subscription tracking
  - Admin actions (reset scans, update tiers, disable QRs, transfer ownership)
  - Data export (users, QR codes, scans as CSV/JSON)
  - Audit logging for admin actions

**See Also:**
- `docs/WORKFLOW.md` - Branch workflow (develop → main)
- `docs/DEVELOPMENT.md` - Dev environment, testing, CI/CD
- `docs/DEPLOYMENT.md` - Railway deployment guide
- `docs/LAUNCH-CHECKLIST.md` - Full launch checklist
- `docs/STRIPE-SETUP.md` - Stripe configuration
- `docs/AGENT-WORKFLOW.md` - Universal agent workflow rules
- `docs/SUPABASE-EMAIL-TEMPLATES.md` - Supabase auth email templates
- `docs/FEATURE-ROADMAP.md` - **Feature build-out plan with 25 prioritized features**
- `.claude/skills/content/CONTENT-PLAN.md` - **SEO content plan (85 planned articles)**

---

**Quick Start:**
```bash
cd /Users/bentyson/QRForge
git checkout develop      # Ensure on develop branch
git pull origin develop   # Get latest
npm run dev               # Dev server on port 3322
# Visit http://localhost:3322
```

---

## Future Roadmap

### New QR Types (Planned)
| Type | Description | Tier |
|------|-------------|------|
| **Event** | Event name, date/time, location, iCalendar export, RSVP link | Pro+ |
| **Geo** | GPS coordinates, map link | Free |
| **Calendar** | Add to calendar (iCalendar format) | Free |
| **Bluetooth** | Bluetooth pairing | Free |

### QR Technology Enhancements (Planned)
- **Logo background styles** - Circle, square, rounded, transparent

### SEO & Content (Ongoing)
- Current: 28 blog posts, 69 learn articles (97 total)
- Target: 50 blog posts, 100 learn articles (150 total)
- Remaining: ~53 articles to reach target
- **Quality audit completed**: 11 articles flagged for prose-first rewrites
- See `.claude/skills/content/CONTENT-PLAN.md` for expansion plan
- See `.claude/skills/content/BULLET-BLOAT-AUDIT.md` for quality audit results
- Add FAQ schema to knowledge base pages
