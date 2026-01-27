import { createClient } from '@/lib/supabase/server';

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  creditedReferrals: number;
  totalCredits: number;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  status: 'pending' | 'converted' | 'credited';
  created_at: string;
  converted_at: string | null;
  credited_at: string | null;
}

/**
 * Get referral stats for a user (server-side)
 */
export async function getReferralStats(userId: string): Promise<ReferralStats | null> {
  const supabase = await createClient();

  // Get profile with referral code and credits
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('referral_code, referral_credits')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching profile for referral stats:', profileError);
    return null;
  }

  // Get referral counts by status
  const { data: referrals, error: referralsError } = await supabase
    .from('referrals')
    .select('status')
    .eq('referrer_id', userId);

  if (referralsError) {
    console.error('Error fetching referrals:', referralsError);
    return null;
  }

  const statusCounts = (referrals || []).reduce(
    (acc, ref) => {
      acc[ref.status] = (acc[ref.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    referralCode: profile.referral_code || '',
    totalReferrals: referrals?.length || 0,
    pendingReferrals: statusCounts.pending || 0,
    convertedReferrals: statusCounts.converted || 0,
    creditedReferrals: statusCounts.credited || 0,
    totalCredits: profile.referral_credits || 0,
  };
}

/**
 * Get referrer by referral code
 */
export async function getReferrerByCode(referralCode: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode.toUpperCase())
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

/**
 * Link a new user to their referrer (called during signup/callback)
 */
export async function linkReferral(
  refereeId: string,
  referralCode: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Find referrer by code
  const referrerId = await getReferrerByCode(referralCode);
  if (!referrerId) {
    return { success: false, error: 'Invalid referral code' };
  }

  // Can't refer yourself
  if (referrerId === refereeId) {
    return { success: false, error: 'Cannot use your own referral code' };
  }

  // Check if user was already referred
  const { data: existingRef } = await supabase
    .from('referrals')
    .select('id')
    .eq('referee_id', refereeId)
    .single();

  if (existingRef) {
    return { success: false, error: 'User already has a referrer' };
  }

  // Update referee's profile with referrer
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ referred_by: referrerId })
    .eq('id', refereeId);

  if (updateError) {
    console.error('Error updating referred_by:', updateError);
    return { success: false, error: 'Failed to link referral' };
  }

  // Create referral record
  const { error: insertError } = await supabase.from('referrals').insert({
    referrer_id: referrerId,
    referee_id: refereeId,
    status: 'pending',
  });

  if (insertError) {
    console.error('Error creating referral record:', insertError);
    return { success: false, error: 'Failed to create referral record' };
  }

  return { success: true };
}

/**
 * Mark a referral as converted (called when referee upgrades to paid)
 */
export async function markReferralConverted(
  refereeId: string
): Promise<{ success: boolean; referrerId?: string; error?: string }> {
  const supabase = await createClient();

  // Find the referral record
  const { data: referral, error: fetchError } = await supabase
    .from('referrals')
    .select('id, referrer_id, status')
    .eq('referee_id', refereeId)
    .single();

  if (fetchError || !referral) {
    return { success: false, error: 'No referral found for this user' };
  }

  if (referral.status !== 'pending') {
    return { success: false, error: 'Referral already processed' };
  }

  // Update referral status
  const { error: updateError } = await supabase
    .from('referrals')
    .update({
      status: 'converted',
      converted_at: new Date().toISOString(),
    })
    .eq('id', referral.id);

  if (updateError) {
    console.error('Error marking referral converted:', updateError);
    return { success: false, error: 'Failed to update referral status' };
  }

  return { success: true, referrerId: referral.referrer_id };
}

/**
 * Credit the referrer (called after conversion is confirmed)
 * Awards $5 credit (stored as 500 cents)
 */
export async function creditReferrer(
  refereeId: string,
  creditAmount: number = 500
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Find the referral record
  const { data: referral, error: fetchError } = await supabase
    .from('referrals')
    .select('id, referrer_id, status')
    .eq('referee_id', refereeId)
    .single();

  if (fetchError || !referral) {
    return { success: false, error: 'No referral found' };
  }

  if (referral.status === 'credited') {
    return { success: false, error: 'Referral already credited' };
  }

  // Update referrer's credits
  const { error: creditError } = await supabase.rpc('increment_referral_credits', {
    user_id: referral.referrer_id,
    amount: creditAmount,
  });

  // Fallback if RPC doesn't exist - manual update
  if (creditError) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_credits')
      .eq('id', referral.referrer_id)
      .single();

    const currentCredits = profile?.referral_credits || 0;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ referral_credits: currentCredits + creditAmount })
      .eq('id', referral.referrer_id);

    if (updateError) {
      console.error('Error crediting referrer:', updateError);
      return { success: false, error: 'Failed to credit referrer' };
    }
  }

  // Mark referral as credited
  const { error: statusError } = await supabase
    .from('referrals')
    .update({
      status: 'credited',
      credited_at: new Date().toISOString(),
    })
    .eq('id', referral.id);

  if (statusError) {
    console.error('Error updating referral status:', statusError);
  }

  return { success: true };
}

// Client-side functions are in ./client.ts
// Import from '@/lib/referrals/client' for client components
