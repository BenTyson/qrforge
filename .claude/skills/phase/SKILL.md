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

### 1. `docs/sessions/CHANGELOG.md` (Primary)

**For `completed` phases:**
- Add entry at the TOP with date and bullet points
- Use the same format as existing entries

**Example entry:**
```markdown
## January 20, 2026

### Phase Name
- Key accomplishment 1
- Key accomplishment 2
- Technical details as bullet points
```

### 2. `docs/FEATURE-ROADMAP.md` (If Feature)

**For `completed` features:**
- Move from "NEXT UP" section to "Completed Features" table
- Add completion date and notes

**For `in_dev` features:**
- Add "(in development)" note to the feature

### 3. `docs/PROJECT.md` (If Major Change)

Update if the phase affects:
- QR types (add to types table)
- Business model (pricing, features)
- Tech stack
- Project structure
- Database tables

### 4. `docs/DEVELOPMENT.md` (If Dev Workflow)

Update if the phase affects:
- Testing infrastructure
- CI/CD pipelines
- Environment configuration
- Safety mechanisms

### 5. Other Docs (As Needed)

- `docs/WORKFLOW.md` - If deployment/branch process changes
- `docs/DEPLOYMENT.md` - If deployment configuration changes

## Update Checklist

When running `/phase completed`:

1. [ ] Add completed entry to sessions/CHANGELOG.md with date
2. [ ] Update FEATURE-ROADMAP.md if it's a tracked feature
3. [ ] Update PROJECT.md if major project changes
4. [ ] Update DEVELOPMENT.md if dev workflow changes
5. [ ] Update other docs as needed
6. [ ] Verify all cross-references are correct

## Date Format

Use: `January 17, 2026` format (full month name, day, year)

## Example Update

If user says: `/phase completed "Email Scan Alerts"`

1. Add to sessions/CHANGELOG.md at TOP:
```markdown
## January 20, 2026

### Email Scan Alerts
- Configurable email notifications when QR codes are scanned
- Threshold settings (every scan, daily digest, custom)
- Resend integration for reliable delivery
- Pro+ feature with tier gating
```

2. Move from FEATURE-ROADMAP.md "NEXT UP" to "Completed Features" table

3. If relevant, update PROJECT.md features list
