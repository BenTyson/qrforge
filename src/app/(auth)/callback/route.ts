import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
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
          .select('welcome_email_sent')
          .eq('id', user.id)
          .single();

        // Send welcome email if not already sent
        if (profile && !profile.welcome_email_sent) {
          const userName = user.user_metadata?.full_name || user.email?.split('@')[0];

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
