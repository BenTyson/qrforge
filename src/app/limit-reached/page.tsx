import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Footer } from '@/components/layout';

export const metadata = {
  title: 'Scan Limit Reached - QRWolf',
  description: 'This QR code has reached its monthly scan limit.',
};

export default function LimitReachedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 glass text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-amber-500/10 rounded-full flex items-center justify-center">
          <WarningIcon className="w-8 h-8 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Scan Limit Reached</h1>
        <p className="text-muted-foreground mb-6">
          This QR code has reached its monthly scan limit. The owner needs to upgrade their plan to continue receiving scans.
        </p>

        <div className="space-y-3">
          <Link href="/#pricing">
            <Button className="w-full">
              <SparkleIcon className="w-4 h-4 mr-2" />
              View Upgrade Options
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Learn About QRWolf
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Are you the QR code owner?
          </p>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in to upgrade
            </Button>
          </Link>
        </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
