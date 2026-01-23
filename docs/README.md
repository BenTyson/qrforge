# QRWolf Documentation

> **Live**: https://qrwolf.com | **Status**: Production with paying customers

## Quick Start for Agents

```bash
git checkout develop        # Always work on develop
git pull origin develop
npm run safety-check        # Verify dev database
npm run dev                 # Port 3322
```

## Documentation Map

| Doc | When to Read |
|-----|--------------|
| **[PROJECT.md](./PROJECT.md)** | Start here - project overview, features, structure |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | Dev environment, testing, safety mechanisms |
| **[WORKFLOW.md](./WORKFLOW.md)** | Branch workflow, deployment, agent rules |
| **[FEATURE-ROADMAP.md](./FEATURE-ROADMAP.md)** | What to build next |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Railway production deployment |

## Reference (Rarely Needed)

| Doc | Contents |
|-----|----------|
| [reference/STRIPE-SETUP.md](./reference/STRIPE-SETUP.md) | Stripe integration details |
| [reference/SUPABASE-EMAIL-TEMPLATES.md](./reference/SUPABASE-EMAIL-TEMPLATES.md) | Email template HTML |

## Session History

| Doc | Contents |
|-----|----------|
| [sessions/CHANGELOG.md](./sessions/CHANGELOG.md) | Dated session history |
| [sessions/LAUNCH-CHECKLIST.md](./sessions/LAUNCH-CHECKLIST.md) | Completed launch checklist |

## Critical Rules

1. **Never push to `main`** - Always use `develop` branch
2. **Never connect dev to production DB** - Use `npm run safety-check`
3. **Run tests before commits** - `npm run precommit`
4. **Production has paying customers** - No experiments on prod

## Key Commands

```bash
npm run dev           # Start dev server (port 3322)
npm run precommit     # lint + type-check + test
npm test              # Run 185 tests
git push origin develop  # Push changes (NOT main!)
```
