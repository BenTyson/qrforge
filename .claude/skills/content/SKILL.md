---
name: content
description: Generate blog posts and learn articles for QRWolf. Use when asked to create /blog or /learn content, write articles about QR codes, or produce SEO content for the knowledge base.
---

# QRWolf Content Generator

Generate MDX content for the blog and learn sections of QRWolf.

## Usage

```
/content blog "Title or topic for the blog post"
/content learn <category> "Title or topic for the article"
```

**Examples:**
- `/content blog "5 Ways Restaurants Use QR Codes"`
- `/content learn use-cases "QR Codes for Event Ticketing"`
- `/content learn qr-basics "How QR Code Error Correction Works"`

## Content Types

### Blog Posts

Location: `content/blog/2025/[slug].mdx`

**Frontmatter Schema:**
```yaml
---
title: "Title Here" # max 100 chars
description: "SEO description" # max 300 chars
date: 2025-01-15 # ISO date
author: "QRWolf Team"
category: "guides" | "news" | "tutorials" | "case-studies"
tags: ["tag1", "tag2"] # relevant keywords
featured: false # set true for homepage feature
draft: false
---
```

**Categories:**
- `guides` - How-to guides and walkthroughs
- `news` - Industry news and QRWolf updates
- `tutorials` - Step-by-step tutorials
- `case-studies` - Customer success stories

### Learn Articles

Location: `content/learn/[category]/[slug].mdx`

**Frontmatter Schema:**
```yaml
---
title: "Title Here" # max 100 chars
description: "SEO description" # max 300 chars
category: "qr-basics" | "how-it-works" | "use-cases" | "industries" | "best-practices" | "technical"
order: 1 # display order within category (lower = first)
tags: ["tag1", "tag2"]
relatedSlugs: ["what-is-a-qr-code", "static-vs-dynamic-qr-codes"] # existing article slugs
draft: false
---
```

**Categories:**
- `qr-basics` - Fundamental QR code concepts
- `how-it-works` - Technical explanations
- `use-cases` - Specific applications
- `industries` - Industry-specific guides
- `best-practices` - Design and implementation tips
- `technical` - Developer-focused content

## Content Guidelines

### Structure
1. Start with an engaging intro paragraph (no H1 - title is from frontmatter)
2. Use H2 (`##`) for main sections
3. Use H3 (`###`) for subsections
4. Include 4-8 main sections depending on topic depth
5. End with a conclusion and CTA

### Formatting Patterns
- Use `**bold**` for key terms on first mention
- Use bullet lists for features/benefits
- Use numbered lists for steps/processes
- Use tables for comparisons
- Include code blocks for technical content

### Callout Component
Use for tips, warnings, and important notes:

```mdx
<Callout type="info" title="Did You Know?">
Interesting fact or context here.
</Callout>

<Callout type="tip" title="Pro Tip">
Actionable advice here.
</Callout>

<Callout type="warning" title="Important">
Critical information here.
</Callout>
```

Types: `info`, `tip`, `warning`, `error`, `note`

### Internal Links
- Link to signup: `[Get started free](/signup)`
- Link to learn articles: `[article title](/learn/slug-here)`
- Link to blog posts: `[post title](/blog/slug-here)`

### CTAs
Include natural calls-to-action:
- Near the end: "Ready to create your first QR code? [Get started for free](/signup) with QRWolf."
- After explaining a Pro feature: "This feature is available on [Pro and Business plans](/plans)."

## SEO Keywords to Target

Incorporate these naturally based on topic relevance:

**Primary:**
- qr code generator, free qr code, qr code maker
- dynamic qr code, qr code tracking, qr code analytics

**By Type:**
- wifi qr code, menu qr code, vcard qr code
- restaurant qr code, business qr code, digital business card qr
- whatsapp qr code, instagram qr code, facebook qr code
- pdf qr code, video qr code, linktree alternative qr
- coupon qr code, social media qr code

**Educational:**
- what is a qr code, how qr codes work, qr code history
- static vs dynamic qr code, qr code best practices
- qr code size requirements, qr code error correction

## QRWolf Features to Reference

When relevant, mention these platform capabilities:

**Free Tier:**
- 11 QR types (URL, Text, WiFi, vCard, Email, Phone, SMS, WhatsApp, Facebook, Instagram, Apps)
- Basic customization (colors, patterns)
- PNG/SVG download

**Pro Tier ($9/mo):**
- All 16 QR types including file uploads and landing pages
- Dynamic QR codes (50 limit)
- Full analytics dashboard
- Logo upload
- Expiration dates
- Password protection
- Scan tracking with geolocation

**Business Tier ($29/mo):**
- Unlimited dynamic QR codes
- Bulk generation via CSV
- REST API access (10k requests/mo)
- Team members (up to 3)

## Existing Content Reference

Check existing articles before creating to avoid duplication and set up proper `relatedSlugs`:

**Blog:**
- `qr-codes-in-2025` - 2025 trends overview

**Learn - qr-basics:**
- `what-is-a-qr-code` - Beginner introduction
- `static-vs-dynamic-qr-codes` - Comparison article

**Learn - use-cases:**
- `restaurant-menu-qr-codes` - Restaurant menus
- `business-card-qr-codes` - Digital business cards

## Workflow

1. Determine content type (blog or learn)
2. Choose appropriate category
3. Generate slug from title (lowercase, hyphens, no special chars)
4. Create file at correct path
5. Write content following guidelines above
6. Suggest related articles for cross-linking
7. Build to verify: `npm run build`

## Quality Checklist

Before finalizing content:
- [ ] Title under 100 characters
- [ ] Description under 300 characters, includes primary keyword
- [ ] Proper frontmatter with all required fields
- [ ] 800-1500 words for blog, 600-1200 for learn
- [ ] At least one Callout component
- [ ] Internal links to related content
- [ ] CTA to /signup or /plans
- [ ] No duplicate content with existing articles
- [ ] relatedSlugs reference actual existing articles
