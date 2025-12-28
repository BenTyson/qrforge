# QRForge - Session Start Guide

> **Last Updated**: December 28, 2024
> **Status**: Pre-Launch - Pending Stripe Live Mode
> **Live URL**: https://qrforge-production.up.railway.app

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

QRForge is a premium QR code generator with analytics and dynamic codes. Goal: passive income via SEO-driven traffic and recurring subscriptions.

## Current Status

### Completed
- Next.js 15 app with TypeScript + Tailwind CSS v4
- QR generator with 7 content types (URL, Text, WiFi, vCard, Email, Phone, SMS)
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
│   │   │   ├── checkout/route.ts   # Create checkout session
│   │   │   ├── webhook/route.ts    # Handle Stripe events
│   │   │   └── portal/route.ts     # Customer portal
│   │   ├── qr/
│   │   │   ├── verify-password/route.ts  # Password verification
│   │   │   ├── upload-logo/route.ts      # Logo upload to Supabase
│   │   │   └── delete-logo/route.ts      # Logo deletion
│   │   ├── api-keys/               # API key management
│   │   │   ├── route.ts            # Create/list keys
│   │   │   └── [id]/route.ts       # Revoke key
│   │   └── v1/                     # Public REST API (Business)
│   │       └── qr-codes/
│   │           ├── route.ts        # List/create QR codes
│   │           └── [id]/
│   │               ├── route.ts    # Get/update/delete QR code
│   │               └── image/route.ts  # Generate QR image
│   └── r/[code]/
│       ├── route.ts                # Dynamic QR redirect + tracking
│       ├── landing/page.tsx        # Custom landing page
│       └── unlock/page.tsx         # Password entry page
├── components/
│   ├── ui/                         # shadcn components
│   ├── qr/
│   │   ├── QRGenerator.tsx         # QR generation form (homepage)
│   │   ├── QRCodeCard.tsx          # QR list item with actions
│   │   ├── QRStyleEditor.tsx       # Color/preset customization
│   │   ├── QRLogoUploader.tsx      # Logo upload (Pro feature)
│   │   └── BulkBatchCard.tsx       # Expandable bulk batch display
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
│   └── api/                        # API authentication helpers
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
- restaurant qr code, business qr code

**To enable Google Search Console:**
1. Add verification meta tag to `layout.tsx` verification object
2. Submit sitemap URL: `https://yourdomain.com/sitemap.xml`

## Database (Supabase)

Tables deployed:
- `profiles` - User profiles with subscription_tier, stripe_customer_id, subscription_status, **monthly_scan_count**, **scan_count_reset_at**
- `qr_codes` - QR codes with content, style, short_code, scan_count, **expires_at**, **password_hash**, **active_from**, **active_until**, **show_landing_page**, **landing_page_title/description/button_text/theme**, **bulk_batch_id**
- `scans` - Scan analytics (device_type, os, browser, country, city, region, referrer)
- `api_keys` - API keys for Business tier (hashed keys, last_used_at)
- `teams` - Team management for Business tier
- `team_members` - Team membership with roles
- `team_invites` - Pending team invitations

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
| Free | $0 | 0 | No | Static QR codes only |
| Pro | $9/mo | 50 | Yes | Logo upload, expiration, password, landing pages |
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

**Current:** Pre-launch, Stripe in test mode

**To Go Live:**
1. Switch Stripe to live mode (see `docs/LAUNCH-CHECKLIST.md`)
2. Update Railway env vars with live keys
3. Create production webhook in Stripe
4. Update Supabase auth URLs

**See Also:**
- `docs/WORKFLOW.md` - Branch workflow (develop → main)
- `docs/DEPLOYMENT.md` - Railway deployment guide
- `docs/LAUNCH-CHECKLIST.md` - Full launch checklist
- `docs/STRIPE-SETUP.md` - Stripe configuration
- `docs/AGENT-WORKFLOW.md` - Universal agent workflow rules

---

**Quick Start:**
```bash
cd /Users/bentyson/QRForge
git checkout develop      # Ensure on develop branch
git pull origin develop   # Get latest
npm run dev               # Dev server on port 3322
# Visit http://localhost:3322
```
