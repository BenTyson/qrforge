# Development Workflow

> **Last Updated**: December 28, 2025
> **Live URL**: https://qrwolf.com

See also: `docs/SESSION-START.md` for full project context

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
3. Go to GitHub: https://github.com/BenTyson/qrforge
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

### Local Development
- Uses `.env.local` for environment variables
- Supabase: Connected to production database (be careful!)
- Stripe: Uses test mode keys
- Run: `npm run dev` (port 3322)

### Production (Railway)
- Environment variables set in Railway dashboard
- Supabase: Production database
- Stripe: Switch to live keys when ready
- URL: https://qrwolf.com

## Railway Configuration

**IMPORTANT**: Verify Railway is set to deploy from `main` branch:

1. Go to Railway dashboard → QRForge project
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

### Agent Workflow
```bash
# At start of session
git checkout develop
git pull origin develop

# After making changes
git add .
git commit -m "Description of changes"
git push origin develop

# Tell user:
# "Changes pushed to develop. Create a PR to main when ready to deploy."
```
