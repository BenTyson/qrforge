import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getEffectiveTier } from '@/lib/stripe/plans';
import { QRStudio } from '@/components/qr/studio';

interface EditQRCodePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQRCodePage({ params }: EditQRCodePageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, trial_ends_at')
    .eq('id', user.id)
    .single();

  const baseTier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business';
  const tier = getEffectiveTier(baseTier, profile?.trial_ends_at, profile?.subscription_status);

  if (tier === 'free') {
    const { id } = await params;
    redirect(`/qr-codes/${id}?upgrade=edit`);
  }

  const { id } = await params;
  return <QRStudio mode="edit" qrCodeId={id} />;
}
