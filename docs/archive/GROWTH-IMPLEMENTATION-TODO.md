# Growth Roadmap Implementation - Remaining Tasks

This document tracks remaining work from the Growth Roadmap implementation (Sessions 1-10).

## Completed Features (Ready to Use)

- [x] **Referral Program** - Dashboard widget, signup tracking, Stripe webhook crediting
- [x] **7-Day Stripe Trial** - Checkout integration, webhook handling, trial banner
- [x] **Password Rate Limiting** - 5 attempts per 15 min on `/api/qr/verify-password`
- [x] **Expanded Social Proof** - 10 testimonials + trust badges on homepage
- [x] **Comparison Pages** - `/vs/qr-code-monkey`, `/vs/qr-tiger`, `/vs/beaconstac`
- [x] **PDF Export** - jspdf installed, PDFOptionsModal wired into QRStudio download flow, SVG→PNG rendering fixed
- [x] **Content CTAs** - ArticleCTA added to 58+ articles across blog and learn sections
- [x] **Sentry Error Tracking** - `@sentry/nextjs` installed, client/server/edge configs, error boundaries wired, instrumentation hook, test endpoint at `/api/test/sentry`
- [x] **Cron Jobs** - CRON_SECRET set, cron-job.org configured (onboarding 9am UTC, milestones 10am UTC), Pro users excluded from usage warnings
- [x] **Email Test Endpoint** - `/api/test/emails` for previewing and sending all 12 email templates
- [x] **Database Migrations** - All 3 migrations pushed to production Supabase (referral system, onboarding email tracking, trial support)
- [x] **Stripe Portal Error Handling** - Surfaced real Stripe error messages instead of generic fallback
- [x] **Double-Billing Fix** - Auto-cancel old subscriptions when user upgrades (both checkout and custom flows)
- [x] **Signup Suspense Fix** - Wrapped `useSearchParams()` in Suspense boundary to fix production build

---

## All Tasks Complete

All growth roadmap implementation tasks have been completed and deployed to production.

---

## Quick Verification Checklist

Post-deploy verification (production):

- [ ] Sign up with `?ref=TESTCODE` → referrer linked
- [ ] Free user sees "Start Free Trial" → redirects to Stripe checkout
- [ ] After Stripe trial starts → dashboard shows trial banner with days
- [ ] 6 wrong passwords on protected QR → 429 response
- [ ] Homepage shows 10 testimonials + trust badges
- [ ] `/vs/qr-code-monkey` loads comparison page
- [ ] Hit `/api/test/sentry` → error appears in Sentry dashboard
- [ ] Cron endpoints return success with valid CRON_SECRET
- [ ] Preview emails at `/api/test/emails?template=onboarding_day1`
- [ ] "Manage Subscription" shows real Stripe error (not generic) for accounts without valid Stripe customer
- [ ] Subscription upgrade cancels old subscription automatically

---

## Notes

- The old database-based trial (`/api/trial/start`) is deprecated but still exists
- Stripe trial is now the primary trial mechanism (requires credit card)
- Trial duration is 7 days (configured in `/api/stripe/checkout/route.ts`)
- Pro users only receive positive milestone emails, not usage warnings
- Email test endpoint requires no auth in dev, Bearer token in production
- Admin test account (`ideaswithben@gmail.com`) on production has a fake `stripe_customer_id` — portal won't work for it (expected)
- Subscription upgrades now auto-cancel old subscriptions in both webhook and finalize-subscription flows
