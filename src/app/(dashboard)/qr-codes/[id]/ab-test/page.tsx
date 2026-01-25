import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ABTestDashboard } from '@/components/analytics/ABTestDashboard';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

async function ABTestContent({ qrCodeId }: { qrCodeId: string }) {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get QR code
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('id, name, user_id')
    .eq('id', qrCodeId)
    .single();

  if (error || !qrCode) {
    notFound();
  }

  // Verify ownership
  if (qrCode.user_id !== user.id) {
    notFound();
  }

  return (
    <ABTestDashboard
      qrCodeId={qrCode.id}
      qrCodeName={qrCode.name}
    />
  );
}

export default async function ABTestPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="container max-w-4xl py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
          Dashboard
        </Link>
        <span className="text-slate-600">/</span>
        <Link href="/qr-codes" className="text-slate-400 hover:text-white transition-colors">
          QR Codes
        </Link>
        <span className="text-slate-600">/</span>
        <Link href={`/qr-codes/${id}`} className="text-slate-400 hover:text-white transition-colors">
          Details
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-white">A/B Test</span>
      </nav>

      <Suspense fallback={
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      }>
        <ABTestContent qrCodeId={id} />
      </Suspense>
    </div>
  );
}
