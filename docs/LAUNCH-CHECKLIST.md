# QRWolf Launch Checklist

> **Live URL**: https://qrwolf.com
> **Status**: LAUNCHED (December 28, 2025)
> **Admin Dashboard**: https://qrwolf.com/admin

See also: `docs/SESSION-START.md` for full project context

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
  - `qr_codes` (with `expires_at`, `password_hash`, `active_from`, `active_until`, `show_landing_page`, `landing_page_*`, `bulk_batch_id`, `media_files`)
  - `scans`
  - `api_keys`
  - `teams`, `team_members`, `team_invites`
- [x] **QR Types expansion migrations applied**:
  - `20251228000001_add_new_qr_types.sql` - content_type CHECK constraint
  - `20251228000002_add_media_storage.sql` - qr-media storage bucket
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

**Landing Page Routes:**
- [ ] `/r/[code]/pdf` - PDF viewer loads
- [ ] `/r/[code]/gallery` - Image gallery with lightbox works
- [ ] `/r/[code]/video` - Video player (YouTube/Vimeo/upload)
- [ ] `/r/[code]/audio` - Audio player (Spotify/SoundCloud/upload)
- [ ] `/r/[code]/menu` - Restaurant menu displays
- [ ] `/r/[code]/business` - Business card with vCard download
- [ ] `/r/[code]/links` - Link list displays
- [ ] `/r/[code]/coupon` - Coupon with copy code works
- [ ] `/r/[code]/social` - Social profile displays

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

- [ ] All API routes use proper authentication
- [ ] RLS policies prevent unauthorized data access
- [ ] Stripe webhook validates signatures
- [ ] No secrets exposed in client-side code
- [ ] HTTPS only (Railway handles this)

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

---

## Post-Launch Monitoring

- [ ] Set up Railway notifications (Slack/Discord/Email)
- [ ] Monitor error logs: `railway logs`
- [ ] Check Stripe dashboard for payments
- [ ] Monitor Supabase usage

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
