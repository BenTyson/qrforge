import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Throw a test error to verify Sentry is capturing
    throw new Error('Sentry test error - this is intentional');
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({
      success: true,
      message: 'Test error sent to Sentry. Check your Sentry dashboard.',
    });
  }
}
