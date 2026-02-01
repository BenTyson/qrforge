import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Footer } from '@/components/layout';

export const metadata = {
  title: 'QR Code Not Active - QRWolf',
  description: 'This QR code is not currently active.',
};

interface PageProps {
  searchParams: Promise<{ reason?: string }>;
}

export default async function NotActivePage({ searchParams }: PageProps) {
  const { reason } = await searchParams;
  const isEarly = reason === 'early';
  const isRecurring = reason === 'recurring';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 glass text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-muted/50 rounded-full flex items-center justify-center">
            {isEarly ? (
              <CalendarIcon className="w-8 h-8 text-muted-foreground" />
            ) : isRecurring ? (
              <RecurringIcon className="w-8 h-8 text-muted-foreground" />
            ) : (
              <ClockIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {isEarly ? 'Not Yet Active' : isRecurring ? 'Currently Inactive' : 'No Longer Active'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isEarly
              ? "This QR code hasn't been activated yet. The owner has scheduled it to start at a later time."
              : isRecurring
              ? 'This QR code is on a recurring schedule and is currently outside its active hours. Please try again later.'
              : 'This QR code is no longer active. The scheduled activation window has ended.'
            }
          </p>

          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full">
                Visit QRWolf
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button variant="outline" className="w-full">
                Create Your Own QR Code
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Are you the QR code owner?
            </p>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in to update schedule
              </Button>
            </Link>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
      <line x1="4" y1="4" x2="20" y2="20" />
    </svg>
  );
}

function RecurringIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
