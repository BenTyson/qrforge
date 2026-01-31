'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { FeedbackDashboard } from '@/components/analytics/FeedbackDashboard';
import type { SubscriptionTier } from '@/lib/stripe/plans';

export default function FeedbackDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const qrCodeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [qrName, setQrName] = useState('');
  const [tier, setTier] = useState<SubscriptionTier>('free');

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch QR code to verify ownership and get name
      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('name, content_type')
        .eq('id', qrCodeId)
        .eq('user_id', user.id)
        .single();

      if (error || !qrCode || qrCode.content_type !== 'feedback') {
        router.push('/qr-codes');
        return;
      }

      setQrName(qrCode.name);

      // Fetch user tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      setTier((profile?.subscription_tier || 'free') as SubscriptionTier);
      setLoading(false);
    }

    fetchData();
  }, [qrCodeId, router]);

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="h-8 w-48 bg-secondary/50 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/qr-codes" className="hover:text-foreground transition-colors">
          QR Codes
        </Link>
        <span>/</span>
        <Link href={`/qr-codes/${qrCodeId}/edit`} className="hover:text-foreground transition-colors">
          {qrName}
        </Link>
        <span>/</span>
        <span className="text-foreground">Feedback</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Feedback Responses</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage feedback for &ldquo;{qrName}&rdquo;
          </p>
        </div>
      </div>

      <FeedbackDashboard qrCodeId={qrCodeId} userTier={tier} />
    </div>
  );
}
