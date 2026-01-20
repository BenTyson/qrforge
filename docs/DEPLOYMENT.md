# Deployment Guide

> **Live URL**: https://qrwolf.com
> **Custom Domain**: qrwolf.com (configured)

See also: `docs/SESSION-START.md` for full project context

---

## ⛔ CRITICAL WARNING: LIVE PAYING USERS

> **Production at https://qrwolf.com has REAL PAYING CUSTOMERS.**
>
> - Customer data, payment records, and QR codes are LIVE
> - QR codes are printed on menus, business cards, and marketing materials
> - Corrupting data = breaking customer QR codes = harming real people's businesses
>
> **NEVER deploy untested code. NEVER run destructive operations on production.**

### Pre-Deployment Safety Checklist

Before merging ANY PR to `main`:

- [ ] Ran `npm run safety-check` and confirmed "SAFE" (dev database)
- [ ] Ran `npm run precommit` (lint + type-check + tests pass)
- [ ] Ran `npm run build` locally with no errors
- [ ] Tested changes locally on dev database
- [ ] PR has been reviewed (or self-reviewed for small changes)
- [ ] No migrations that could corrupt production data
- [ ] No environment variable changes that affect production

---

## ⚠️ Branch Workflow

```
develop (default) ──PR──> main ──auto──> Railway
```

| Branch | Purpose | Auto-deploys? |
|--------|---------|---------------|
| `develop` | Active development | NO |
| `main` | Production releases | YES → Railway |

**To deploy:**
1. Push changes to `develop`
2. Create PR: `develop` → `main`
3. Merge PR
4. Railway auto-deploys (~2 min)

**NEVER push directly to `main`**

See `docs/WORKFLOW.md` for full details.

---

## Railway (Production)

### Setup

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select `QRWolf` repository
4. **IMPORTANT**: Set branch to `main` in service settings

### Nixpacks Configuration

The project uses a custom `nixpacks.toml` to handle Railway builds:

```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm ci --ignore-scripts"]
cacheDirectories = []

[phases.build]
cmds = ["npm run build"]
cacheDirectories = []

[start]
cmd = "npm start"
```

**Note:** `cacheDirectories = []` prevents EBUSY cache conflicts during builds.

### Environment Variables

Add all variables from `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://otdlggbhsmgqhsviazho.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://qrwolf.com
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_YEARLY=price_...

# Optional: Plausible Analytics
NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL=https://plausible.io/js/pa-XXXXX.js
```

**Important:** Update `NEXT_PUBLIC_APP_URL` to your Railway domain.

### Rate Limiting Configuration

The API uses a hybrid rate limiting system with graceful fallback:

| Limit Type | Enforcement | Storage |
|------------|-------------|---------|
| Per-minute (60 req/min) | Optional Redis | In-memory fallback |
| Monthly (10,000 req/mo) | Database | Always enforced |

**Current Setup (Railway single instance):**
- Redis rate limiting is **disabled** by default
- In-memory rate limiting works fine for single-instance Railway deployment
- Monthly limits are always enforced via database (safe regardless)

**When to enable Redis rate limiting:**
- If you scale to multiple Railway instances
- If you need rate limits to persist across deployments
- If you see API abuse patterns in logs

**To enable distributed rate limiting:**

1. Create a free Redis database at [console.upstash.com](https://console.upstash.com)
2. Add these environment variables in Railway:

```
ENABLE_REDIS_RATE_LIMIT=true
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

**Fallback behavior:** If Redis becomes unavailable, the system automatically falls back to in-memory rate limiting with no downtime.

### Custom Domain

1. Settings → Domains → Add custom domain
2. Add DNS records as shown
3. Update `NEXT_PUBLIC_APP_URL` to custom domain
4. Update Supabase redirect URLs
5. Update Stripe webhook URL

## Supabase Config for Production

### Auth Redirect URLs

In Supabase → Authentication → URL Configuration:

- Site URL: `https://yourdomain.com`
- Redirect URLs:
  - `https://yourdomain.com/callback`
  - `https://yourdomain.com/auth/callback`

### Google OAuth (Optional)

1. Create OAuth app in Google Cloud Console
2. Add redirect URI: `https://otdlggbhsmgqhsviazho.supabase.co/auth/v1/callback`
3. Copy Client ID and Secret to Supabase → Auth → Providers → Google

## Railway CLI Commands

```bash
railway login                    # Authenticate
railway status                   # Check project status
railway domain                   # View domains
railway logs                     # View deployment logs
railway up                       # Manual deploy
```

## Post-Deployment Checklist

- [x] Verify signup/login works
- [x] Test QR code creation and saving
- [x] Test QR code list and actions (edit, delete, download)
- [x] Test dynamic QR redirect (`/r/[code]`)
- [x] Verify dashboard shows real stats
- [x] Test analytics page with scan data
- [x] Verify geolocation tracking on scans
- [x] Configure Stripe webhook for production URL
- [x] Test checkout flow with test card
- [x] Switch Stripe to live mode

## Security & GDPR Features

### CSRF Protection

The application is inherently CSRF-resistant due to:
- All mutations use `fetch()` with `Content-Type: application/json`
- Browsers enforce CORS on cross-origin JSON requests
- Supabase SSR sets `SameSite=Lax` cookies by default

**CSRF-exempt routes** (use alternative authentication):
- `/api/stripe/webhook` - Stripe signature verification
- `/api/v1/*` - API key authentication (Bearer token)
- `/api/qr/verify-password` - Public QR password check

### GDPR Data Export

Users can export all their data from Settings → Data & Privacy:
- Exports profile, QR codes, scans, folders, API keys, team memberships
- Rate limited to 1 export per 24 hours
- Excludes sensitive fields (key_hash, ip_hash)
- Sends notification email when export is ready

**API endpoint:** `GET /api/user/export`

### GDPR Account Deletion

Two-step deletion process with email confirmation:
1. User requests deletion → confirmation email sent (24-hour token)
2. User clicks email link → final confirmation with countdown
3. Execution: Cancel Stripe → Delete storage files → Delete auth user (cascades)

**Safety checks:**
- 24-hour email confirmation required
- Team ownership check (warns if user owns teams with members)
- Stripe subscription auto-canceled
- All storage files deleted

**API endpoint:** `POST /api/user/delete-account`
