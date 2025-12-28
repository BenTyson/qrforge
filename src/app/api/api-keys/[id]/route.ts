import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * DELETE /api/api-keys/:id
 * Revoke an API key
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check ownership
  const { data: key, error: fetchError } = await supabase
    .from('api_keys')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !key) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  // Soft delete by setting revoked_at
  const { error } = await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
