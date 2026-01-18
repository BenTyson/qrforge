# Development Environment Guide

> **Last Updated**: January 17, 2026
> **Status**: COMPLETED
> **Phase**: Development Environment & Data Protection

See also: `docs/SESSION-START.md` for full project context

---

## Overview

QRWolf uses a **separated development environment** to protect production customer data. Local development connects to a dedicated dev Supabase instance, not production.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT                        │
│  npm run dev (port 3322)                                    │
│  .env.development.local                                      │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────┐                                    │
│  │  Dev Supabase       │  fxcvxomvkgioxwbwmbsy              │
│  │  (Safe to experiment)│                                    │
│  └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION                              │
│  Railway (auto-deploys from main)                           │
│  Railway environment variables                               │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────┐                                    │
│  │  Prod Supabase      │  otdlggbhsmgqhsviazho              │
│  │  (LIVE CUSTOMERS)   │                                    │
│  └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

## Environment Files

| File | Purpose | Git Status |
|------|---------|------------|
| `.env.local` | Production credentials (Railway uses these) | Ignored |
| `.env.development.local` | Dev Supabase credentials | Ignored |
| `.env.test.local` | Test environment (local Supabase) | Ignored |
| `.env.local.example` | Template for new developers | Tracked |
| `.env.development.local.example` | Template for dev setup | Tracked |

## Safety Mechanisms

### 1. Environment Validation (`src/lib/env/validate.ts`)

Detects dangerous configurations and blocks them:

```typescript
// BLOCKED: Dev environment + Production database
if (isDevelopment && isProductionDatabase) {
  throw new EnvironmentValidationError("DANGER: Development connected to PRODUCTION!");
}
```

### 2. Startup Safety Check

Run before starting the dev server:

```bash
npm run safety-check
```

Output:
```
============================================================
  QRWolf Environment Safety Check
============================================================

  SAFE
  Development mode - Safe to experiment

  Environment: development
  Database:    https://fxcvxomvkgioxwbwmbsy.supabase.co
  Production:  No

  Ready to start development server!
============================================================
```

### 3. Safe Admin Client (`src/lib/supabase/safe-admin.ts`)

Wraps destructive database operations with environment checks:

```typescript
// Blocks DELETE/TRUNCATE in production
await safeAdminClient.safeDelete('profiles', { id: userId });
```

## Supabase Projects

| Project | Ref ID | Purpose |
|---------|--------|---------|
| **qrwolf** (prod) | `otdlggbhsmgqhsviazho` | Live customers |
| **qrwolf-dev** | `fxcvxomvkgioxwbwmbsy` | Development/testing |

### Syncing Schema to Dev

When you add migrations to production, push them to dev:

```bash
supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.fxcvxomvkgioxwbwmbsy.supabase.co:5432/postgres"
```

## Testing Infrastructure

### Test Suite

**159 tests** across 4 test suites:

| Suite | Tests | Coverage |
|-------|-------|----------|
| API Validation | 47 | URL validation, hex colors, content types, API keys |
| QR Generation | 58 | Content generation, WiFi, vCard, validation |
| Subscription Plans | 31 | Tier limits, features, scan limits |
| Environment Safety | 23 | Environment detection, safety blocks |

### Commands

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
npm run test:ci       # CI mode (used by GitHub Actions)
```

### Test Data Factories

Located in `src/lib/test/factories.ts`:

```typescript
import { createMockProfile, createMockQRCode, createMockScan } from '@/lib/test/factories';

const profile = createMockProfile({ subscription_tier: 'pro' });
const qrCode = createMockQRCode({ user_id: profile.id });
const scans = createMockScans(50, qrCode.id);
```

## CI/CD Pipeline

### GitHub Actions Workflows

**`.github/workflows/ci.yml`** - Main CI pipeline:
- **lint** - ESLint
- **type-check** - TypeScript compiler
- **test** - Jest with coverage
- **build** - Next.js build (requires lint/type-check/test)
- **security-check** - Blocks hardcoded production secrets

**`.github/workflows/pr-check.yml`** - PR warnings:
- Warns on database migrations
- Warns on environment config changes
- Validates branch protection rules

### Workflow Diagram

```
Push to develop
      │
      ▼
┌─────────────┐
│    lint     │───────┐
└─────────────┘       │
                      │
┌─────────────┐       │
│ type-check  │───────┼──▶ build (requires all 3)
└─────────────┘       │
                      │
┌─────────────┐       │
│    test     │───────┘
└─────────────┘

PR to main
      │
      ▼
┌─────────────────────┐
│  ci.yml + pr-check  │
│  - All CI checks    │
│  - Migration warn   │
│  - Env change warn  │
└─────────────────────┘
```

## NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server (port 3322) |
| `npm run build` | Production build |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | With coverage |
| `npm run test:ci` | CI mode |
| `npm run type-check` | TypeScript validation |
| `npm run safety-check` | Environment safety verification |
| `npm run precommit` | lint + type-check + test |

## Quick Start

```bash
# 1. Verify safe environment
npm run safety-check

# 2. Start development
npm run dev

# 3. Run tests before committing
npm run precommit

# 4. Push to develop
git push origin develop
```

## Troubleshooting

### "DANGER: Development connected to PRODUCTION!"

Your `.env.development.local` is missing or has wrong credentials.

**Fix:**
1. Copy `.env.development.local.example` to `.env.development.local`
2. Add dev Supabase credentials (project: `fxcvxomvkgioxwbwmbsy`)

### Tests Failing with Database Errors

Tests use mocked Supabase by default. If you see connection errors:

1. Check `jest.setup.ts` has correct mock URLs
2. Ensure `ENVIRONMENT=test` in test setup

### CI Failing on Security Check

You accidentally committed a production secret.

**Fix:**
1. Remove the secret from code
2. Rotate the exposed secret in Supabase/Stripe dashboards
3. Force push to remove from git history (if needed)

---

## Phase Status

| Item | Status |
|------|--------|
| Dev Supabase project | Completed |
| Schema sync (14 migrations) | Completed |
| Environment validation | Completed |
| Safety check script | Completed |
| Safe admin client | Completed |
| Jest configuration | Completed |
| Test suite (159 tests) | Completed |
| CI/CD workflows | Completed |
| Documentation | Completed |
