# QRWolf Launch Checklist

> **Live URL**: https://qrwolf.com
> **Status**: LAUNCHED (December 28, 2025)
> **Last Updated**: January 1, 2026 (Logo Upload UX + Image Optimization)
> **Admin Dashboard**: https://qrwolf.com/admin

See also: [docs/PROJECT.md](../PROJECT.md) for project overview

---

## 1. Railway Configuration

- [x] **Verify branch setting**: Railway → Service → Settings → Branch = `main`
- [x] **Check environment variables are set**:
  - [x] `NEXT_PUBLIC_SUPABASE_URL`
  - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [x] `SUPABASE_SERVICE_ROLE_KEY`
  - [x] `NEXT_PUBLIC_APP_URL` = `https://qrwolf.com`
  - [x] `STRIPE_SECRET_KEY` (live key)
  - [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key)
  - [x] `STRIPE_WEBHOOK_SECRET` (production webhook)
  - [x] All 4 `STRIPE_PRICE_*` variables (live prices)
  - [x] `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL` (Plausible analytics)
- [x] **Verify deployment is healthy**: `railway logs`
- [x] **Custom domain configured**: qrwolf.com with SSL

---

## 2. Supabase Configuration

- [x] **Auth redirect URLs** (Supabase → Authentication → URL Configuration):
  - Site URL: `https://qrwolf.com`
  - Redirect URLs:
    - `https://qrwolf.com/callback`
    - `https://qrwolf.com/auth/callback`
- [x] **Google OAuth configured**: Client ID and secret set
- [x] **Database migrations applied**: All tables exist
  - `profiles` (with `monthly_scan_count`, `scan_count_reset_at`)
  - `qr_codes` (with `expires_at`, `password_hash`, `active_from`, `active_until`, `show_landing_page`, `landing_page_*`, `bulk_batch_id`, `media_files`, `folder_id`)
  - `folders` (for QR code organization - Pro+ feature)
  - `scans`
  - `api_keys`
  - `teams`, `team_members`, `team_invites`
- [x] **QR Types expansion migrations applied**:
  - `20251228000001_add_new_qr_types.sql` - content_type CHECK constraint
  - `20251228000002_add_media_storage.sql` - qr-media storage bucket
  - `20251231000001_add_folders.sql` - folders table + qr_codes.folder_id
- [x] **RLS policies enabled**: All tables

---

## 3. Stripe Configuration

### Test Mode (Completed)
- [x] Products created (Pro, Business)
- [x] Prices created (monthly, yearly)
- [x] Webhook endpoint configured for localhost
- [x] Test checkout flow end-to-end

### Production Mode (LIVE)
- [x] **Switched to live keys**:
  - Live publishable key in Railway
  - Live secret key in Railway
- [x] **Production webhook configured**:
  - URL: `https://qrwolf.com/api/stripe/webhook`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`
  - Signing secret in Railway
- [x] **Custom checkout page**: `/checkout/[plan]` with Stripe Elements

---

## 4. Functional Testing

### Authentication
- [ ] Sign up with email works
- [ ] Login works
- [ ] Logout works
- [ ] Password reset works
- [ ] (Optional) Google OAuth works

### QR Code Creation (16 Types via 5-Step Wizard)
- [ ] Create static QR code → saves to database
- [ ] Create dynamic QR code → generates short_code
- [ ] Download PNG works (saves to DB first)
- [ ] Download SVG works (Pro+ only)
- [ ] Style customization works
- [ ] Type selector shows categories (Basic, Social, Media, Landing Pages)
- [ ] Pro-only types show badge and disable for free users
- [ ] Options step shows Pro features (Expiration, Password, Scheduling)
- [ ] QR code naming works and reflects in download filename

**Basic Types (All Tiers):**
- [ ] URL type works
- [ ] Text type works
- [ ] WiFi type works
- [ ] vCard type works
- [ ] Email type works
- [ ] Phone type works
- [ ] SMS type works

**Simple URL Types (All Tiers):**
- [ ] WhatsApp type generates wa.me link
- [ ] Facebook type generates facebook.com link
- [ ] Instagram type generates instagram.com link
- [ ] Apps type generates smart redirect

**File Upload Types (Pro+ Only):**
- [ ] PDF upload works
- [ ] Images upload works (multiple)
- [ ] Video upload/embed works
- [ ] MP3 upload/embed works

**Landing Page Types (Pro+ Only):**
- [ ] Menu builder works
- [ ] Business card form works
- [ ] Links list builder works
- [ ] Coupon form works
- [ ] Social profile form works

### QR Code Management
- [ ] QR list shows all codes
- [ ] QR list groups bulk batches separately
- [ ] Edit QR code works (dynamic only)
- [ ] Delete QR code works
- [ ] Copy link works
- [ ] Logo upload works (Pro+)

### Bulk QR Generation (Business)
- [ ] Bulk upload page accessible for Business tier
- [ ] CSV parsing works correctly
- [ ] Style customization applies to all codes
- [ ] Feature toggles (expiration, password, landing page) work
- [ ] Bulk batch grouping displays on QR list page
- [ ] Batch expansion shows individual codes

### Dynamic QR Redirect
- [ ] `/r/[code]` redirects to destination
- [ ] Scan is recorded in database
- [ ] Geolocation is captured (test with real device)
- [ ] Expired QR shows `/expired` page
- [ ] Password-protected QR shows `/r/[code]/unlock`
- [ ] Scan limit exceeded shows `/limit-reached`

**Landing Page Routes (All Upgraded December 30, 2025):**
All landing pages now feature:
- Glassmorphism design with `backdrop-blur-xl`
- Floating orb decorations with `animate-pulse`
- Dot pattern backgrounds
- Staggered fade-in/slide-up animations
- Dark navy/teal theme with accent color support

- [ ] `/r/[code]/pdf` - PDF viewer with header card, toolbar
- [ ] `/r/[code]/gallery` - Image grid with zoom effect, lightbox + thumbnail strip
- [ ] `/r/[code]/video` - Video player with YouTube/Vimeo badging
- [ ] `/r/[code]/audio` - Audio player with Spotify/SoundCloud detection, vinyl cover art
- [ ] `/r/[code]/menu` - Restaurant menu with category navigation
- [ ] `/r/[code]/business` - Business card with glow effect, social links, vCard download
- [ ] `/r/[code]/links` - Linktree-style with animated buttons, social icons
- [ ] `/r/[code]/coupon` - Coupon with animated copy button, expiration badge
- [ ] `/r/[code]/social` - Social profile with platform-colored buttons

### Analytics
- [ ] Dashboard shows real stats
- [ ] Analytics page shows scan data
- [ ] Device/browser/country breakdowns work

### Billing
- [ ] Pricing page loads (homepage)
- [ ] Plans page loads (`/plans`)
- [ ] Plans page shows current tier highlighted
- [ ] Monthly/yearly toggle works with 17% savings badge
- [ ] All upgrade buttons across app route to `/plans`
- [ ] Checkout redirects to Stripe
- [ ] Successful payment updates user tier
- [ ] Success page shows (`/subscription/success`)
- [ ] Success page displays confetti animation
- [ ] Success page shows correct tier features
- [ ] Customer portal opens
- [ ] Usage bar shows correct limits

### API Access (Business)
- [ ] Developer portal accessible at `/developers`
- [ ] API key creation works
- [ ] API key revocation works
- [ ] API documentation displays correctly
- [ ] `GET /api/v1/qr-codes` returns user's QR codes
- [ ] `POST /api/v1/qr-codes` creates new QR code
- [ ] `GET /api/v1/qr-codes/:id` returns single QR code
- [ ] `PATCH /api/v1/qr-codes/:id` updates QR code
- [ ] `DELETE /api/v1/qr-codes/:id` deletes QR code
- [ ] `GET /api/v1/qr-codes/:id/image` returns QR image

### API Security & Limits (December 30, 2025)
- [x] Request counting tracks all API calls in database
- [x] Monthly limit enforced (10,000 requests/month)
- [x] Per-minute rate limiting (60 requests/minute)
- [x] Returns 429 with proper headers when limits exceeded
- [x] Content validation for all 19 QR content types
- [x] Business tier gating on all API endpoints
- [x] API keys hashed with SHA-256 (raw key never stored)
- [x] IP whitelist support for API keys
- [x] API key expiration support

### Blog & Learn Knowledge Base
- [ ] `/learn` - Hub page loads with category cards
- [ ] `/learn/[slug]` - Individual article with TOC sidebar
- [ ] `/learn/category/[category]` - Category listing pages
- [ ] `/blog` - Blog listing with featured posts
- [ ] `/blog/[slug]` - Individual blog post with author card
- [ ] `/blog/category/[category]` - Category-filtered posts
- [ ] Table of contents scroll-spy highlights current section
- [ ] Related articles show at bottom of posts
- [ ] MDX components render correctly (callouts, code blocks, tables)
- [ ] V2 UI polish: Floating orbs, staggered animations, glassmorphism

---

## 5. SEO & Marketing

- [ ] **Meta tags**: Check with https://metatags.io
- [ ] **OpenGraph**: Test with Facebook/LinkedIn share preview
- [ ] **Sitemap**: Visit `/sitemap.xml`
- [ ] **Robots.txt**: Visit `/robots.txt`
- [ ] **Google Search Console**:
  - [ ] Add property
  - [ ] Verify ownership
  - [ ] Submit sitemap

---

## 6. Security

- [x] All API routes use proper authentication
- [x] RLS policies prevent unauthorized data access
- [x] Stripe webhook validates signatures
- [x] No secrets exposed in client-side code
- [x] HTTPS only (Railway handles this)
- [x] API rate limiting prevents abuse (60/min, 10k/month)
- [x] API keys hashed before storage (SHA-256)
- [x] Content validation prevents malformed data
- [x] Input sanitization on filenames and URLs

---

## 7. Custom Domain (COMPLETED)

- [x] Domain: qrwolf.com
- [x] Railway → Settings → Domains → Custom domain added
- [x] DNS records configured
- [x] `NEXT_PUBLIC_APP_URL` = `https://qrwolf.com`
- [x] Supabase redirect URLs updated
- [x] Stripe webhook URL updated
- [x] SSL certificate active

---

## 8. Final Launch Steps (COMPLETED)

1. [x] Merge any pending changes: `develop` → `main`
2. [x] Verify Railway deployment succeeds
3. [x] Switch Stripe to live mode
4. [x] Update webhook to production URL
5. [x] Site is LIVE at https://qrwolf.com

**Admin Dashboard Added:**
- [x] `/admin` - Overview with key metrics
- [x] `/admin/users` - User management
- [x] `/admin/qr-codes` - All QR codes
- [x] `/admin/analytics` - Site-wide analytics
- [x] `/admin/subscriptions` - Revenue tracking

**QR Wizard Enhancements (December 28, 2025):**
- [x] 5-step wizard: Type → Content → Style → Options → Download
- [x] Options step with Pro features (Expiration, Password, Scheduling)
- [x] Save-before-download ensures QR codes tracked in dashboard
- [x] Real short_code URLs (no preview URLs)
- [x] Logo upload with size slider in Style step
- [x] Landing page previews in phone mockup
- [x] QR code naming for download filenames

**Dynamic QR Type Upgrades (December 30, 2025):**
- [x] All 9 dynamic types have phone mockup previews in QRStudio
- [x] Preview components: MenuPreview, LinksPreview, BusinessPreview, SocialPreview, CouponPreview, GalleryPreview, PDFPreview, VideoPreview, AudioPreview
- [x] SocialLinksEditor reusable component for Business, Links, Social types
- [x] All landing pages redesigned with modern glassmorphism UI
- [x] Consistent design language across all QR types

**Blog & Learn V2 UI Polish (December 30, 2025):**
- [x] All 11 blog/learn pages and components upgraded to V2 design
- [x] ArticleCard with shine effect, gradient overlay, scale/translate hover
- [x] Hub pages with floating orbs, dot patterns, staggered animations
- [x] TableOfContents with progress line, indicator dots, glass-heavy styling
- [x] LearnSidebar with category icons, vertical progress line, active badges
- [x] Article pages with breadcrumbs, floating backgrounds, enhanced headers
- [x] MDX components with enhanced typography, anchor links, styled elements
- [x] Callout component with 5 variants (info, warning, tip, error, note)
- [x] Category pages with consistent V2 styling

**Logo Upload UX Enhancement (January 1, 2026):**
- [x] StyleStep refactored with "Colors" | "Logo" tabs
- [x] LogoBestPractices component with 5 tips (dimensions, simplicity, shape, contrast, testing)
- [x] Clickable "Add a logo" button under QR preview
- [x] Best practices visible to all users (Pro and Free)
- [x] Applied to QRWizard, BulkStudio, and QRLogoUploader (edit page)

**Image Optimization (January 1, 2026):**
- [x] Sharp library for server-side image processing
- [x] Media images: Resize max 2000px, convert to WebP, 80% quality
- [x] GIFs: Resize if needed, preserve animation
- [x] Logos: Resize max 500px, 85% quality, keep PNG/JPEG format
- [x] 40-70% file size reduction typical
- [x] Graceful fallback if optimization fails

---

## 9. Analytics (Plausible)

- [ ] Sign up at https://plausible.io
- [ ] Add site: `qrwolf.com`
- [ ] Copy the custom script URL from Plausible setup page
- [ ] Add environment variable to Railway:
  - `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL=https://plausible.io/js/pa-XXXXX.js`
- [ ] Redeploy and verify script loads
- [ ] Dashboard: https://plausible.io/qrwolf.com

---

## Post-Launch Monitoring

- [ ] Set up Railway notifications (Slack/Discord/Email)
- [ ] Monitor error logs: `railway logs`
- [ ] Check Stripe dashboard for payments
- [ ] Monitor Supabase usage
- [ ] Check Plausible for traffic stats

---

## Quick Verification Commands

```bash
# Check deployment status
railway status
railway logs

# Check database
supabase db push --linked --dry-run

# Test site is up
curl -I https://qrwolf.com

# Test admin dashboard (must be logged in as admin)
# Visit: https://qrwolf.com/admin
```
