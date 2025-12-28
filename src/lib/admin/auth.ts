import { createClient } from '@supabase/supabase-js';

// Hardcoded admin email - only this user can access /admin
export const ADMIN_EMAIL = 'ideaswithben@gmail.com';

export function isAdmin(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL;
}

// Create admin Supabase client with service role (bypasses RLS)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey);
}
