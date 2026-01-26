---
name: content
description: Generate blog posts and learn articles for QRWolf. Use when asked to create /blog or /learn content, write articles about QR codes, or produce SEO content for the knowledge base.
---

# QRWolf Content Generator

Generate MDX content for the blog and learn sections of QRWolf.

---

## CRITICAL: NO BULLET BLOAT

**This is the #1 quality requirement. Violations are unacceptable.**

An audit found that 14% of previously generated content was so bullet-heavy it reads like an outline rather than an article. This damages the brand and wastes the content investment.

### The Hard Rules

1. **Maximum 20% of article content should be in bullet/list form**
2. **Every H2 section MUST start with 2-4 paragraphs of prose BEFORE any list**
3. **Never have back-to-back bullet lists in the same section**
4. **"Use cases" and "Benefits" sections must be PROSE, not lists**

### Instant Fail Patterns

These patterns indicate an article that needs to be rewritten:

```markdown
## Benefits of X

X offers several advantages:

- **Benefit 1** - Description here
- **Benefit 2** - Description here
- **Benefit 3** - Description here
```

```markdown
## Use Cases

### Use Case 1
- Point A
- Point B

### Use Case 2
- Point A
- Point B
```

```markdown
## How to Do X

1. Step one
2. Step two
3. Step three

## Best Practices

- Practice 1
- Practice 2
- Practice 3
```

**ALL of the above are WRONG.** They read like internal notes, not published content.

### What These Sections Should Look Like

```markdown
## Why X Changes Everything

Imagine [concrete scenario that illustrates the problem]. With traditional
approaches, you'd face [specific pain point]. X eliminates this entirely.

The key insight is [explanation of how it works]. When someone [action],
the system [what happens], which means [benefit]. This transforms the
experience from [before state] to [after state].

The implications extend further. [Second benefit explained in context].
[Third benefit explained with example]. Each of these capabilities builds
on the core concept to create something genuinely more powerful than the
sum of its parts.
```

See the difference? The good version **tells a story**, **explains WHY**, and **uses concrete examples**. The bad version just lists facts.

---

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

Location: `content/blog/2026/[slug].mdx`

**Frontmatter Schema:**
```yaml
---
title: "Title Here" # max 100 chars
description: "SEO description" # max 300 chars
date: 2026-01-20 # ISO date
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

---

## Writing Quality: The #1 Priority

**Write articles people actually want to read, not outlines dressed as articles.**

The biggest mistake is treating articles as formatted lists of facts. Readers came for insight, explanation, and understanding - not bullet points they could have gotten from a Google snippet.

### Prose First, Always

Every section should be primarily **flowing paragraphs** that develop ideas, provide context, and guide the reader through the topic. Bullet points and tables are occasional supplements, not the main content vehicle.

**BAD - Outline masquerading as an article:**
```markdown
## Benefits of Dynamic QR Codes

Dynamic QR codes offer several advantages:

- **Editable destinations** - Change where the code points without reprinting
- **Analytics tracking** - See who scanned, when, and where
- **Expiration dates** - Set codes to stop working after a campaign ends
- **A/B testing** - Test different landing pages with the same printed code
- **Error recovery** - Fix broken links without reprinting materials
```

**GOOD - Actual writing that explains and engages:**
```markdown
## Why Dynamic QR Codes Change Everything

Imagine printing 10,000 product brochures, only to discover a typo in your landing page URL. With a static QR code, you'd face an impossible choice: live with the error or reprint everything. Dynamic QR codes eliminate this nightmare entirely.

The "dynamic" in dynamic QR codes refers to a simple but powerful concept: the code itself points to an intermediate URL that you control. When someone scans the code, they hit your redirect server first, which then sends them to whatever destination you've configured. Change the destination anytime, and every code you've ever printed automatically points to the new location.

This redirect layer also enables something static codes could never offer: analytics. Because every scan passes through your server, you can track exactly how many people scanned, when they did it, what device they used, and even their approximate location. For marketers running print campaigns, this transforms QR codes from a black box ("did anyone scan this?") into a measurable channel with real data.

The implications extend further. You can set expiration dates so promotional codes stop working when a campaign ends. You can A/B test different landing pages without printing different codes. You can recover from mistakes - broken links, outdated content, or strategic pivots - without touching the physical materials already in the world.
```

Notice the difference: the good version tells a story, explains *why* things matter, uses concrete examples, and guides the reader through the concepts. The bad version just lists facts.

### When Lists ARE Appropriate

Lists serve specific purposes. Use them for:

1. **Step-by-step instructions** where sequence matters and each step is a discrete action
2. **Quick reference summaries** at the end of a section (after you've explained things in prose)
3. **Feature comparisons** in tables where parallel structure aids scanning
4. **Scannable overviews** when readers genuinely need to quickly find one item

Even then, introduce lists with context and follow them with explanation when needed.

**Example of appropriate list use:**
```markdown
Creating your first dynamic QR code takes just a few steps. Once you understand the concepts above, the process is straightforward:

1. Sign up for a free QRWolf account
2. Click "Create QR Code" and select your content type
3. Enter your destination URL
4. Customize colors and add your logo
5. Download in PNG or SVG format

That's it - your code is live and trackable immediately. The dashboard will show scan analytics as they come in.
```

The list here makes sense because it's genuinely a sequential process, and the preceding prose has already explained the concepts.

### Writing Techniques to Apply

**Explain the "why" behind the "what."** Don't just state that something exists - explain why it matters, what problem it solves, or what it enables.

**Use concrete examples.** Abstract concepts become clear through specific scenarios. "A coffee shop could..." or "Imagine printing 10,000 brochures..." makes ideas tangible.

**Create narrative flow.** Each paragraph should connect to the next. Use transitions. Build from simple concepts to complex ones. Guide the reader.

**Vary sentence structure.** Mix short punchy sentences with longer explanatory ones. Monotonous rhythm puts readers to sleep.

**Write with voice.** You're not a textbook. Use "you" and "your." Be direct. Have opinions. Sound like a knowledgeable person explaining something to a colleague.

**Cut ruthlessly.** If a sentence doesn't add understanding, remove it. If a section rehashes what you've already said, consolidate. Respect the reader's time.

### Section Structure

Each major section (H2) should follow this pattern:

1. **Opening paragraph** - Introduce the concept, establish why it matters
2. **Explanation paragraphs** - Develop the idea with examples and context (2-4 paragraphs typically)
3. **Optional supporting element** - A list, table, or callout if it genuinely helps (not required)
4. **Transition** - Connect to the next section or reinforce the key takeaway

Subsections (H3) can be shorter but should still lead with prose, not bullet points.

---

## Content Guidelines

### Document Structure
1. Start with an engaging intro paragraph (no H1 - title is from frontmatter)
2. Use H2 (`##`) for main sections
3. Use H3 (`###`) for subsections
4. Include 4-8 main sections depending on topic depth
5. End with a conclusion and CTA

### Formatting Elements

**Bold text:** Use for key terms on first introduction, not for every other phrase.

**Tables:** Good for structured comparisons where readers need to see parallel information. Always accompany with prose explanation.

**Code blocks:** For technical content where readers need exact syntax.

**Callout Component:** Use sparingly (1-3 per article) for genuinely important asides:

```mdx
<Callout type="info" title="Did You Know?">
Interesting fact that adds context but would interrupt the main narrative.
</Callout>

<Callout type="tip" title="Pro Tip">
Actionable advice that deserves emphasis.
</Callout>

<Callout type="warning" title="Important">
Critical information readers must not miss.
</Callout>
```

Types: `info`, `tip`, `warning`, `error`, `note`

### Internal Links
- Link to signup: `[Get started free](/signup)`
- Link to learn articles: `[article title](/learn/slug-here)`
- Link to blog posts: `[post title](/blog/slug-here)`

### CTAs: ArticleCTA Component (REQUIRED)

**Every article MUST include ArticleCTA components.** These are the primary conversion mechanism for content.

#### Component Syntax

**Inline CTA** - Place after introducing/explaining a specific QR type:
```mdx
<ArticleCTA qrType="wifi" />
```

**Banner CTA** - Place at article end (replaces old prose CTAs):
```mdx
<ArticleCTA variant="banner" title="Custom headline" description="Custom description" buttonText="Custom button" qrType="url" />
```

#### CTA Requirements by Article Type

**Learn Articles (use-cases, industries):**
- 1-2 inline CTAs after discussing specific QR types
- 1 banner CTA at the end
- Match qrType to the article topic (e.g., `menu` for restaurant article)

**Blog How-To Articles:**
- 1 inline CTA early in the article (after explaining the core concept)
- 1 banner CTA at the end
- Use `url` as default qrType for general articles

**Foundation/Basics Articles:**
- 2-3 inline CTAs for different types mentioned
- 1 banner CTA at the end

#### Available QR Types for CTAs

```
url, text, wifi, vcard, email, phone, sms, whatsapp, facebook, instagram,
apps, menu, pdf, video, mp3, images, links, event, coupon, crypto, geo,
business, social, google-review, x, tiktok, linkedin, youtube, spotify,
snapchat, threads, telegram, amazon
```

#### CTA Placement Guidelines

**DO:**
- Place inline CTAs after fully explaining a concept/type
- Use banner CTAs to replace old "Ready to get started?" prose endings
- Match the qrType to what's being discussed

**DON'T:**
- Place CTAs before explaining the concept
- Use more than 4 CTAs per article (creates fatigue)
- Use generic `url` type when a specific type fits better

#### Example: Proper CTA Integration

```mdx
## WiFi QR Codes for Guests

Hotels have discovered that WiFi access is one of the most common guest requests.
A WiFi QR code eliminates the need to verbally share passwords or print credentials
on easily-lost cards. Guests simply scan the code displayed in their room or at
the front desk, and their phone connects automatically.

<ArticleCTA qrType="wifi" />

The convenience extends beyond the initial connection. When guests return for
future stays, their device often remembers the network...

[... more content ...]

## Getting Started

<ArticleCTA variant="banner" title="Create WiFi QR codes for your hotel" description="Let guests connect instantly with a single scan—no passwords to remember." buttonText="Create WiFi QR" qrType="wifi" />
```

#### Legacy Prose CTAs (DEPRECATED)

Old-style prose CTAs are now deprecated:
```mdx
<!-- DON'T DO THIS ANYMORE -->
Ready to create your first QR code? [Get started for free](/signup) with QRWolf.
```

Replace with ArticleCTA banner component instead.

---

## SEO Keywords

Incorporate these naturally - they should appear where they fit the prose, not shoehorned in:

**Primary:** qr code generator, free qr code, qr code maker, dynamic qr code, qr code tracking, qr code analytics

**By Type:** wifi qr code, menu qr code, vcard qr code, restaurant qr code, business qr code, digital business card qr, whatsapp qr code, instagram qr code, pdf qr code, video qr code, coupon qr code

**Educational:** what is a qr code, how qr codes work, static vs dynamic qr code, qr code best practices, qr code size requirements

---

## QRWolf Features Reference

When relevant, mention these capabilities:

**Free Tier:** Core QR types (URL, Text, WiFi, vCard, Email, Phone, SMS), basic customization, PNG/SVG download

**Pro Tier ($9/mo):** All 34 QR types, dynamic QR codes (50), full analytics, logo upload, expiration dates, password protection, scan tracking

**Business Tier ($29/mo):** Unlimited dynamic QRs, bulk generation, REST API (10k requests/mo), team members (up to 3)

**All 34 QR Types:**
- **Core:** URL, Text, WiFi, vCard, Email, Phone, SMS
- **Social:** WhatsApp, Facebook, Instagram, X (Twitter), LinkedIn, TikTok, YouTube, Snapchat, Threads, Telegram, Spotify
- **Business:** Menu, PDF, Video, MP3/Audio, Images, Links, Event, Coupon, Business Card, Google Review
- **Utility:** Geo/Location, Apps, Crypto, Amazon, Social (multi-profile)

---

## Workflow

1. Determine content type (blog or learn)
2. Choose appropriate category
3. Generate slug from title (lowercase, hyphens, no special chars)
4. Create file at correct path
5. **Write quality prose first** - get the ideas and explanations right
6. Add formatting elements (lists, tables, callouts) only where they enhance understanding
7. Review for bullet-point overuse - convert to prose where needed
8. Add internal links naturally
9. **Add ArticleCTA components:**
   - Identify which QR types are discussed in the article
   - Add 1-2 inline `<ArticleCTA qrType="xxx" />` after explaining each type
   - Add 1 banner CTA at the end with custom copy
   - Ensure qrTypes match the article topic
10. Build to verify: `npm run build`

---

## Quality Checklist

Before finalizing content:
- [ ] **Prose-first check**: Is every section primarily flowing paragraphs? (Most important!)
- [ ] **List audit**: Are bullet points used sparingly and only where appropriate?
- [ ] **Explanation check**: Does the article explain *why*, not just *what*?
- [ ] **Example check**: Are abstract concepts illustrated with concrete scenarios?
- [ ] **Flow check**: Do sections connect and build on each other?
- [ ] Title under 100 characters
- [ ] Description under 300 characters, includes primary keyword
- [ ] Proper frontmatter with all required fields
- [ ] 800-1500 words for blog, 600-1200 for learn
- [ ] 1-3 Callout components (not more)
- [ ] Internal links to related content
- [ ] **ArticleCTA components included** (1-2 inline + 1 banner at end)
- [ ] **CTA qrTypes match article topic** (not generic `url` if specific type fits)
- [ ] relatedSlugs reference actual existing articles

---

## MANDATORY: Pre-Submission Bullet Audit

**Before finishing ANY article, you MUST perform this check:**

1. **Count your H2 sections.** How many are there?

2. **For each H2, answer:** Does it start with at least 2 paragraphs of prose before any list/table?
   - If NO for any section, STOP and rewrite that section.

3. **Count total bullet points in the article.** Include numbered lists.
   - For a 1000-word article, max ~15-20 bullet items across the entire piece.
   - For a 600-word article, max ~10-12 bullet items.
   - If over limit, convert the weakest list to prose.

4. **Identify your "Use Cases" or "Benefits" section.** Is it written as prose explaining scenarios, or as a bullet list?
   - If it's a bullet list, REWRITE IT as prose with concrete examples.

5. **Read the article aloud.** Does it sound like a person explaining something, or like someone reading a PowerPoint deck?
   - If it sounds like bullets, rewrite until it flows.

6. **Check ArticleCTA components.** Does the article have:
   - At least 1 inline CTA after discussing a QR type?
   - Exactly 1 banner CTA at the end?
   - qrTypes that match the article topic?
   - If missing any CTAs, ADD THEM before submitting.

### Example Self-Audit

Article: "QR Codes for Restaurants"
- H2 sections: 6 (all start with prose) ✓
- Total bullets: 14 (under 20 for ~1100 words) ✓
- "Use Cases" section: Written as 4 prose paragraphs with examples ✓
- Read aloud: Flows naturally ✓
- Inline CTAs: 2 (`<ArticleCTA qrType="menu" />`, `<ArticleCTA qrType="wifi" />`) ✓
- Banner CTA: 1 at end with `qrType="menu"` ✓

**Only submit after passing all checks.**

---

## Reference: The Audit That Prompted These Rules

An audit of 97 content articles found:
- 14% (14 articles) were SEVERE bullet bloat - needed complete rewrites
- 33% (32 articles) were MODERATE - acceptable but not great
- 53% (51 articles) were GOOD - proper prose-first writing

The SEVERE articles all shared the same pattern: every section was a bulleted list, with minimal prose connecting ideas. They read like internal documentation, not published content that represents the brand.

**Don't add to the rewrite queue. Write it right the first time.**
