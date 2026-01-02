import { createClient } from '@supabase/supabase-js';

// Admin email from environment variable
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

export function isAdmin(email: string | null | undefined): boolean {
  if (!ADMIN_EMAIL) {
    console.warn('ADMIN_EMAIL environment variable not set');
    return false;
  }
  return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// Create admin Supabase client with service role (bypasses RLS)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey);
}
