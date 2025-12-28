import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { code, password } = await request.json();

    if (!code || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing code or password' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find the QR code
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('password_hash, destination_url, content, show_landing_page')
      .eq('short_code', code)
      .single();

    if (error || !qrCode) {
      return NextResponse.json(
        { success: false, error: 'QR code not found' },
        { status: 404 }
      );
    }

    if (!qrCode.password_hash) {
      return NextResponse.json(
        { success: false, error: 'This QR code is not password protected' },
        { status: 400 }
      );
    }

    // Hash the provided password and compare
    const inputHash = crypto.createHash('sha256').update(password).digest('hex');

    if (inputHash !== qrCode.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Get destination URL
    let destinationUrl = qrCode.destination_url;

    if (!destinationUrl && qrCode.content) {
      const content = qrCode.content as Record<string, any>;
      if (content.type === 'url' && content.url) {
        destinationUrl = content.url;
      }
    }

    if (!destinationUrl) {
      return NextResponse.json(
        { success: false, error: 'No destination URL found' },
        { status: 400 }
      );
    }

    // If landing page is enabled, redirect there instead
    if (qrCode.show_landing_page) {
      return NextResponse.json({
        success: true,
        redirectUrl: `/r/${code}/landing`,
        hasLandingPage: true,
      });
    }

    return NextResponse.json({
      success: true,
      destinationUrl,
      hasLandingPage: false,
    });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
