import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/stripe/plans';
import { getEffectiveTier } from '@/lib/stripe/config';
import type { SubscriptionTier } from '@/lib/stripe/plans';
import crypto from 'crypto';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = crypto.randomBytes(7);
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(randomBytes[i] % chars.length);
  }
  return result;
}

// POST /api/qr/[id]/duplicate - Duplicate a QR code
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch source QR code and verify ownership
    const { data: source } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!source) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    // Get user's subscription tier for limit check
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, trial_ends_at')
      .eq('id', user.id)
      .single();

    const baseTier = (profile?.subscription_tier || 'free') as SubscriptionTier;
    const tier = getEffectiveTier(baseTier, profile?.trial_ends_at, profile?.subscription_status) as SubscriptionTier;
    const qrLimit = PLANS[tier].dynamicQRLimit;

    // Check tier limit (archived codes still count)
    if (qrLimit !== -1) {
      const { count, error: countError } = await supabase
        .from('qr_codes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        return NextResponse.json({ error: 'Failed to check QR code limit' }, { status: 500 });
      }

      if (count !== null && count >= qrLimit) {
        return NextResponse.json(
          { error: `QR code limit reached (${qrLimit}). Upgrade your plan for more.` },
          { status: 403 }
        );
      }
    }

    // Generate new short_code with retry on collision
    let shortCode: string | null = null;
    if (source.short_code) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const candidate = generateShortCode();
        const { data: existing } = await supabase
          .from('qr_codes')
          .select('id')
          .eq('short_code', candidate)
          .single();

        if (!existing) {
          shortCode = candidate;
          break;
        }
      }

      if (!shortCode) {
        shortCode = generateShortCode();
      }
    }

    // Insert duplicate
    const { data: duplicate, error: insertError } = await supabase
      .from('qr_codes')
      .insert({
        user_id: user.id,
        name: `${source.name} (Copy)`,
        type: source.type,
        content_type: source.content_type,
        content: source.content,
        short_code: shortCode,
        destination_url: source.destination_url,
        style: source.style,
        folder_id: source.folder_id,
        expires_at: source.expires_at,
        active_from: source.active_from,
        active_until: source.active_until,
        schedule_timezone: source.schedule_timezone,
        schedule_rule: source.schedule_rule,
        password_hash: source.password_hash,
        bulk_batch_id: null,
        archived_at: null,
      })
      .select('id, short_code, name')
      .single();

    if (insertError) {
      console.error('Error duplicating QR code:', insertError);
      return NextResponse.json({ error: 'Failed to duplicate QR code' }, { status: 500 });
    }

    return NextResponse.json(duplicate);
  } catch (error) {
    console.error('Error in POST /api/qr/[id]/duplicate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
