# Claude Code Project Guidelines

## LIVE PRODUCTION WARNING

**This project has LIVE PAYING CUSTOMERS.** Production data is real customer data. Do not run migrations, destructive operations, or untested code against production without explicit approval.

---

## Supabase Environments

**CRITICAL**: This project has TWO Supabase instances:

| Environment | Project Ref | Used By |
|-------------|-------------|---------|
| **Dev** | `fxcvxomvkgioxwbwmbsy` | Local dev server (`npm run dev`) |
| **Production** | `otdlggbhsmgqhsviazho` | Production deployment |

### Before Running Migrations

1. **Check which project is linked**: `npx supabase projects list` (look for the bullet)
2. **Link to the correct project**:
   - For dev work: `npx supabase link --project-ref fxcvxomvkgioxwbwmbsy`
   - For production: `npx supabase link --project-ref otdlggbhsmgqhsviazho`
3. **Then push**: `npx supabase db push`

**Rule**: When running `npm run dev`, **ALWAYS** push migrations to **dev** first. Production has paying customers - never experiment there.

---

## Branch Workflow

```
YOU ARE ON: develop (default)
PRODUCTION: main (DO NOT push directly)
```

**Before making changes:**
```bash
git branch              # Should show: * develop
git checkout develop    # If not on develop
git pull origin develop
```

**After finishing work:**
```bash
npm run precommit       # lint + type-check + test
git push origin develop
# Tell user: "Changes pushed to develop. Create PR to main to deploy."
```

**NEVER run:** `git push origin main`

---

## Testing

```bash
npm test              # Run all 185 tests
npm run test:watch    # Watch mode
npm run precommit     # lint + type-check + test (ALWAYS run before commits)
```

---

## Adding New QR Types

See `.claude/skills/qr-type/SKILL.md` for the comprehensive checklist. Key files:

1. `src/lib/qr/types.ts` - Type definitions
2. `src/components/qr/forms/[Type]Form.tsx` - Form component
3. `src/components/qr/QRPreview.tsx` - Add `hasValidContent` case
4. `src/components/qr/studio/hooks/useQRStudioState.ts` - Add `isContentValid` case
5. `src/lib/qr/generator.ts` - Validation
6. `src/lib/api/auth.ts` - API validation
7. `src/app/r/[code]/route.ts` - Routing
8. `supabase/migrations/` - Database constraint

---

## Content Guidelines

- Use `/content` skill for blog/learn articles
- See `.claude/skills/content/CONTENT-PLAN.md` for SEO strategy
- See `.claude/skills/content/BULLET-BLOAT-AUDIT.md` for quality standards
- **Prose-first**: Avoid outline-style bullet lists

---

## Key Documentation

| Doc | Purpose |
|-----|---------|
| `docs/README.md` | Entry point - quick links to all docs |
| `docs/PROJECT.md` | Project overview, features, structure |
| `docs/DEVELOPMENT.md` | Dev environment, testing, CI/CD |
| `docs/WORKFLOW.md` | Branch workflow, agent rules |
| `docs/FEATURE-ROADMAP.md` | Planned features |
| `docs/sessions/CHANGELOG.md` | Session history |

---

## Common Gotchas

1. **QR preview not showing**: Add case to `QRPreview.tsx` `hasValidContent` switch
2. **"Continue" button disabled**: Add case to `useQRStudioState.ts` `isContentValid`
3. **Save fails with constraint error**: Run migration on correct Supabase (dev vs prod)
4. **Downloads encode wrong content**: Check `short_code` exists, not `type === 'dynamic'`
