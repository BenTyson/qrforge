import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import { ADMIN_EMAIL } from '@/lib/admin/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect if not authenticated
  if (!user) {
    redirect('/login');
  }

  // Redirect if not admin
  if (user.email !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex">
      <AdminNav />
      <main className="flex-1 ml-64 p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
