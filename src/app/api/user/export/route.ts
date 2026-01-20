import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { DataExportReadyEmail } from '@/emails/DataExportReadyEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limit: 1 export per 24 hours per user
const EXPORT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const exportCooldowns = new Map<string, number>();

/**
 * GET /api/user/export
 * Export all user data as JSON (GDPR data portability)
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check rate limit
  const lastExport = exportCooldowns.get(user.id);
  if (lastExport && Date.now() - lastExport < EXPORT_COOLDOWN_MS) {
    const remainingMs = EXPORT_COOLDOWN_MS - (Date.now() - lastExport);
    const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
    return NextResponse.json(
      { error: `You can request another export in ${remainingHours} hours` },
      { status: 429 }
    );
  }

  try {
    // Use service role to bypass RLS for complete data access
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all user data in parallel
    const [
      profileResult,
      qrCodesResult,
      scansResult,
      foldersResult,
      apiKeysResult,
      teamsResult,
      teamMembershipsResult,
    ] = await Promise.all([
      // Profile
      adminSupabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, subscription_tier, subscription_status, monthly_scan_count, created_at, updated_at')
        .eq('id', user.id)
        .single(),

      // QR Codes (exclude any sensitive fields)
      adminSupabase
        .from('qr_codes')
        .select('id, name, type, content_type, content, short_code, destination_url, style, scan_count, folder_id, expires_at, created_at, updated_at')
        .eq('user_id', user.id),

      // Scans (exclude ip_hash for privacy)
      adminSupabase
        .from('scans')
        .select('id, qr_code_id, scanned_at, country, city, region, device_type, os, browser, referrer')
        .in('qr_code_id', (await adminSupabase
          .from('qr_codes')
          .select('id')
          .eq('user_id', user.id)
        ).data?.map(qr => qr.id) || []),

      // Folders
      adminSupabase
        .from('folders')
        .select('id, name, color, created_at, updated_at')
        .eq('user_id', user.id),

      // API Keys (exclude key_hash for security)
      adminSupabase
        .from('api_keys')
        .select('id, name, key_prefix, environment, permissions, expires_at, last_used_at, request_count, monthly_request_count, created_at, revoked_at')
        .eq('user_id', user.id),

      // Teams owned by user
      adminSupabase
        .from('teams')
        .select('id, name, created_at')
        .eq('owner_id', user.id),

      // Team memberships
      adminSupabase
        .from('team_members')
        .select('team_id, role, joined_at')
        .eq('user_id', user.id),
    ]);

    // Build export object
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      user: {
        id: user.id,
        email: user.email,
        emailConfirmedAt: user.email_confirmed_at,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
      },
      profile: profileResult.data || null,
      qrCodes: qrCodesResult.data || [],
      scans: scansResult.data || [],
      folders: foldersResult.data || [],
      apiKeys: apiKeysResult.data || [],
      teamsOwned: teamsResult.data || [],
      teamMemberships: teamMembershipsResult.data || [],
      metadata: {
        totalQRCodes: qrCodesResult.data?.length || 0,
        totalScans: scansResult.data?.length || 0,
        totalFolders: foldersResult.data?.length || 0,
        totalApiKeys: apiKeysResult.data?.length || 0,
      },
    };

    // Update rate limit
    exportCooldowns.set(user.id, Date.now());

    // Send notification email
    try {
      await resend.emails.send({
        from: 'QRWolf <noreply@qrwolf.com>',
        to: user.email!,
        subject: 'Your QRWolf Data Export is Ready',
        react: DataExportReadyEmail({
          userName: profileResult.data?.full_name || undefined,
          exportDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        }),
      });
    } catch (emailError) {
      console.error('Failed to send export notification email:', emailError);
      // Don't fail the export if email fails
    }

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="qrwolf-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/export
 * Check export availability (rate limit status)
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const lastExport = exportCooldowns.get(user.id);
  const canExport = !lastExport || Date.now() - lastExport >= EXPORT_COOLDOWN_MS;

  if (canExport) {
    return NextResponse.json({ available: true });
  }

  const remainingMs = EXPORT_COOLDOWN_MS - (Date.now() - lastExport);
  const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));

  return NextResponse.json({
    available: false,
    remainingHours,
    nextAvailable: new Date(lastExport + EXPORT_COOLDOWN_MS).toISOString(),
  });
}
