import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface ApiUser {
  id: string;
  tier: 'free' | 'pro' | 'business';
}

/**
 * Validate API key and return user info
 */
export async function validateApiKey(authHeader: string | null): Promise<ApiUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey) return null;

  // Hash the key
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Use service role to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Find the API key
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('user_id')
    .eq('key_hash', keyHash)
    .is('revoked_at', null)
    .single();

  if (keyError || !keyData) {
    return null;
  }

  // Update last used
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash);

  // Get user tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', keyData.user_id)
    .single();

  const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business';

  // Only business tier can use API
  if (tier !== 'business') {
    return null;
  }

  return {
    id: keyData.user_id,
    tier,
  };
}

/**
 * Generate a new API key
 * Returns both the key (to show once) and hash (to store)
 */
export function generateApiKey(): { key: string; keyHash: string; keyPrefix: string } {
  // Generate 32 random bytes
  const randomBytes = crypto.randomBytes(32);
  const key = `qrw_${randomBytes.toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  const keyPrefix = key.slice(0, 8); // Must be 8 chars or less for DB column

  return { key, keyHash, keyPrefix };
}

/**
 * API error response helper
 */
export function apiError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * API success response helper
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return Response.json({ data }, { status });
}
