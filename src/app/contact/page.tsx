import Link from 'next/link';
import { Footer } from '@/components/layout';
import { PublicNav } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContactForm } from '@/components/contact/ContactForm';

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

          <div className="mb-8">
            <ContactForm />
          </div>

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
