import { createClient } from '@/lib/supabase/server';
import { QRCodesContent } from './QRCodesContent';
import type { SubscriptionTier, QRCode, Folder, Campaign } from '@/lib/supabase/types';

export default async function QRCodesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user profile, QR codes, folders, and campaigns in parallel
  const [profileResult, qrCodesResult, foldersResult, campaignsResult] = await Promise.all([
    supabase.from('profiles').select('subscription_tier').eq('id', user.id).single(),
    supabase.from('qr_codes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('folders').select('*').eq('user_id', user.id).order('name', { ascending: true }),
    supabase.from('campaigns').select('*').eq('user_id', user.id).order('name', { ascending: true }),
  ]);

  const tier = (profileResult.data?.subscription_tier || 'free') as SubscriptionTier;
  const qrCodes = (qrCodesResult.data || []) as QRCode[];
  const folders = (foldersResult.data || []) as Folder[];
  const campaigns = (campaignsResult.data || []) as Campaign[];

  if (qrCodesResult.error) {
    console.error('Error fetching QR codes:', qrCodesResult.error);
  }

  return (
    <div className="relative min-h-screen">
      {/* V2 Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Floating orbs */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/15 blur-[120px] animate-pulse" />
        <div className="absolute top-60 left-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute bottom-40 right-1/4 w-56 h-56 rounded-full bg-primary/10 blur-[100px]" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(rgba(20, 184, 166, 0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QRCodesContent
          qrCodes={qrCodes}
          folders={folders}
          campaigns={campaigns}
          tier={tier}
        />
      </div>
    </div>
  );
}
