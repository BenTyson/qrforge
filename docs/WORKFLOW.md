# Development Workflow

> **Last Updated**: January 19, 2026
> **Live URL**: https://qrwolf.com

See also:
- `docs/SESSION-START.md` - Full project context
- `docs/DEVELOPMENT.md` - Dev environment setup & testing

---

## ⛔ LIVE PAYING USERS - READ FIRST

> **Production contains REAL CUSTOMER DATA from paying subscribers.**
>
> Their QR codes are printed on physical materials. Breaking production breaks their businesses.

**Consequences of production mistakes:**
- Customer QR codes stop working → their printed menus/cards become useless
- Data corruption → customers lose their analytics and QR code history
- Payment data issues → legal and trust implications

**Always use the dev database for development:** `npm run safety-check`

---

## Branch Strategy

```
develop (default) ──PR──> main (production)
    ↓                        ↓
 Local dev              Railway auto-deploys
```

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `develop` | Active development, default branch | Nothing (local only) |
| `main` | Production releases only | Railway (live site) |

## Golden Rules

1. **NEVER push directly to `main`** - Always use a PR from `develop`
2. **All development happens on `develop`** - This is your working branch
3. **`main` = production** - Anything merged to `main` goes live immediately
4. **Test locally before PR** - Run `npm run build` before creating PR

## Daily Workflow

### Starting Work
```bash
cd /Users/bentyson/QRForge
git checkout develop
git pull origin develop
```

### Making Changes
```bash
# Work on develop branch
git add .
git commit -m "Your commit message"
git push origin develop
```

### Deploying to Production
1. Ensure all changes are committed and pushed to `develop`
2. Run `npm run build` locally to verify no errors
3. Go to GitHub: https://github.com/BenTyson/qrwolf
4. Click "Pull requests" → "New pull request"
5. Set: `base: main` ← `compare: develop`
6. Create PR with descriptive title
7. Review changes, then "Merge pull request"
8. Railway auto-deploys within ~2 minutes

### Checking Deployment Status
```bash
railway status
railway logs
```

Or visit: https://qrwolf.com

## Rollback (If Something Breaks)

### Quick Rollback via GitHub
1. Go to the merged PR on GitHub
2. Click "Revert" button
3. Merge the revert PR to `main`
4. Railway auto-deploys the rollback

### Manual Rollback
```bash
git checkout main
git revert HEAD
git push origin main
```

## Environment Setup

### Local Development (Safe Mode)

**IMPORTANT**: Development now uses a **separate dev Supabase database** to protect customer data.

```
Local dev → Dev Supabase (fxcvxomvkgioxwbwmbsy)
Production → Prod Supabase (otdlggbhsmgqhsviazho)
```

- Uses `.env.development.local` for dev credentials
- Supabase: **Development database** (safe to experiment!)
- Stripe: Uses test mode keys
- Run: `npm run dev` (port 3322)
- Safety check runs automatically on startup

**Before Starting:**
```bash
npm run safety-check   # Verify dev environment is configured
npm run dev            # Start dev server
```

See `docs/DEVELOPMENT.md` for full environment setup.

### Production (Railway) ⛔ LIVE CUSTOMERS
- Environment variables set in Railway dashboard
- Supabase: **Production database** → REAL CUSTOMER DATA
- Stripe: **Live mode keys** → REAL PAYMENTS
- URL: https://qrwolf.com
- **NEVER test against production. NEVER run scripts against production.**

## Railway Configuration

**IMPORTANT**: Verify Railway is set to deploy from `main` branch:

1. Go to Railway dashboard → QRWolf project
2. Click on the service → Settings
3. Under "Source", ensure "Branch" is set to `main`
4. If it shows `develop`, change it to `main`

## For AI Agents

**CRITICAL INSTRUCTIONS FOR FUTURE AGENTS:**

1. Always check which branch you're on: `git branch`
2. If on `main`, switch to `develop`: `git checkout develop`
3. Never commit directly to `main`
4. After finishing work, remind user to create PR to deploy
5. Do NOT run `git push origin main` unless explicitly merging a PR
6. **Run tests before committing**: `npm run precommit`

### Agent Workflow
```bash
# At start of session
git checkout develop
git pull origin develop
npm run safety-check  # Verify dev environment

# After making changes
npm run precommit     # Run lint + type-check + test
git add .
git commit -m "Description of changes"
git push origin develop

# Tell user:
# "Changes pushed to develop. Create a PR to main when ready to deploy."
```

### Testing Commands
```bash
npm test              # Run all tests (159 tests)
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
npm run precommit     # lint + type-check + test (run before commits)
```
