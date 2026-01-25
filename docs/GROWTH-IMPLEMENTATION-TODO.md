# Growth Roadmap Implementation - Remaining Tasks

This document tracks remaining work from the Growth Roadmap implementation (Sessions 1-10).

## Completed Features (Ready to Use)

- [x] **Referral Program** - Dashboard widget, signup tracking, Stripe webhook crediting
- [x] **7-Day Stripe Trial** - Checkout integration, webhook handling, trial banner
- [x] **Password Rate Limiting** - 5 attempts per 15 min on `/api/qr/verify-password`
- [x] **Expanded Social Proof** - 10 testimonials + trust badges on homepage
- [x] **Comparison Pages** - `/vs/qr-code-monkey`, `/vs/qr-tiger`, `/vs/beaconstac`

---

## Tasks Requiring Integration

### 1. PDF Export - Add UI Button
**Files created:**
- `src/lib/qr/pdf-generator.ts`
- `src/components/qr/PDFOptionsModal.tsx`

**TODO:**
- [ ] Install jspdf: `npm install jspdf`
- [ ] Add "Download PDF" option to QR code download/export step in QR Studio
- [ ] Wire up PDFOptionsModal to the download flow
- [ ] Test with different paper sizes and crop mark options

**Location to modify:** `src/components/qr/studio/` (likely the download step component)

---

### 2. Content CTAs - Add to Articles
**File created:**
- `src/components/content/ArticleCTA.tsx`

**TODO:**
- [ ] Identify top 20 traffic articles (check Plausible analytics)
- [ ] Add `<ArticleCTA>` components to those articles
- [ ] Match CTA type to article topic (e.g., WiFi article → WiFi QR CTA)

**Example usage in MDX:**
```mdx
import { ArticleCTA } from '@/components/content/ArticleCTA'

<ArticleCTA
  type="wifi"
  title="Create Your WiFi QR Code"
  description="Let guests connect instantly"
/>
```

---

### 3. Sentry Error Tracking - Install Package
**Files prepared:**
- `next.config.ts` - Conditional Sentry loading ready
- `src/app/error.tsx` - Error boundary ready
- `src/app/global-error.tsx` - Global error boundary ready

**TODO:**
- [ ] Create Sentry account/project at https://sentry.io
- [ ] Run: `npx @sentry/wizard@latest -i nextjs`
- [ ] Add environment variables:
  - `SENTRY_DSN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`
  - `SENTRY_AUTH_TOKEN`
- [ ] Re-add Sentry imports to error.tsx and global-error.tsx:
  ```typescript
  import * as Sentry from '@sentry/nextjs';
  // In useEffect:
  Sentry.captureException(error);
  ```

---

### 4. Cron Jobs - Configure Scheduler
**Endpoints created:**
- `/api/cron/onboarding-emails` - Day 1, 3, 7 emails
- `/api/cron/trial-ending-emails` - Legacy trial reminders (Stripe handles this now)
- `/api/cron/milestone-emails` - 50 scans, 5 QR codes, 80% usage

**TODO:**
- [ ] Set `CRON_SECRET` environment variable (generate secure random string)
- [ ] Configure Vercel Cron in `vercel.json`:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/onboarding-emails",
        "schedule": "0 9 * * *"
      },
      {
        "path": "/api/cron/milestone-emails",
        "schedule": "0 10 * * *"
      }
    ]
  }
  ```
- [ ] Or use external scheduler (cron-job.org, etc.) with Bearer token auth

---

### 5. Email Templates - Test Rendering
**Templates created:**
- `src/emails/OnboardingDay1.tsx`
- `src/emails/OnboardingDay3.tsx`
- `src/emails/OnboardingDay7.tsx`
- `src/emails/TrialEndingSoon.tsx`
- `src/emails/MilestoneEmail.tsx`
- `src/emails/UsageLimitWarning.tsx`

**TODO:**
- [ ] Preview emails using Resend's preview or react-email dev server
- [ ] Verify all links point to correct URLs (qrwolf.com)
- [ ] Test actual sending in dev environment

---

## Environment Variables Needed

Add these to your environment (`.env.local` for dev, Vercel for production):

```bash
# Cron Jobs
CRON_SECRET=your-secure-random-string

# Sentry (after setup)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=qrwolf
SENTRY_AUTH_TOKEN=your-auth-token
```

---

## Database Migrations (Already Pushed to Dev)

These migrations were pushed to dev Supabase (`fxcvxomvkgioxwbwmbsy`):

1. `20260125000001_add_referral_system.sql` - Referral codes, credits, tracking
2. `20260125000002_add_onboarding_email_tracking.sql` - Email sent tracking
3. `20260125000003_add_trial_support.sql` - Trial fields (used by Stripe trial too)

**Before production deploy:**
- [ ] Link to production: `npx supabase link --project-ref otdlggbhsmgqhsviazho`
- [ ] Push migrations: `npx supabase db push`

---

## Quick Verification Checklist

After completing the above tasks:

- [ ] Sign up with `?ref=TESTCODE` → referrer linked
- [ ] Free user sees "Start Free Trial" → redirects to Stripe checkout
- [ ] After Stripe trial starts → dashboard shows trial banner with days
- [ ] 6 wrong passwords on protected QR → 429 response
- [ ] Homepage shows 10 testimonials + trust badges
- [ ] `/vs/qr-code-monkey` loads comparison page
- [ ] Trigger test error → appears in Sentry
- [ ] Cron endpoints return success with valid CRON_SECRET

---

## Notes

- The old database-based trial (`/api/trial/start`) is deprecated but still exists
- Stripe trial is now the primary trial mechanism (requires credit card)
- Trial duration is 7 days (configured in `/api/stripe/checkout/route.ts`)
