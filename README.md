# QRWolf

A premium QR code generator with analytics, dynamic codes, and landing pages. Built for passive income through SEO-driven traffic and recurring subscriptions.

**Live:** https://qrwolf.com

---

## ⚠️ CRITICAL: Production Safety - LIVE PAYING USERS

> **This application has LIVE PAYING CUSTOMERS in production.**
>
> The production database at https://qrwolf.com contains real customer data, payment information, and QR codes that are actively being scanned. Corrupting or destroying this data would directly harm paying users.

### Development Safety

| Environment | Database | Safe to Experiment? |
|-------------|----------|---------------------|
| **Local Dev** | Dev Supabase (`fxcvxomvkgioxwbwmbsy`) | ✅ Yes |
| **Production** | Prod Supabase (`otdlggbhsmgqhsviazho`) | ⛔ NO - LIVE CUSTOMERS |

**Before making any changes:**
```bash
npm run safety-check  # Verify you're connected to DEV database (should show "SAFE")
npm run dev           # Start dev server on port 3322
```

**Critical rules:**
- NEVER run destructive database operations against production
- NEVER push directly to `main` branch (use PR from `develop`)
- ALWAYS verify environment before running migrations or data scripts
- ALWAYS run tests before committing: `npm run precommit`

**Full documentation:** See `docs/README.md` for documentation entry point.

---

## Features

- **16 QR Code Types**: URL, Text, WiFi, vCard, Email, Phone, SMS, WhatsApp, Facebook, Instagram, Apps, PDF, Images, Video, MP3, Menu, Business, Links, Coupon, Social
- **Dynamic QR Codes**: Editable destinations with scan tracking
- **Real-time Analytics**: Device, location, and browser tracking
- **Custom Styling**: Colors, logos, presets
- **Landing Pages**: Menu, business card, links, coupon, social profiles
- **Multiple Formats**: PNG and SVG downloads
- **Dark Theme**: Premium dark navy design with teal/cyan accents

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Deployment**: Railway
- **QR Generation**: qrcode library
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page with QR generator
│   ├── layout.tsx         # Root layout with SEO
│   └── globals.css        # Custom theme
├── components/
│   ├── ui/                # shadcn/ui components
│   └── qr/                # QR-specific components
└── lib/
    └── qr/                # QR generation logic
docs/
├── README.md              # Documentation entry point
├── PROJECT.md             # Project overview
├── WORKFLOW.md            # Branch workflow
├── DEVELOPMENT.md         # Dev environment
└── FEATURE-ROADMAP.md     # Planned features
```

## Environment Variables

See `.env.local.example` for the full template. Key variables:

```env
# Environment (CRITICAL - controls database safety)
ENVIRONMENT=development

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**See also:** `docs/DEVELOPMENT.md` for environment setup details.

## Deployment

This project is configured for Railway deployment.

## License

Private - All rights reserved.
