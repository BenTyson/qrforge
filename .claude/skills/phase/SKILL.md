---
name: phase
description: Systematically update project phase documentation. Use when asked to "update this phase" or when a development phase has changed status (in_dev, completed, planned, etc.).
---

# QRWolf Phase Documentation Updater

Systematically update documentation when project phases change status.

## Usage

```
/phase <status> "<phase name or description>"
```

**Status Options:**
- `completed` - Phase is finished and deployed
- `in_dev` - Phase is actively being worked on
- `planned` - Phase is planned but not started
- `blocked` - Phase is blocked by dependencies

**Examples:**
- `/phase completed "Development Environment & Data Protection"`
- `/phase in_dev "Email Scan Alerts"`
- `/phase planned "Custom Domain for Short URLs"`

## Workflow

When updating a phase, systematically update these files in order:

### 1. `docs/SESSION-START.md` (Primary)

**For `completed` phases:**
- Add entry to "### Completed" section with date and bullet points
- Remove from "### Planned Enhancements" if listed there
- Update "Last Updated" date and parenthetical summary at top

**For `in_dev` phases:**
- Keep in or add to "### Planned Enhancements" with "(in development)" note
- Update "Last Updated" date at top

**For `planned` phases:**
- Add to "### Planned Enhancements" if not already there

### 2. `docs/DEVELOPMENT.md` (If Related)

Update if the phase affects:
- Development workflow
- Testing infrastructure
- CI/CD pipelines
- Environment configuration
- Safety mechanisms

Update the "Phase Status" table at the bottom:

```markdown
## Phase Status

| Item | Status |
|------|--------|
| Dev Supabase project | Completed |
| Schema sync (14 migrations) | Completed |
| ...
```

### 3. `docs/WORKFLOW.md` (If Related)

Update if the phase affects:
- Branch workflow
- Deployment process
- Environment setup
- Developer commands

### 4. Other Docs (As Needed)

- `docs/DEPLOYMENT.md` - If deployment process changes
- `docs/LAUNCH-CHECKLIST.md` - If launch items change
- `docs/STRIPE-SETUP.md` - If Stripe configuration changes

## Entry Format

### Completed Phase Entry (SESSION-START.md)

```markdown
- **Phase Name** (Month Day, Year):
  - Key accomplishment 1
  - Key accomplishment 2
  - Key accomplishment 3
  - Technical details as bullet points
```

### Planned Enhancement Entry (SESSION-START.md)

```markdown
### Planned Enhancements
- Email scan alerts
- Webhooks for scan notifications
- Custom domain for short URLs
```

## Date Format

Use: `January 17, 2026` format (full month name, day, year)

## Update Checklist

When running `/phase completed`:

1. [ ] Add completed entry to SESSION-START.md with date
2. [ ] Remove from Planned Enhancements if listed
3. [ ] Update "Last Updated" header in SESSION-START.md
4. [ ] Update DEVELOPMENT.md Phase Status table if applicable
5. [ ] Update WORKFLOW.md if workflow changes
6. [ ] Update related docs as needed
7. [ ] Verify all cross-references are correct

## Common Phases

### Recently Completed Phases
- Development Environment & Data Protection (January 17, 2026)
- Image Optimization (January 1, 2026)
- Logo Upload UX Enhancement (January 1, 2026)
- Plausible Analytics (December 31, 2025)
- Folder Organization (December 31, 2025)

### Planned Phases (from SESSION-START.md)
- Email scan alerts
- Webhooks for scan notifications
- Custom domain for short URLs
- Event QR type
- Geo QR type
- Calendar QR type
- Custom module shapes
- Logo background styles
- Decorative frames
- Custom eye patterns

## Example Update

If user says: `/phase completed "Email Scan Alerts"`

1. Add to SESSION-START.md Completed section:
```markdown
- **Email Scan Alerts** (January 20, 2026):
  - Configurable email notifications when QR codes are scanned
  - Threshold settings (every scan, daily digest, custom)
  - Resend integration for reliable delivery
  - Pro+ feature with tier gating
```

2. Remove from Planned Enhancements section

3. Update header:
```markdown
> **Last Updated**: January 20, 2026 (Email Scan Alerts)
```

4. If relevant, update DEVELOPMENT.md Phase Status table
