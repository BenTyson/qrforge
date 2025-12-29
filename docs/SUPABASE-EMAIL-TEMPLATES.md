# Supabase Auth Email Templates

> **See also:** `docs/SESSION-START.md` for full project context

These are the on-brand email templates for Supabase authentication flows.

## Email Architecture

QRWolf uses two email systems:

1. **Supabase Auth Emails** (this document)
   - Handled by Supabase automatically
   - Confirmation, Magic Link, Password Reset, Email Change, Invite
   - Templates stored in `supabase/templates/*.html`
   - Pushed via `supabase config push` (see config.toml)

2. **Transactional Emails** (via Resend)
   - Handled by `src/lib/email.ts`
   - Welcome email, Team invites, Subscription confirmations, Payment failures
   - React Email templates in `src/emails/`
   - Triggered by app events (auth callback, Stripe webhooks, etc.)

---

## Supabase Template Setup

**Option 1: CLI Push (Recommended)**
```bash
npx supabase config push
```
This pushes templates from `supabase/templates/` using `supabase/config.toml`.

**Option 2: Manual Dashboard**
1. Go to https://supabase.com/dashboard/project/_/auth/templates
2. Select each template type
3. Replace the HTML content with the templates below
4. Click Save

---

## Confirm Signup

**Subject:** `Confirm your QRWolf account`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0c1222; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c1222; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="https://qrwolf.com/QRWolf_Logo_Color.png" width="48" height="48" alt="QRWolf" style="border-radius: 8px;">
              <span style="display: inline-block; vertical-align: middle; margin-left: 12px; font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">QRWolf</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color: #151d2e; border-radius: 12px; padding: 32px; border: 1px solid rgba(148, 163, 184, 0.15);">
              <h1 style="color: #fafafa; font-size: 24px; font-weight: bold; margin: 0 0 16px 0; text-align: center;">Confirm Your Email</h1>

              <p style="color: #fafafa; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                Thanks for signing up for QRWolf! Please confirm your email address to activate your account.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #14b8a6; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px;">Confirm Email Address</a>
                  </td>
                </tr>
              </table>

              <p style="color: #94a3b8; font-size: 14px; line-height: 20px; margin: 0;">
                If you didn't create an account with QRWolf, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">QRWolf - Professional QR Codes with Analytics</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 16px 0;">
                <a href="https://qrwolf.com" style="color: #14b8a6; text-decoration: none;">Website</a> &bull;
                <a href="https://qrwolf.com/contact" style="color: #14b8a6; text-decoration: none;">Contact</a>
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2025 QRWolf. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Magic Link

**Subject:** `Your QRWolf login link`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0c1222; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c1222; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="https://qrwolf.com/QRWolf_Logo_Color.png" width="48" height="48" alt="QRWolf" style="border-radius: 8px;">
              <span style="display: inline-block; vertical-align: middle; margin-left: 12px; font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">QRWolf</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color: #151d2e; border-radius: 12px; padding: 32px; border: 1px solid rgba(148, 163, 184, 0.15);">
              <h1 style="color: #fafafa; font-size: 24px; font-weight: bold; margin: 0 0 16px 0; text-align: center;">Sign In to QRWolf</h1>

              <p style="color: #fafafa; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                Click the button below to sign in to your QRWolf account. This link will expire in 1 hour.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #14b8a6; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px;">Sign In</a>
                  </td>
                </tr>
              </table>

              <p style="color: #94a3b8; font-size: 14px; line-height: 20px; margin: 0;">
                If you didn't request this link, you can safely ignore this email. Someone may have entered your email address by mistake.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">QRWolf - Professional QR Codes with Analytics</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 16px 0;">
                <a href="https://qrwolf.com" style="color: #14b8a6; text-decoration: none;">Website</a> &bull;
                <a href="https://qrwolf.com/contact" style="color: #14b8a6; text-decoration: none;">Contact</a>
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2025 QRWolf. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Reset Password

**Subject:** `Reset your QRWolf password`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0c1222; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c1222; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="https://qrwolf.com/QRWolf_Logo_Color.png" width="48" height="48" alt="QRWolf" style="border-radius: 8px;">
              <span style="display: inline-block; vertical-align: middle; margin-left: 12px; font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">QRWolf</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color: #151d2e; border-radius: 12px; padding: 32px; border: 1px solid rgba(148, 163, 184, 0.15);">
              <h1 style="color: #fafafa; font-size: 24px; font-weight: bold; margin: 0 0 16px 0; text-align: center;">Reset Your Password</h1>

              <p style="color: #fafafa; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                We received a request to reset your password. Click the button below to choose a new password.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #14b8a6; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px;">Reset Password</a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #0c1222; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="color: #fafafa; font-size: 14px; margin: 0;">
                  <strong>Security tip:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>

              <p style="color: #94a3b8; font-size: 14px; line-height: 20px; margin: 0;">
                This link will expire in 1 hour for security reasons.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">QRWolf - Professional QR Codes with Analytics</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 16px 0;">
                <a href="https://qrwolf.com" style="color: #14b8a6; text-decoration: none;">Website</a> &bull;
                <a href="https://qrwolf.com/contact" style="color: #14b8a6; text-decoration: none;">Contact</a>
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2025 QRWolf. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Email Change

**Subject:** `Confirm your new email address`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0c1222; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c1222; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="https://qrwolf.com/QRWolf_Logo_Color.png" width="48" height="48" alt="QRWolf" style="border-radius: 8px;">
              <span style="display: inline-block; vertical-align: middle; margin-left: 12px; font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">QRWolf</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color: #151d2e; border-radius: 12px; padding: 32px; border: 1px solid rgba(148, 163, 184, 0.15);">
              <h1 style="color: #fafafa; font-size: 24px; font-weight: bold; margin: 0 0 16px 0; text-align: center;">Confirm Email Change</h1>

              <p style="color: #fafafa; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                You requested to change your email address. Click the button below to confirm this change.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #14b8a6; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px;">Confirm New Email</a>
                  </td>
                </tr>
              </table>

              <p style="color: #94a3b8; font-size: 14px; line-height: 20px; margin: 0;">
                If you didn't request this change, please contact us immediately at <a href="mailto:hello@qrwolf.com" style="color: #14b8a6; text-decoration: none;">hello@qrwolf.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">QRWolf - Professional QR Codes with Analytics</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 16px 0;">
                <a href="https://qrwolf.com" style="color: #14b8a6; text-decoration: none;">Website</a> &bull;
                <a href="https://qrwolf.com/contact" style="color: #14b8a6; text-decoration: none;">Contact</a>
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2025 QRWolf. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Invite User (for team invites via Supabase)

**Subject:** `You've been invited to QRWolf`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0c1222; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c1222; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="https://qrwolf.com/QRWolf_Logo_Color.png" width="48" height="48" alt="QRWolf" style="border-radius: 8px;">
              <span style="display: inline-block; vertical-align: middle; margin-left: 12px; font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">QRWolf</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color: #151d2e; border-radius: 12px; padding: 32px; border: 1px solid rgba(148, 163, 184, 0.15);">
              <h1 style="color: #fafafa; font-size: 24px; font-weight: bold; margin: 0 0 16px 0; text-align: center;">You're Invited!</h1>

              <p style="color: #fafafa; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                You've been invited to join QRWolf. Click the button below to create your account and get started.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #14b8a6; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px;">Accept Invitation</a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #0c1222; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="color: #fafafa; font-size: 14px; margin: 0;">
                  <span style="color: #14b8a6;">&#10003;</span> Generate 16+ types of QR codes<br>
                  <span style="color: #14b8a6;">&#10003;</span> Track scans with detailed analytics<br>
                  <span style="color: #14b8a6;">&#10003;</span> Customize with your brand colors
                </p>
              </div>

              <p style="color: #94a3b8; font-size: 14px; line-height: 20px; margin: 0;">
                If you weren't expecting this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">QRWolf - Professional QR Codes with Analytics</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 16px 0;">
                <a href="https://qrwolf.com" style="color: #14b8a6; text-decoration: none;">Website</a> &bull;
                <a href="https://qrwolf.com/contact" style="color: #14b8a6; text-decoration: none;">Contact</a>
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2025 QRWolf. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Brand Colors Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Teal) | `#14b8a6` | Buttons, links, accents |
| Accent (Cyan) | `#06b6d4` | Gradient end |
| Background | `#0c1222` | Page background |
| Card | `#151d2e` | Content boxes |
| Text | `#fafafa` | Main text |
| Muted | `#94a3b8` | Secondary text |
| Border | `rgba(148, 163, 184, 0.15)` | Card borders |

---

## Notes

- Logo should be hosted at `https://qrwolf.com/QRWolf_Logo_Color.png`
- All templates use the same dark theme as the QRWolf website
- The `{{ .ConfirmationURL }}` is Supabase's template variable - don't change it
- Test emails after updating by triggering each flow (signup, reset password, etc.)

---

## Resend Transactional Emails

These emails are sent via Resend (not Supabase) and use React Email templates.

### Configuration

1. **Environment Variable**
   ```
   RESEND_API_KEY=re_...
   ```

2. **Domain Verification**
   - Add DNS records in your domain registrar:
     - DKIM records (provided by Resend)
     - SPF record
     - MX record (optional, for receiving)
   - Verify in Resend dashboard

### Email Templates

Located in `src/emails/`:

| Template | Trigger | Description |
|----------|---------|-------------|
| `WelcomeEmail.tsx` | First login (auth callback) | Welcome new users |
| `TeamInviteEmail.tsx` | Team invite API | Invite team members |
| `SubscriptionConfirmEmail.tsx` | Stripe webhook | Confirm subscription |
| `PaymentFailedEmail.tsx` | Stripe webhook | Alert payment failure |

### Sending Emails

Use the `src/lib/email.ts` utility:

```typescript
import { sendWelcomeEmail } from '@/lib/email';

await sendWelcomeEmail({
  to: 'user@example.com',
  userName: 'John',
});
```

### Integration Points

- **Auth Callback** (`src/app/(auth)/callback/route.ts`):
  - Sends welcome email on first login
  - Tracks via `welcome_email_sent` column in profiles

- **Team Invites** (`src/app/api/teams/[id]/invites/route.ts`):
  - Sends invite email with accept link

- **Stripe Webhook** (`src/app/api/stripe/webhook/route.ts`):
  - Sends subscription confirmation on `checkout.session.completed`
  - Sends payment failed alert on `invoice.payment_failed`
