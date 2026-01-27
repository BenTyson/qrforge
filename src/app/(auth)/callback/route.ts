import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email';
import { linkReferral } from '@/lib/referrals';
import { NextResponse } from 'next/server';

// Get the base URL for redirects (supports Railway/proxy scenarios)
function getBaseUrl(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getBaseUrl(request);
  const code = searchParams.get('code');
  const refCode = searchParams.get('ref'); // Referral code from OAuth redirect
  const redirect = searchParams.get('redirect') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this is a new user (first login)
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if profile has received welcome email
        const { data: profile } = await supabase
          .from('profiles')
          .select('welcome_email_sent, referred_by')
          .eq('id', user.id)
          .single();

        // Send welcome email if not already sent (indicates new user)
        if (profile && !profile.welcome_email_sent) {
          const userName = user.user_metadata?.full_name || user.email?.split('@')[0];

          // Process referral if code provided and user not already referred
          if (refCode && !profile.referred_by) {
            linkReferral(user.id, refCode).then((result) => {
              if (result.success) {
                console.log(`User ${user.id} linked to referrer via code ${refCode}`);
              }
            });
          }

          // Send welcome email (non-blocking)
          sendWelcomeEmail(user.email!, userName).then((result) => {
            if (result.success) {
              // Mark welcome email as sent
              supabase
                .from('profiles')
                .update({ welcome_email_sent: true })
                .eq('id', user.id)
                .then(() => {});
            }
          });
        }
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
