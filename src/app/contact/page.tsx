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
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground">
              Questions, feedback, or just want to say hi? We&apos;d love to hear from you.
            </p>
          </div>

          <Card className="p-8 glass text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MailIcon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Email Us</h2>
            <p className="text-muted-foreground mb-6">
              For all inquiries, reach out and we&apos;ll get back to you as soon as possible.
            </p>
            <a
              href="mailto:hello@qrwolf.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <MailIcon className="w-5 h-5" />
              hello@qrwolf.com
            </a>
            <p className="text-xs text-muted-foreground mt-4">
              We typically respond within 24 hours
            </p>
          </Card>

          <Card className="p-6 glass text-center">
            <h3 className="font-semibold mb-2">Looking for quick answers?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Check out our FAQ for common questions.
            </p>
            <Link href="/#faq">
              <Button variant="outline" size="sm">View FAQ</Button>
            </Link>
          </Card>
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
