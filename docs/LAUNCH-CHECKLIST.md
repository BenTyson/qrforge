# QRForge Launch Checklist

> **Target URL**: https://qrforge-production.up.railway.app
> **Status**: Pre-Launch

---

## 1. Railway Configuration

- [ ] **Verify branch setting**: Railway → Service → Settings → Branch = `main`
- [ ] **Check environment variables are set**:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL` = `https://qrforge-production.up.railway.app`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] All 4 `STRIPE_PRICE_*` variables
- [ ] **Verify deployment is healthy**: `railway logs`

---

## 2. Supabase Configuration

- [ ] **Auth redirect URLs** (Supabase → Authentication → URL Configuration):
  - Site URL: `https://qrforge-production.up.railway.app`
  - Redirect URLs:
    - `https://qrforge-production.up.railway.app/callback`
    - `https://qrforge-production.up.railway.app/auth/callback`
- [ ] **Database migrations applied**: Check all tables exist
  - `profiles` (with `monthly_scan_count`, `scan_count_reset_at`)
  - `qr_codes` (with `expires_at`, `password_hash`, `active_from`, `active_until`, `show_landing_page`, `landing_page_*`, `bulk_batch_id`)
  - `scans`
  - `api_keys`
  - `teams`, `team_members`, `team_invites`
- [ ] **RLS policies enabled**: All tables

---

## 3. Stripe Configuration

### Test Mode (Current)
- [x] Products created (Pro, Business)
- [x] Prices created (monthly, yearly)
- [x] Webhook endpoint configured for localhost
- [ ] Test checkout flow end-to-end

### Production Mode (Before Go-Live)
- [ ] **Switch to live keys**:
  1. Stripe Dashboard → toggle off "Test mode"
  2. Copy `pk_live_*` and `sk_live_*` keys
  3. Update Railway environment variables
- [ ] **Create production webhook**:
  1. Stripe → Developers → Webhooks → Add endpoint
  2. URL: `https://qrforge-production.up.railway.app/api/stripe/webhook`
  3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
  4. Copy signing secret to `STRIPE_WEBHOOK_SECRET` in Railway
- [ ] **Test live checkout** with real card (small amount, refund after)

---

## 4. Functional Testing

### Authentication
- [ ] Sign up with email works
- [ ] Login works
- [ ] Logout works
- [ ] Password reset works
- [ ] (Optional) Google OAuth works

### QR Code Creation
- [ ] Create static QR code → saves to database
- [ ] Create dynamic QR code → generates short_code
- [ ] Download PNG works
- [ ] Download SVG works
- [ ] Style customization works

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

### Analytics
- [ ] Dashboard shows real stats
- [ ] Analytics page shows scan data
- [ ] Device/browser/country breakdowns work

### Billing
- [ ] Pricing page loads
- [ ] Checkout redirects to Stripe
- [ ] Successful payment updates user tier
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

## 7. Custom Domain (Optional)

- [ ] Purchase domain (e.g., qrforge.io)
- [ ] Railway → Settings → Domains → Add custom domain
- [ ] Configure DNS records
- [ ] Update `NEXT_PUBLIC_APP_URL` in Railway
- [ ] Update Supabase redirect URLs
- [ ] Update Stripe webhook URL
- [ ] Wait for SSL certificate (automatic)

---

## 8. Final Launch Steps

1. [ ] Merge any pending changes: `develop` → `main`
2. [ ] Verify Railway deployment succeeds
3. [ ] Run through functional tests above
4. [ ] Switch Stripe to live mode
5. [ ] Update webhook to production URL
6. [ ] Test one real payment (refund after)
7. [ ] Announce launch!

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
curl -I https://qrforge-production.up.railway.app
```
