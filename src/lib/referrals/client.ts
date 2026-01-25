/**
 * Client-side referral utilities
 */

/**
 * Generate a shareable referral link (client-side)
 */
export function getReferralLink(referralCode: string): string {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

  return `${baseUrl}/signup?ref=${referralCode}`;
}

/**
 * Copy referral link to clipboard (client-side)
 */
export async function copyReferralLink(referralCode: string): Promise<boolean> {
  const link = getReferralLink(referralCode);

  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch (err) {
    console.error('Failed to copy referral link:', err);
    return false;
  }
}
