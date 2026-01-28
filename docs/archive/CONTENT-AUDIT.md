# Content Audit: QR Types & CTA Injection

## Status: ✅ Complete

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

## Priority 1: High-Traffic Foundation Articles ✅

These articles define core concepts and likely have outdated type references.

| Article | Issue | Status |
|---------|-------|--------|
| `learn/qr-basics/what-is-a-qr-code.mdx` | May list types | ✅ Done - CTAs added (wifi, vcard, url, banner) |
| `learn/qr-basics/static-vs-dynamic-qr-codes.mdx` | May reference type counts | ✅ Done - CTAs added (menu, business, url, banner) |
| `learn/qr-basics/how-to-create-a-qr-code.mdx` | Step-by-step, needs CTAs | ✅ Done - CTAs added (url, wifi, vcard, banner) |
| `learn/qr-basics/qr-code-faqs.mdx` | Q&A may mention types | ✅ Done - CTAs added (url x2, banner) |

---

## Priority 2: Use-Case Articles ✅ (25 total)

High conversion potential - each covers a specific QR type. All updated with CTAs.

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

## Priority 3: Industry Articles ✅ (20 total)

All industry articles updated with 2-3 relevant CTAs each.

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

## Priority 4: Blog How-To Articles ✅ (9 total)

All how-to blog articles updated with CTAs.

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

### Phase 1: Foundation ✅ Complete
- [x] Fix types-of-qr-codes.mdx
- [x] Audit remaining qr-basics articles (4 articles updated with CTAs)

### Phase 2: Use-Case Articles ✅ Complete
- [x] Added inline + banner CTAs to all 23 use-case articles

### Phase 3: Industry Articles ✅ Complete
- [x] Added 2-3 relevant CTAs to all 20 industry articles

### Phase 4: Blog Posts ✅ Complete
- [x] Added CTAs to all 9 how-to articles

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
