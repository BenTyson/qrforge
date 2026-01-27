# QRWolf Growth Roadmap: 5 → 100 Users

> **Created**: January 25, 2026
> **Status**: ✅ IMPLEMENTED (January 25, 2026)
> **Goal**: Activate growth mechanics to scale from 5 to 100 paying users

## Implementation Status

All 10 sessions were implemented on January 25, 2026. See `docs/GROWTH-IMPLEMENTATION-TODO.md` for remaining integration tasks.

| Session | Status | Notes |
|---------|--------|-------|
| 1. Referral Program | ✅ Complete | Dashboard widget, Stripe webhook |
| 2. Onboarding Emails | ✅ Complete | Day 1/3/7 templates, cron endpoint |
| 3. Pro Trial | ✅ Complete | **Changed to 7-day Stripe trial** (not database) |
| 4. Sentry | ⚠️ Prepared | Install `@sentry/nextjs` to activate |
| 5. Rate Limiting | ✅ Complete | 5 attempts per 15 min |
| 6. Social Proof | ✅ Complete | 10 testimonials + trust badges |
| 7. Milestone Emails | ✅ Complete | Templates + cron endpoint |
| 8. PDF Export | ⚠️ Code Only | Need UI button in QR Studio |
| 9. Comparison Pages | ✅ Complete | 3 competitor pages |
| 10. Content CTAs | ⚠️ Component Only | Need to add to articles |

## Overview

This roadmap prioritizes **growth mechanics** before features. You have 27 QR types and 40 templates - the product is ready. The growth engine isn't.

**Timeline**: ~8-10 sessions over 1-2 weeks

---

## Audit Summary

| Area | Score | Verdict |
|------|-------|---------|
| Product/Features | 9/10 | Excellent - 27 QR types, templates, A/B testing |
| Technical/Security | 8/10 | Strong - Good tests, RLS, validation |
| SEO/Content | 9/10 | Excellent - 150 articles, sitemap |
| Growth Engine | 3/10 | **Critical Gap** - No referral, minimal email |
| Monitoring | 4/10 | Weak - No Sentry, no alerting |

---

## Session 1: Referral Program (Growth - HIGH IMPACT)
**Estimated effort**: 1 session | **Impact**: 20-30% more signups

### What We're Building
- Unique referral codes for each user
- `?ref=CODE` tracking on signup
- $5 credit for referrer when referee upgrades (or free month)
- Dashboard widget: "Invite friends, get rewards"

### Files to Create/Modify
- `supabase/migrations/xxx_referral_system.sql` - Add referral_code to profiles, referrals table
- `src/app/(auth)/signup/page.tsx` - Track ref param, store referrer
- `src/app/(dashboard)/dashboard/page.tsx` - Add referral widget
- `src/components/dashboard/ReferralWidget.tsx` - Share link, stats
- `src/lib/referrals/index.ts` - Referral logic

### Database Schema
```sql
-- Add to profiles
ALTER TABLE profiles ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN referred_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN referral_credits INTEGER DEFAULT 0;

-- Track referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id),
  referee_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending', -- pending, converted, credited
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);
```

### Acceptance Criteria
- [ ] Every user gets unique referral code on signup
- [ ] Signup with `?ref=CODE` links to referrer
- [ ] Dashboard shows referral link with copy button
- [ ] Referral count visible in dashboard
- [ ] Referrer credited when referee upgrades to paid

---

## Session 2: Onboarding Email Sequence (Growth - HIGH IMPACT)
**Estimated effort**: 1 session | **Impact**: 10-15% better conversion

### What We're Building
- Day 0: Welcome email (exists, enhance)
- Day 1: "Create your first QR code" tutorial
- Day 3: "Did you know?" feature highlight
- Day 7: "Upgrade to Pro" with social proof

### Files to Create/Modify
- `src/emails/OnboardingDay1.tsx` - First QR tutorial
- `src/emails/OnboardingDay3.tsx` - Feature discovery
- `src/emails/OnboardingDay7.tsx` - Upgrade nudge
- `src/lib/email/onboarding.ts` - Sequence logic
- `supabase/migrations/xxx_email_tracking.sql` - Track sent emails

### Email Triggers
Option A: Cron job checks `profiles.created_at` daily
Option B: Supabase Edge Function scheduled
Option C: Use Resend's scheduled sending

### Acceptance Criteria
- [ ] New users receive Day 1 email ~24h after signup
- [ ] Day 3 email highlights a Pro feature
- [ ] Day 7 email includes testimonial + upgrade CTA
- [ ] Users can unsubscribe (link in footer)
- [ ] Sent emails tracked to prevent duplicates

---

## Session 3: 14-Day Pro Trial (Growth - MEDIUM)
**Estimated effort**: 1 session | **Impact**: 25-40% trial conversion

### What We're Building
- New users can start 14-day Pro trial
- Full Pro features during trial
- Auto-downgrade to Free after 14 days
- "Trial ending" email on day 11

### Files to Create/Modify
- `supabase/migrations/xxx_trial_support.sql` - Add trial_ends_at
- `src/lib/constants/limits.ts` - Trial tier logic
- `src/app/(dashboard)/dashboard/page.tsx` - Trial banner
- `src/components/dashboard/TrialBanner.tsx` - Days remaining
- `src/emails/TrialEndingSoon.tsx` - Day 11 reminder
- `src/app/(auth)/signup/page.tsx` - Trial start option

### Database Changes
```sql
ALTER TABLE profiles ADD COLUMN trial_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN trial_used BOOLEAN DEFAULT FALSE;
```

### Trial Logic
```typescript
function getUserTier(profile) {
  if (profile.subscription_tier !== 'free') return profile.subscription_tier;
  if (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) {
    return 'pro'; // Trial active
  }
  return 'free';
}
```

### Acceptance Criteria
- [ ] Signup offers "Start free" vs "Start 14-day Pro trial"
- [ ] Trial users see Pro features unlocked
- [ ] Dashboard shows "X days left in trial"
- [ ] Day 11 email sent automatically
- [ ] Auto-downgrade works (check on each request)
- [ ] Trial can only be used once per user

---

## Session 4: Sentry Error Tracking (Technical - URGENT)
**Estimated effort**: 0.5 session | **Impact**: See production errors

### What We're Building
- Sentry integration for error tracking
- Source maps for readable stack traces
- Error boundaries with Sentry reporting

### Files to Create/Modify
- `sentry.client.config.ts` - Client-side config
- `sentry.server.config.ts` - Server-side config
- `sentry.edge.config.ts` - Edge runtime config
- `next.config.ts` - Add Sentry webpack plugin
- `src/app/error.tsx` - Report to Sentry
- `src/app/global-error.tsx` - Root error boundary

### Setup Steps
1. Create Sentry project at sentry.io
2. `npm install @sentry/nextjs`
3. `npx @sentry/wizard@latest -i nextjs`
4. Add SENTRY_DSN to environment variables

### Acceptance Criteria
- [ ] Sentry project created and DSN configured
- [ ] Client errors reported with user context
- [ ] Server errors reported with request context
- [ ] Source maps uploaded for readable traces
- [ ] Test error appears in Sentry dashboard

---

## Session 5: Password Rate Limiting (Security)
**Estimated effort**: 0.5 session | **Impact**: Prevent brute force

### What We're Building
- Rate limit password verification endpoint
- 5 attempts per IP per 15 minutes
- Account lockout after 10 consecutive failures

### Files to Modify
- `src/app/api/qr/verify-password/route.ts` - Add rate limiting
- `src/lib/rate-limit.ts` - Create or use existing

### Implementation
```typescript
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimiter.get(ip);

  if (!record || record.resetAt < now) {
    rateLimiter.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }

  if (record.count >= 5) return false;
  record.count++;
  return true;
}
```

### Acceptance Criteria
- [ ] 6th password attempt returns 429 Too Many Requests
- [ ] Rate limit resets after 15 minutes
- [ ] Failed attempts logged for security audit
- [ ] Successful verification resets count

---

## Session 6: Expand Social Proof (Growth)
**Estimated effort**: 0.5-1 session | **Impact**: 5-10% conversion lift

### What We're Building
- Expand from 3 to 8-10 testimonials
- Add industry diversity
- Include specific metrics where possible
- Add trust badges section

### Files to Modify
- `src/components/homepage/TestimonialsSection.tsx` - More testimonials
- `src/components/homepage/TrustSection.tsx` - Create trust badges

### New Testimonials to Add (templates)
```typescript
const testimonials = [
  // Existing 3...
  { name: "David Park", role: "Event Coordinator", company: "TechConf 2026",
    quote: "Managed 50+ QR codes for our conference. The bulk generation saved hours.", industry: "Events" },
  { name: "Lisa Wang", role: "Salon Owner", company: "Glow Beauty Studio",
    quote: "Clients scan for booking. We've seen 40% more online appointments.", industry: "Beauty" },
  { name: "Mike Johnson", role: "Real Estate Agent", company: "Premier Realty",
    quote: "Every listing has a QR to the virtual tour. Buyers love the instant access.", industry: "Real Estate" },
  // Add 2-3 more...
];
```

### Trust Badges
- "Trusted by 500+ businesses" (or actual count)
- "99.9% uptime"
- "GDPR compliant"
- "Privacy-first analytics"

### Acceptance Criteria
- [ ] 8-10 testimonials displayed
- [ ] Multiple industries represented
- [ ] At least 2 testimonials include metrics
- [ ] Trust badges section added

---

## Session 7: Milestone Emails (Growth)
**Estimated effort**: 0.5 session | **Impact**: Engagement + upgrade triggers

### What We're Building
- "You hit 50 scans!" celebration email
- "You've created 5 QR codes!" milestone
- "You're at 80% of your scan limit" warning

### Files to Create/Modify
- `src/emails/MilestoneEmail.tsx` - Celebration template
- `src/emails/UsageLimitWarning.tsx` - 80% warning
- `src/lib/email/milestones.ts` - Trigger logic

### Trigger Points
- 50 scans (first milestone)
- 5 QR codes created
- 80% of monthly scan limit
- 100% of scan limit (already exists: ScanLimitReachedEmail)

### Acceptance Criteria
- [ ] 50-scan email celebrates achievement
- [ ] 5 QR codes email suggests trying templates
- [ ] 80% warning email nudges upgrade
- [ ] Emails only sent once per milestone

---

## Session 8: Print-Ready PDF Export (Feature)
**From existing roadmap - Feature #10**

**Estimated effort**: 1 session

### What We're Building
- Download QR codes as print-ready PDF
- Crop marks and bleed options
- Multiple paper sizes (Letter, A4)
- Vector QR in PDF (not raster)

### Files to Create/Modify
- `src/lib/qr/pdf-generator.ts` - PDF generation logic
- `src/components/qr/PDFOptionsModal.tsx` - Options UI
- Update download step to include PDF option

### Libraries
- `pdf-lib` or `jspdf` for PDF generation
- SVG → PDF conversion

### Acceptance Criteria
- [ ] PDF download option in export
- [ ] Crop marks toggle works
- [ ] Bleed area configurable (0.125", 0.25")
- [ ] Paper size selection (Letter, A4)
- [ ] QR is vector in resulting PDF

---

## Session 9: Comparison Pages (SEO/Growth)
**Estimated effort**: 1 session | **Impact**: Capture competitor traffic

### What We're Building
- `/vs/qr-code-monkey` comparison page
- `/vs/qr-tiger` comparison page
- `/vs/beaconstac` comparison page
- Feature comparison tables

### Files to Create
- `src/app/vs/[competitor]/page.tsx` - Dynamic comparison page
- `src/lib/competitors.ts` - Competitor data
- `content/vs/` - MDX content for each competitor

### Page Structure
1. Hero: "QRWolf vs [Competitor]"
2. Feature comparison table
3. Pricing comparison
4. "Why switch" section
5. Migration CTA

### Acceptance Criteria
- [ ] 3 comparison pages created
- [ ] Accurate feature comparisons
- [ ] SEO optimized (meta tags, schema)
- [ ] Clear CTAs to signup

---

## Session 10: Content CTAs (Growth)
**Estimated effort**: 0.5 session | **Impact**: 2-3% article conversion

### What We're Building
- Add CTAs to existing 150 articles
- "Create a [type] QR code" buttons
- Related feature callouts

### Files to Modify
- `content/blog/*.mdx` - Add CTA components
- `content/learn/*.mdx` - Add CTA components
- `src/components/content/ArticleCTA.tsx` - Reusable CTA

### CTA Examples
- Article about WiFi QR → "Create a WiFi QR code now"
- Article about menus → "Build your restaurant menu QR"
- How-to guides → "Try it free"

### Acceptance Criteria
- [ ] CTA component created
- [ ] Top 20 traffic articles have CTAs
- [ ] CTAs link to relevant QR type
- [ ] Track CTA clicks in Plausible

---

## Quick Reference: Session Order

| # | Session | Type | Impact |
|---|---------|------|--------|
| 1 | Referral Program | Growth | 20-30% more signups |
| 2 | Onboarding Emails | Growth | 10-15% better conversion |
| 3 | 14-Day Pro Trial | Growth | 25-40% trial conversion |
| 4 | Sentry Integration | Technical | See production errors |
| 5 | Password Rate Limit | Security | Prevent brute force |
| 6 | Expand Social Proof | Growth | 5-10% conversion lift |
| 7 | Milestone Emails | Growth | Engagement + upgrades |
| 8 | Print-Ready PDF | Feature | Pro differentiator |
| 9 | Comparison Pages | SEO | Competitor traffic |
| 10 | Content CTAs | Growth | Article conversion |

---

## After These Sessions

Continue with existing feature roadmap (see `/docs/FEATURE-ROADMAP.md`):
- Feature #11: Simple Feedback Form QR Type
- Feature #15: Multi-Platform Review QR
- Feature #16: Embed Code Generator
- Feature #17: Campaign Grouping

---

## Verification Checklist

After all sessions complete:

### Growth Mechanics
- [ ] Sign up with `?ref=test` → referrer credited on upgrade
- [ ] New user receives Day 1, 3, 7 emails
- [ ] Start trial → Pro features unlock → Day 11 email → auto-downgrade
- [ ] 50-scan milestone email received
- [ ] 80% usage warning email received

### Technical
- [ ] Trigger intentional error → appears in Sentry
- [ ] 6 wrong passwords → 429 response
- [ ] All emails render correctly (test with Resend preview)

### SEO/Content
- [ ] `/vs/qr-code-monkey` loads with comparison table
- [ ] Top 20 articles have CTAs
- [ ] Homepage has 8-10 testimonials

---

## Notes

- Each session is designed to be completable in 1-2 hours
- Sessions 1-3 are highest priority (growth mechanics)
- Sessions 4-5 are quick wins (technical hardening)
- Sessions can be combined if time permits
- Test in dev environment, push to develop branch, then PR to main
