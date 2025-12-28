# Deployment Guide

> **Live URL**: https://qrforge-production.up.railway.app

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
3. Select `QRForge` repository
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
NEXT_PUBLIC_APP_URL=https://qrforge-production.up.railway.app
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_YEARLY=price_...
```

**Important:** Update `NEXT_PUBLIC_APP_URL` to your Railway domain.

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
- [ ] Configure Stripe webhook for production URL
- [ ] Test checkout flow with test card
- [ ] Switch Stripe to live mode when ready
