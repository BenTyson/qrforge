import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { AccountDeletionEmail } from '@/emails/AccountDeletionEmail';
import { stripe } from '@/lib/stripe/config';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// Store deletion tokens (in production, use Redis/database)
// Token format: { userId, email, expiresAt }
const deletionTokens = new Map<string, { userId: string; email: string; expiresAt: number }>();

// Token expires in 24 hours
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * POST /api/user/delete-account
 * Request account deletion (sends confirmation email)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { action, token } = body;

    // Step 1: Request deletion (sends email)
    if (action === 'request') {
      // Check if user owns teams with other members
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: ownedTeams } = await adminSupabase
        .from('teams')
        .select('id, name')
        .eq('owner_id', user.id);

      if (ownedTeams && ownedTeams.length > 0) {
        // Check if any of these teams have other members
        const { data: teamMembers } = await adminSupabase
          .from('team_members')
          .select('team_id')
          .in('team_id', ownedTeams.map(t => t.id))
          .neq('user_id', user.id);

        if (teamMembers && teamMembers.length > 0) {
          return NextResponse.json({
            error: 'team_ownership',
            message: 'You own teams with other members. Please transfer ownership or remove members before deleting your account.',
            teams: ownedTeams,
          }, { status: 400 });
        }
      }

      // Generate deletion token
      const deletionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + TOKEN_EXPIRY_MS;

      deletionTokens.set(deletionToken, {
        userId: user.id,
        email: user.email!,
        expiresAt,
      });

      // Get user profile for name
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Build confirmation URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
      const confirmationLink = `${appUrl}/settings?delete_token=${deletionToken}`;

      // Send confirmation email
      await resend.emails.send({
        from: 'QRWolf <noreply@qrwolf.com>',
        to: user.email!,
        subject: 'Confirm Your Account Deletion Request',
        react: AccountDeletionEmail({
          userName: profile?.full_name || undefined,
          confirmationLink,
          expiresIn: '24 hours',
        }),
      });

      return NextResponse.json({
        success: true,
        message: 'Confirmation email sent. Please check your inbox.',
      });
    }

    // Step 2: Confirm and execute deletion
    if (action === 'confirm' && token) {
      const tokenData = deletionTokens.get(token);

      if (!tokenData) {
        return NextResponse.json(
          { error: 'Invalid or expired deletion token' },
          { status: 400 }
        );
      }

      if (tokenData.expiresAt < Date.now()) {
        deletionTokens.delete(token);
        return NextResponse.json(
          { error: 'Deletion token has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Verify token belongs to current user
      if (tokenData.userId !== user.id) {
        return NextResponse.json(
          { error: 'Token does not match current user' },
          { status: 403 }
        );
      }

      // Use admin client for deletion
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Step 2a: Cancel Stripe subscription if exists
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (profile?.stripe_customer_id) {
        try {
          // Cancel all active subscriptions
          const subscriptions = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: 'active',
          });

          for (const sub of subscriptions.data) {
            await stripe.subscriptions.cancel(sub.id);
          }
        } catch (stripeError) {
          console.error('Failed to cancel Stripe subscription:', stripeError);
          // Continue with deletion even if Stripe fails
        }
      }

      // Step 2b: Delete files from storage buckets
      try {
        // Delete QR logos
        const { data: logos } = await adminSupabase.storage
          .from('qr-logos')
          .list(user.id);

        if (logos && logos.length > 0) {
          await adminSupabase.storage
            .from('qr-logos')
            .remove(logos.map(f => `${user.id}/${f.name}`));
        }

        // Delete QR media
        const { data: media } = await adminSupabase.storage
          .from('qr-media')
          .list(user.id);

        if (media && media.length > 0) {
          await adminSupabase.storage
            .from('qr-media')
            .remove(media.map(f => `${user.id}/${f.name}`));
        }
      } catch (storageError) {
        console.error('Failed to delete storage files:', storageError);
        // Continue with deletion even if storage cleanup fails
      }

      // Step 2c: Delete auth user (cascades to profile, QR codes, etc.)
      const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error('Failed to delete user:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete account. Please contact support.' },
          { status: 500 }
        );
      }

      // Clean up token
      deletionTokens.delete(token);

      return NextResponse.json({
        success: true,
        message: 'Your account has been permanently deleted.',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "request" or "confirm".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/delete-account?token=xxx
 * Validate a deletion token
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { valid: false, error: 'No token provided' },
      { status: 400 }
    );
  }

  const tokenData = deletionTokens.get(token);

  if (!tokenData) {
    return NextResponse.json(
      { valid: false, error: 'Invalid or expired token' }
    );
  }

  if (tokenData.expiresAt < Date.now()) {
    deletionTokens.delete(token);
    return NextResponse.json(
      { valid: false, error: 'Token has expired' }
    );
  }

  // Don't expose sensitive data, just confirm validity
  return NextResponse.json({
    valid: true,
    expiresAt: new Date(tokenData.expiresAt).toISOString(),
  });
}
