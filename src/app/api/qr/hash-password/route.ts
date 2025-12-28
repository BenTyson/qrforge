import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    if (password.length > 72) {
      // bcrypt has a max of 72 bytes
      return NextResponse.json(
        { error: 'Password must be 72 characters or less' },
        { status: 400 }
      );
    }

    // Hash the password with bcrypt
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    return NextResponse.json({ hash });
  } catch (error) {
    console.error('Password hashing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
