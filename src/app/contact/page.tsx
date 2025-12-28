import Link from 'next/link';
import { Footer } from '@/components/layout';
import { PublicNav } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the QRWolf team. We\'re here to help with questions, feedback, and support.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground">
              Have a question or need help? We&apos;re here for you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card className="p-6 glass">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <MailIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">General Inquiries</h2>
              <p className="text-sm text-muted-foreground mb-4">
                For general questions about QRWolf and our services.
              </p>
              <a href="mailto:hello@qrwolf.com" className="text-primary hover:underline">
                hello@qrwolf.com
              </a>
            </Card>

            <Card className="p-6 glass">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <SupportIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Technical Support</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Need help with your account or QR codes? We&apos;re here to assist.
              </p>
              <a href="mailto:support@qrwolf.com" className="text-primary hover:underline">
                support@qrwolf.com
              </a>
            </Card>

            <Card className="p-6 glass">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <BriefcaseIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Business &amp; Partnerships</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Interested in partnering with us or enterprise solutions?
              </p>
              <a href="mailto:business@qrwolf.com" className="text-primary hover:underline">
                business@qrwolf.com
              </a>
            </Card>

            <Card className="p-6 glass">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <ShieldIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Privacy &amp; Legal</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Questions about data privacy, terms, or legal matters.
              </p>
              <a href="mailto:legal@qrwolf.com" className="text-primary hover:underline">
                legal@qrwolf.com
              </a>
            </Card>
          </div>

          <Card className="p-8 glass text-center">
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mb-6">
              Before reaching out, you might find your answer in our FAQ section.
            </p>
            <Link href="/#faq">
              <Button variant="outline">View FAQ</Button>
            </Link>
          </Card>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              We typically respond within 24 hours during business days.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SupportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
