import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Footer } from '@/components/layout';

export const metadata = {
  title: 'QR Code Expired - QRWolf',
  description: 'This QR code has expired.',
};

export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 glass text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-muted/50 rounded-full flex items-center justify-center">
          <ClockIcon className="w-8 h-8 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-bold mb-2">QR Code Expired</h1>
        <p className="text-muted-foreground mb-6">
          This QR code has expired and is no longer active. The owner may have set an expiration date for this link.
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
              Log in to update expiration
            </Button>
          </Link>
        </div>
        </Card>
      </div>
      <Footer />
    </div>
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
