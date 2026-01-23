# Development Workflow

> **Live URL**: https://qrwolf.com
> **Branch**: `develop` (default) → PR → `main` (production)

---

## Critical Safety Rules

**Production has LIVE PAYING CUSTOMERS. Their QR codes are printed on physical materials.**

1. **Never push to `main`** - Always work on `develop`
2. **Never connect dev to production DB** - Run `npm run safety-check`
3. **Run tests before commits** - `npm run precommit`
4. **Test locally before PRs** - Run `npm run build`

---

## Branch Strategy

```
develop (default) ──PR──> main ──auto──> Railway (production)
```

| Branch | Purpose | Auto-deploys? |
|--------|---------|---------------|
| `develop` | Active development | No |
| `main` | Production releases | Yes → Railway |

---

## Daily Workflow

### Starting Work

```bash
git branch                # Should show: * develop
git checkout develop      # If not on develop
git pull origin develop
npm run safety-check      # Verify dev database
```

### Making Changes

```bash
# Work on files...
npm run precommit         # lint + type-check + test
git add <files>           # Add specific files (not git add .)
git commit -m "Description"
git push origin develop
```

### Deploying to Production

1. Ensure all changes pushed to `develop`
2. Run `npm run build` locally
3. Create PR: `develop` → `main` on GitHub
4. Merge PR
5. Railway auto-deploys (~2 min)

---

## Commands Reference

### Safe Commands

```bash
git checkout develop          # Switch to develop
git pull origin develop       # Get latest
git push origin develop       # Push changes
git status                    # Check status
npm run dev                   # Start dev server (port 3322)
npm run precommit             # lint + type-check + test
npm test                      # Run tests only
```

### Dangerous Commands (Avoid)

```bash
git push origin main          # NO - bypasses PR
git checkout main && git push # NO
git merge main                # NO - wrong direction
git add .                     # Avoid - use specific files
```

---

## Testing

```bash
npm test              # Run all 185 tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
npm run precommit     # lint + type-check + test (before commits!)
```

### Test Suite

| Suite | Tests | Coverage |
|-------|-------|----------|
| API Validation | 47 | URL validation, hex colors, content types |
| QR Generation | 58 | Content generation, WiFi, vCard |
| Subscription Plans | 31 | Tier limits, features, scan limits |
| Environment Safety | 23 | Environment detection, safety blocks |
| useQRStudioState | 16 | State management, race conditions |
| QR Creation Flow | 10 | Integration tests |

---

## Environments

| Environment | Supabase | Purpose |
|-------------|----------|---------|
| Dev | `fxcvxomvkgioxwbwmbsy` | Local development |
| Production | `otdlggbhsmgqhsviazho` | Live customers |

### Before Running Migrations

```bash
# Check which project is linked
npx supabase projects list

# Link to correct project
npx supabase link --project-ref fxcvxomvkgioxwbwmbsy  # Dev
npx supabase link --project-ref otdlggbhsmgqhsviazho  # Prod (careful!)

# Push migration
npx supabase db push
```

**Always push to dev first. Never experiment on production.**

---

## Agent Instructions

### At Session Start

```bash
git branch              # Verify on develop
git checkout develop    # If not
git pull origin develop
npm run safety-check    # Verify dev environment
```

### At Session End

```bash
npm run precommit       # Run lint + type-check + test
git push origin develop
# Tell user: "Changes pushed to develop. Create PR to main to deploy."
```

### Never Do

- Push to `main` directly
- Create PRs automatically
- Merge anything without user approval
- Run destructive operations on production

---

## Rollback (If Production Breaks)

### Via GitHub
1. Go to merged PR
2. Click "Revert"
3. Merge the revert PR

### Via CLI
```bash
git checkout main
git revert HEAD
git push origin main
git checkout develop
```

---

## Related Docs

- [PROJECT.md](./PROJECT.md) - Project overview
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Dev environment details
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Railway configuration
