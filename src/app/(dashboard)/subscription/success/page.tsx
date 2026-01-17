'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

const CONFETTI_COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#eab308', '#ef4444'];

// Pre-generate confetti configuration at module level (runs once at import time)
const CONFETTI_CONFIG = Array.from({ length: 50 }, (_, i) => ({
  left: `${(i * 2) % 100}%`, // Distribute evenly instead of random
  animationDelay: `${(i * 0.04) % 2}s`,
  animationDuration: `${2 + (i * 0.04) % 2}s`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

type Tier = 'free' | 'pro' | 'business';

const TIER_INFO: Record<Tier, { name: string; color: string; features: string[] }> = {
  free: {
    name: 'Free',
    color: 'text-zinc-400',
    features: [],
  },
  pro: {
    name: 'Pro',
    color: 'text-primary',
    features: [
      'Up to 50 dynamic QR codes',
      '10,000 scans per month',
      'Full scan analytics',
      'Custom logo upload',
      'SVG & PNG downloads',
      'Password protection',
      'Expiration & scheduling',
    ],
  },
  business: {
    name: 'Business',
    color: 'text-cyan-400',
    features: [
      'Unlimited dynamic QR codes',
      'Unlimited scans',
      'REST API access',
      'Bulk CSV generation',
      'Webhook integrations',
    ],
  },
};

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const [tier, setTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const fetchTier = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (profile?.subscription_tier) {
        setTier(profile.subscription_tier as Tier);
      }
      setLoading(false);
    };

    fetchTier();

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tierInfo = tier ? TIER_INFO[tier] : TIER_INFO.pro;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {CONFETTI_CONFIG.map((config, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: config.left,
                top: '-20px',
                animationDelay: config.animationDelay,
                animationDuration: config.animationDuration,
              }}
            >
              <div
                className="w-3 h-3 rotate-45"
                style={{
                  backgroundColor: config.color,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      <Card className="relative max-w-lg w-full p-8 md:p-12 glass text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse-slow">
              <div className="w-16 h-16 rounded-full bg-green-500/30 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            {/* Sparkles */}
            <div className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400 animate-ping">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -left-3 w-3 h-3 text-primary animate-ping" style={{ animationDelay: '0.5s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Welcome to{' '}
          <span className={tierInfo.color}>{tierInfo.name}</span>!
        </h1>
        <p className="text-muted-foreground mb-8">
          Your subscription is now active. You have access to all {tierInfo.name} features.
        </p>

        {/* Features Unlocked */}
        {tier && tier !== 'free' && (
          <div className="bg-secondary/30 rounded-xl p-6 mb-8 text-left">
            <p className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Features Unlocked
            </p>
            <ul className="space-y-2.5">
              {tierInfo.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1 glow">
            <Link href="/qr-codes/new">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create QR Code
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Receipt Note */}
        <p className="text-xs text-muted-foreground mt-6">
          A receipt has been sent to your email. You can manage your subscription anytime in{' '}
          <Link href="/settings" className="text-primary hover:underline">
            Settings
          </Link>
          .
        </p>
      </Card>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
