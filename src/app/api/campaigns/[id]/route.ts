import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/campaigns/[id] - Get a single campaign
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error in GET /api/campaigns/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/campaigns/[id] - Update a campaign
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const { data: existingCampaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { name, description, color, start_date, end_date } = body;

    const updates: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json({ error: 'Invalid campaign name' }, { status: 400 });
      }
      const trimmedName = name.trim();
      if (trimmedName.length === 0) {
        return NextResponse.json({ error: 'Campaign name cannot be empty' }, { status: 400 });
      }
      if (trimmedName.length > 100) {
        return NextResponse.json({ error: 'Campaign name must be 100 characters or less' }, { status: 400 });
      }
      updates.name = trimmedName;
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== 'string') {
        return NextResponse.json({ error: 'Invalid description' }, { status: 400 });
      }
      if (typeof description === 'string' && description.length > 500) {
        return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 });
      }
      updates.description = description;
    }

    if (color !== undefined) {
      updates.color = color;
    }

    if (start_date !== undefined) {
      updates.start_date = start_date;
    }

    if (end_date !== undefined) {
      updates.end_date = end_date;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error in PATCH /api/campaigns/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const { data: existingCampaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Delete the campaign (QR codes will have campaign_id set to null via ON DELETE SET NULL)
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting campaign:', error);
      return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/campaigns/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
