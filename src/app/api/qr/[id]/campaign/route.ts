import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TIER_LIMITS } from '@/lib/supabase/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/qr/[id]/campaign - Assign or remove a campaign from a QR code
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business';

    // Check if user can use campaigns
    const campaignLimit = TIER_LIMITS[tier].campaigns;
    if (campaignLimit === 0) {
      return NextResponse.json(
        { error: 'Campaigns require a Pro or Business subscription' },
        { status: 403 }
      );
    }

    // Check QR code ownership
    const { data: existingQR } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingQR) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { campaign_id } = body;

    // If campaign_id is provided (not null), verify the campaign exists and belongs to user
    if (campaign_id !== null) {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id')
        .eq('id', campaign_id)
        .eq('user_id', user.id)
        .single();

      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }
    }

    // Update the QR code's campaign
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .update({ campaign_id })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating QR code campaign:', error);
      return NextResponse.json({ error: 'Failed to update QR code campaign' }, { status: 500 });
    }

    return NextResponse.json(qrCode);
  } catch (error) {
    console.error('Error in PATCH /api/qr/[id]/campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
