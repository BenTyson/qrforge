# QRWolf - Session Start Guide

> **Last Updated**: December 29, 2025 (Email Branding + URL Normalization)
> **Status**: Live
> **Live URL**: https://qrwolf.com
> **Admin Dashboard**: https://qrwolf.com/admin (restricted to ideaswithben@gmail.com)

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
git push origin develop
# Tell user: "Changes pushed to develop. Create PR to main to deploy."
```

**NEVER run:** `git push origin main`

See `docs/WORKFLOW.md` for full details.

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
    - `steps/StyleStep.tsx` - Style customization step
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

### Planned Enhancements
- QR code folders/organization
- Email scan alerts
- Webhooks for scan notifications
- Custom domain for short URLs

## Environment Setup

`.env.local` is fully configured:
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
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page + JSON-LD + branding showcase
│   ├── layout.tsx                  # Root layout + meta tags
│   ├── sitemap.ts                  # Dynamic sitemap
│   ├── robots.ts                   # Robots.txt config
│   ├── globals.css                 # Theme + custom CSS
│   ├── expired/page.tsx            # QR code expired page
│   ├── limit-reached/page.tsx      # Scan limit exceeded page
│   ├── not-active/page.tsx         # Scheduled QR not yet active
│   ├── (admin)/
│   │   ├── layout.tsx              # Admin layout with auth guard
│   │   └── admin/
│   │       ├── page.tsx            # Admin overview dashboard
│   │       ├── users/page.tsx      # User management
│   │       ├── qr-codes/page.tsx   # All QR codes site-wide
│   │       ├── analytics/page.tsx  # Site-wide scan analytics
│   │       └── subscriptions/page.tsx # Revenue tracking
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login (+ Google OAuth)
│   │   ├── signup/page.tsx         # Signup (+ Google OAuth)
│   │   └── callback/route.ts       # OAuth callback
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout
│   │   ├── dashboard/page.tsx      # Overview with real stats + usage bar
│   │   ├── qr-codes/page.tsx       # QR list with bulk batch grouping
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
│   │   ├── api-keys/               # API key management
│   │   │   ├── route.ts            # Create/list keys
│   │   │   └── [id]/route.ts       # Revoke key
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
│   │   └── AdminStatsCard.tsx      # Reusable stats card
│   ├── ui/                         # shadcn components
│   ├── qr/
│   │   ├── QRGenerator.tsx         # QR generation form (homepage)
│   │   ├── QRCodeCard.tsx          # QR list item with actions
│   │   ├── QRStyleEditor.tsx       # Color/preset customization
│   │   ├── QRLogoUploader.tsx      # Logo upload (Pro feature)
│   │   ├── QRTypeSelector.tsx      # Categorized type selector with Pro badges
│   │   ├── QRWizard.tsx            # 5-step QR creation wizard (Type→Content→Style→Options→Download)
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
│   │       └── SocialForm.tsx      # Social profile form
│   ├── dashboard/
│   │   └── DashboardNav.tsx        # Nav with tier-aware profile dropdown
│   ├── pricing/                    # PricingSection component
│   └── billing/                    # BillingSection component
├── hooks/
│   └── useStripe.ts                # Checkout & portal hooks
├── lib/
│   ├── qr/                         # QR generation
│   ├── supabase/                   # Supabase clients
│   ├── stripe/                     # Stripe config (with SCAN_LIMITS)
│   ├── api/                        # API authentication helpers
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
│   └── PaymentFailedEmail.tsx      # Payment failure alert
└── middleware.ts                   # Auth protection
```

## Analytics Features

The analytics dashboard (`/analytics`) includes:
- Total scans with trend indicators
- Unique visitors count
- Scans today
- Top country
- Time period breakdowns (This Week, This Month, Avg Daily)
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
- `src/app/sitemap.ts` - Auto-generated sitemap at `/sitemap.xml`
- `src/app/robots.ts` - Search engine rules at `/robots.txt`
- `src/app/page.tsx` - JSON-LD structured data (WebApplication schema)

**Keywords targeted:**
- qr code generator, free qr code, qr code maker
- dynamic qr code, qr code tracking, qr code analytics
- wifi qr code, menu qr code, vcard qr code
- restaurant qr code, business qr code, digital business card qr
- whatsapp qr code, instagram qr code, facebook qr code
- pdf qr code, video qr code, linktree alternative qr
- coupon qr code, social media qr code

**To enable Google Search Console:**
1. Add verification meta tag to `layout.tsx` verification object
2. Submit sitemap URL: `https://yourdomain.com/sitemap.xml`

## Database (Supabase)

**Tables deployed:**
- `profiles` - User profiles with subscription_tier, stripe_customer_id, subscription_status, **monthly_scan_count**, **scan_count_reset_at**
- `qr_codes` - QR codes with content, style, short_code, scan_count, **expires_at**, **password_hash**, **active_from**, **active_until**, **show_landing_page**, **landing_page_title/description/button_text/theme**, **bulk_batch_id**, **media_files**
- `scans` - Scan analytics (device_type, os, browser, country, city, region, referrer)
- `api_keys` - API keys for Business tier (hashed keys, last_used_at)
- `teams` - Team management for Business tier
- `team_members` - Team membership with roles
- `team_invites` - Pending team invitations

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
| Business | $29/mo | Unlimited | Yes | All Pro + Bulk generation, API access, Team management |

## Revenue Mechanics

Dynamic QR codes are the key lock-in:
- User prints QR code on menus/cards/materials
- QR points to our short URL (qrforge.com/r/abc123)
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
- Restricted to: ideaswithben@gmail.com
- Features: User management, site-wide analytics, revenue tracking

**See Also:**
- `docs/WORKFLOW.md` - Branch workflow (develop → main)
- `docs/DEPLOYMENT.md` - Railway deployment guide
- `docs/LAUNCH-CHECKLIST.md` - Full launch checklist
- `docs/STRIPE-SETUP.md` - Stripe configuration
- `docs/AGENT-WORKFLOW.md` - Universal agent workflow rules
- `docs/SUPABASE-EMAIL-TEMPLATES.md` - Supabase auth email templates

---

**Quick Start:**
```bash
cd /Users/bentyson/QRForge
git checkout develop      # Ensure on develop branch
git pull origin develop   # Get latest
npm run dev               # Dev server on port 3322
# Visit http://localhost:3322
```
