import { Footer } from '@/components/layout';
import { PublicNav } from '@/components/layout';

export const metadata = {
  title: 'Terms of Service',
  description: 'QRWolf Terms of Service - Rules and guidelines for using our service.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 26, 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing or using QRWolf (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              QRWolf provides a QR code generation and management platform that allows users to create static and dynamic QR codes, track scan analytics, and manage QR code destinations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Account Registration</h2>
            <p className="text-muted-foreground mb-4">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Create QR codes linking to illegal, harmful, or malicious content</li>
              <li>Distribute malware, phishing attempts, or fraudulent schemes</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm others</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to bypass usage limits or security measures</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Subscription Plans and Payments</h2>
            <p className="text-muted-foreground mb-4">
              QRWolf offers free and paid subscription plans. For paid plans:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fees are billed in advance on a monthly or annual basis</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You may cancel at any time; access continues until the end of your billing period</li>
              <li>Refunds are provided at our discretion</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Usage Limits</h2>
            <p className="text-muted-foreground mb-4">
              Each plan has specific limits on QR codes, scans, and features. If you exceed your plan limits, we may throttle service or require an upgrade. Current limits are displayed on our pricing page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              You retain ownership of content you create using the Service. By using the Service, you grant us a limited license to store and process your content as necessary to provide the Service. The QRWolf name, logo, and platform are our intellectual property.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. QR Code Availability</h2>
            <p className="text-muted-foreground mb-4">
              We strive for 99.9% uptime for QR code redirects. However, we do not guarantee uninterrupted service. Dynamic QR codes depend on our redirect service; if your account is terminated or in bad standing, your dynamic QR codes may stop functioning.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We may suspend or terminate your account if you violate these terms. You may close your account at any time through your account settings. Upon termination:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Your access to the Service will be revoked</li>
              <li>Your dynamic QR codes will stop redirecting</li>
              <li>Your data will be deleted according to our data retention policy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, QRWOLF SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We may modify these terms at any time. We will notify users of material changes via email or through the Service. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. Governing Law</h2>
            <p className="text-muted-foreground mb-4">
              These terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">14. Contact</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: <a href="mailto:legal@qrwolf.com" className="text-primary hover:underline">legal@qrwolf.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
