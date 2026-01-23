# QRWolf - Project Overview

> **Live URL**: https://qrwolf.com
> **Admin**: https://qrwolf.com/admin (ideaswithben@gmail.com)
> **Status**: Production with paying customers

---

## What is QRWolf?

Premium QR code generator with analytics and dynamic codes. Goal: passive income via SEO-driven traffic and recurring subscriptions.

**Revenue model**: Dynamic QR codes create lock-in - users print QR codes on menus/cards, codes point to our redirect URL, they can't churn without reprinting materials.

---

## QR Code Types (17 Total)

### Basic Types (All Tiers)
| Type | Output |
|------|--------|
| URL | Direct URL |
| Text | Plain text |
| WiFi | WiFi connect |
| vCard | Contact card |
| Email | mailto: link |
| Phone | tel: link |
| SMS | sms: link |

### Simple URL Types (All Tiers)
| Type | Output |
|------|--------|
| WhatsApp | wa.me link |
| Facebook | facebook.com link |
| Instagram | instagram.com link |
| Apps | Smart app redirect |
| Google Review | Google review link |

### File Upload Types (Pro+)
| Type | Landing Page |
|------|--------------|
| PDF | Viewer + download |
| Images | Lightbox gallery |
| Video | YouTube/Vimeo/upload |
| MP3 | Audio player |

### Landing Page Types (Pro+)
| Type | Landing Page |
|------|--------------|
| Menu | Restaurant menu |
| Business | Digital business card |
| Links | Linktree-style page |
| Coupon | Promo code display |
| Social | Social media profile |

---

## Business Model

| Tier | Price | Dynamic QRs | Analytics | Key Features |
|------|-------|-------------|-----------|--------------|
| Free | $0 | 0 | No | Basic types, 100 scans/mo |
| Pro | $9/mo | 50 | Yes | All types, logo, landing pages, 10k scans/mo |
| Business | $29/mo | Unlimited | Yes | Bulk generation, API access, unlimited scans |

---

## Tech Stack

- **Framework**: Next.js 15, TypeScript, Tailwind CSS v4
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe (subscriptions + checkout)
- **Hosting**: Railway (auto-deploy from `main`)
- **Email**: Resend (transactional emails)
- **Analytics**: Plausible (privacy-first)

---

## Environments

| Environment | Supabase Project | Used By |
|-------------|------------------|---------|
| **Dev** | `fxcvxomvkgioxwbwmbsy` | `npm run dev` |
| **Production** | `otdlggbhsmgqhsviazho` | Railway |

**Never connect dev to production database.**

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── blog/, learn/               # SEO content (127 articles)
│   ├── tools/                      # Free tools (size calc, contrast, reader)
│   ├── (auth)/                     # Login, signup, callback
│   ├── (dashboard)/                # Protected dashboard pages
│   ├── (admin)/admin/              # Admin dashboard
│   ├── api/                        # API routes
│   │   ├── stripe/                 # Checkout, webhooks, portal
│   │   ├── qr/                     # QR operations
│   │   ├── v1/                     # Public REST API (Business)
│   │   └── admin/                  # Admin actions
│   ├── checkout/[plan]/            # Stripe Elements checkout
│   └── r/[code]/                   # Dynamic QR redirect + landing pages
├── components/
│   ├── qr/                         # QR generator, forms, studio
│   ├── homepage/                   # Modular homepage sections
│   ├── admin/                      # Admin components
│   ├── analytics/                  # Charts (Recharts)
│   └── content/                    # Blog/Learn MDX components
├── content/                        # MDX articles (Velite)
│   ├── blog/                       # Blog posts
│   └── learn/                      # Knowledge base
├── lib/
│   ├── qr/                         # QR generation logic
│   ├── supabase/                   # Database clients
│   ├── stripe/                     # Payment config
│   └── api/                        # API auth helpers
└── emails/                         # React Email templates
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Users + subscription state |
| `qr_codes` | QR codes + content + style |
| `scans` | Scan analytics (device, location) |
| `folders` | QR organization (Pro+) |
| `api_keys` | API authentication (Business) |
| `teams`, `team_members`, `team_invites` | Team management |
| `admin_audit_log` | Admin action tracking |

**Storage buckets**: `qr-logos`, `qr-media`

---

## Key Routes

### Landing Pages
- `/r/[code]` - Dynamic redirect
- `/r/[code]/pdf` - PDF viewer
- `/r/[code]/gallery` - Image gallery
- `/r/[code]/video` - Video player
- `/r/[code]/audio` - Audio player
- `/r/[code]/menu` - Restaurant menu
- `/r/[code]/business` - Business card
- `/r/[code]/links` - Link list
- `/r/[code]/coupon` - Coupon display
- `/r/[code]/social` - Social profile
- `/r/[code]/review` - Google review

### Tools
- `/tools` - Tools hub
- `/tools/size-calculator` - QR size calculator
- `/tools/contrast-checker` - Color contrast checker
- `/tools/qr-reader` - QR code decoder

---

## Content Stats

- **Blog posts**: 36
- **Learn articles**: 91
- **Total**: 127 articles
- **Target**: 150 articles

See `.claude/skills/content/CONTENT-PLAN.md` for SEO strategy.

---

## Adding New QR Types

See `.claude/skills/qr-type/SKILL.md` for the checklist. Key files:

1. `src/lib/qr/types.ts` - Type definitions
2. `src/components/qr/forms/[Type]Form.tsx` - Form component
3. `src/components/qr/QRPreview.tsx` - Add `hasValidContent` case
4. `src/components/qr/studio/hooks/useQRStudioState.ts` - Add `isContentValid` case
5. `src/lib/qr/generator.ts` - Validation
6. `src/lib/api/auth.ts` - API validation
7. `src/app/r/[code]/route.ts` - Routing
8. `supabase/migrations/` - Database constraint

---

## Common Gotchas

1. **QR preview not showing**: Add case to `QRPreview.tsx` `hasValidContent` switch
2. **"Continue" button disabled**: Add case to `useQRStudioState.ts` `isContentValid`
3. **Save fails with constraint error**: Run migration on correct Supabase (dev vs prod)
4. **Downloads encode wrong content**: Check `short_code` exists, not `type === 'dynamic'`

---

## Related Docs

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Dev environment, testing
- [WORKFLOW.md](./WORKFLOW.md) - Branch workflow, agent rules
- [FEATURE-ROADMAP.md](./FEATURE-ROADMAP.md) - What to build next
- [sessions/CHANGELOG.md](./sessions/CHANGELOG.md) - Session history
