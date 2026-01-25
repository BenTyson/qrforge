import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CopyButton } from './CopyButton';
import {
  LandingBackground,
  LandingCard,
  LandingCardContent,
  LandingFooter
} from '@/components/landing';

interface PageProps {
  params: Promise<{ code: string }>;
}

interface WiFiContent {
  type: 'wifi';
  ssid: string;
  password?: string;
  encryption?: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export default async function WiFiPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('id, content, content_type, name')
    .eq('short_code', code)
    .single();

  if (error || !qrCode || qrCode.content_type !== 'wifi') {
    notFound();
  }

  const content = qrCode.content as WiFiContent;
  const accentColor = '#14b8a6';

  return (
    <LandingBackground accentColor={accentColor} className="flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <LandingCard>
          <LandingCardContent>
            {/* WiFi Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              WiFi Network
            </h1>
            <p className="text-zinc-400 text-center mb-8">
              Connect to this network
            </p>

            {/* Network Details */}
            <div className="space-y-4">
              <div className="bg-zinc-900/50 rounded-lg p-4">
                <label className="text-xs text-zinc-500 uppercase tracking-wide">Network Name (SSID)</label>
                <p className="text-lg text-white font-medium mt-1">{content.ssid}</p>
              </div>

              {content.password && content.encryption !== 'nopass' && (
                <div className="bg-zinc-900/50 rounded-lg p-4">
                  <label className="text-xs text-zinc-500 uppercase tracking-wide">Password</label>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-lg text-white font-mono">{content.password}</p>
                    <CopyButton text={content.password} />
                  </div>
                </div>
              )}

              <div className="bg-zinc-900/50 rounded-lg p-4">
                <label className="text-xs text-zinc-500 uppercase tracking-wide">Security</label>
                <p className="text-lg text-white mt-1">
                  {content.encryption === 'nopass' ? 'Open (No Password)' : content.encryption || 'WPA'}
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="text-sm font-medium text-primary mb-2">How to Connect</h3>
              <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                <li>Open your device&apos;s WiFi settings</li>
                <li>Look for &quot;{content.ssid}&quot;</li>
                {content.password && content.encryption !== 'nopass' && (
                  <li>Enter the password shown above</li>
                )}
                <li>Tap Connect</li>
              </ol>
            </div>
          </LandingCardContent>
        </LandingCard>

        <LandingFooter accentColor={accentColor} />
      </div>
    </LandingBackground>
  );
}
