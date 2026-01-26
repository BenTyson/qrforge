# Content Audit: QR Types & CTA Injection

## Status: In Progress

**Last Updated:** 2026-01-26

## Summary

The knowledge base was created when QRWolf had 14-16 QR types. We now have **34 types**. This audit tracks:
1. Articles needing type count/list updates
2. Strategic CTA injection opportunities

---

## Completed

### Cornerstone Articles Fixed
- [x] `learn/qr-basics/types-of-qr-codes.mdx` - Rewritten for 34 types, 25+ CTAs added

### CTA Injection Complete
- [x] `blog/2026/share-wifi-password-qr-code.mdx` - WiFi CTAs (inline + banner)

---

## Priority 1: High-Traffic Foundation Articles

These articles define core concepts and likely have outdated type references.

| Article | Issue | Status |
|---------|-------|--------|
| `learn/qr-basics/what-is-a-qr-code.mdx` | May list types | Pending |
| `learn/qr-basics/static-vs-dynamic-qr-codes.mdx` | May reference type counts | Pending |
| `learn/qr-basics/how-to-create-a-qr-code.mdx` | Step-by-step, needs CTAs | Pending |
| `learn/qr-basics/qr-code-faqs.mdx` | Q&A may mention types | Pending |

---

## Priority 2: Use-Case Articles (33 total)

High conversion potential - each covers a specific QR type. Add relevant CTA to each.

### Social Platform Articles
| Article | QR Type for CTA |
|---------|-----------------|
| `use-cases/instagram-qr-code.mdx` | instagram |
| `use-cases/facebook-qr-code.mdx` | facebook |
| `use-cases/whatsapp-qr-code.mdx` | whatsapp |
| `use-cases/social-profile-qr-codes.mdx` | social |

### Contact & Communication
| Article | QR Type for CTA |
|---------|-----------------|
| `use-cases/business-card-qr-codes.mdx` | business |
| `use-cases/email-qr-codes.mdx` | email |
| `use-cases/phone-qr-codes.mdx` | phone |
| `use-cases/sms-qr-codes.mdx` | sms |
| `use-cases/text-qr-codes.mdx` | text |

### Media & Files
| Article | QR Type for CTA |
|---------|-----------------|
| `use-cases/qr-code-for-pdf.mdx` | pdf |
| `use-cases/qr-codes-for-video.mdx` | video |
| `use-cases/qr-codes-for-audio.mdx` | mp3 |
| `use-cases/image-gallery-qr-codes.mdx` | images |

### Business Use Cases
| Article | QR Type for CTA |
|---------|-----------------|
| `use-cases/restaurant-menu-qr-codes.mdx` | menu |
| `use-cases/qr-codes-for-coupons.mdx` | coupon |
| `use-cases/links-qr-code.mdx` | links |
| `use-cases/qr-code-for-google-maps.mdx` | geo |
| `use-cases/qr-codes-for-app-downloads.mdx` | apps |

### Events & Marketing
| Article | QR Type for CTA |
|---------|-----------------|
| `use-cases/qr-codes-for-event-tickets.mdx` | event |
| `use-cases/qr-codes-for-event-marketing.mdx` | event |
| `use-cases/qr-codes-for-weddings.mdx` | event |
| `use-cases/qr-codes-for-conference-badges.mdx` | vcard |
| `use-cases/qr-codes-for-flyers.mdx` | url |
| `use-cases/qr-codes-for-product-packaging.mdx` | url |
| `use-cases/qr-codes-for-portfolios.mdx` | links |

---

## Priority 3: Industry Articles (20 total)

Each industry article should have CTAs for relevant types.

| Industry | Recommended CTAs |
|----------|------------------|
| Restaurants | menu, google-review, wifi |
| Real Estate | geo, images, vcard |
| Retail | coupon, url, google-review |
| Hotels | wifi, menu, geo |
| Healthcare | vcard, pdf, url |
| Education | url, pdf, event |
| Gyms | wifi, social, google-review |
| Museums | url, mp3, geo |
| Events/Tourism | event, geo, social |

---

## Priority 4: Blog How-To Articles (9 total)

| Article | Recommended CTA |
|---------|-----------------|
| `how-to-make-qr-code-for-link.mdx` | url |
| `how-to-track-qr-code-scans.mdx` | url (dynamic) |
| `how-to-print-qr-codes.mdx` | url |
| `how-to-create-qr-code-for-email-signature.mdx` | vcard, business |
| `how-to-create-qr-code-for-survey.mdx` | url |
| `how-to-create-qr-code-for-facebook-page.mdx` | facebook |
| `how-to-create-qr-code-for-twitter-x.mdx` | x |
| `how-to-create-qr-code-for-zoom-meeting.mdx` | url |
| `how-to-create-bulk-qr-codes.mdx` | url |

---

## Execution Strategy

### Phase 1: Foundation (Current)
- [x] Fix types-of-qr-codes.mdx
- [ ] Audit remaining qr-basics articles

### Phase 2: Use-Case Articles
- Add single relevant CTA to each (inline, after main content)
- Add banner CTA at end for high-value articles

### Phase 3: Industry Articles
- Add 2-3 relevant CTAs per article
- Match CTAs to industry-specific use cases

### Phase 4: Blog Posts
- Add CTAs to how-to articles
- Review comparison/guide posts for CTA opportunities

---

## CTA Placement Guidelines

**Inline CTA (`<ArticleCTA qrType="xxx" />`):**
- Place after introducing a specific QR type
- Place after explaining a use case
- Maximum 3-4 per article to avoid fatigue

**Banner CTA (`<ArticleCTA variant="banner" ... />`):**
- Place at article end
- Use custom copy that summarizes the article's call to action
- One per article maximum

---

## Notes

- All 34 QR types now have metadata in `QR_TYPE_METADATA` (constants.tsx)
- ArticleCTA auto-generates title/description from type
- Custom copy can override defaults for more contextual CTAs
