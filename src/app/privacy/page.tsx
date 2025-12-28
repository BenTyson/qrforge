import { Footer } from '@/components/layout';
import { PublicNav } from '@/components/layout';

export const metadata = {
  title: 'Privacy Policy',
  description: 'QRWolf Privacy Policy - How we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 26, 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              QRWolf (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our QR code generation and tracking service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-medium mb-2">Account Information</h3>
            <p className="text-muted-foreground mb-4">
              When you create an account, we collect your email address and any profile information you choose to provide.
            </p>
            <h3 className="text-lg font-medium mb-2">QR Code Data</h3>
            <p className="text-muted-foreground mb-4">
              We store the QR codes you create, including destination URLs, customization settings, and associated metadata.
            </p>
            <h3 className="text-lg font-medium mb-2">Scan Analytics</h3>
            <p className="text-muted-foreground mb-4">
              For dynamic QR codes, we collect anonymous scan data including: approximate location (country/city), device type, browser type, and timestamp. We do not collect personally identifiable information from people who scan your QR codes.
            </p>
            <h3 className="text-lg font-medium mb-2">Payment Information</h3>
            <p className="text-muted-foreground mb-4">
              Payment processing is handled by Stripe. We do not store your credit card details on our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>To provide and maintain our service</li>
              <li>To process your transactions</li>
              <li>To send you service-related communications</li>
              <li>To provide scan analytics for your QR codes</li>
              <li>To improve and optimize our service</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal data. We may share data with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Service providers:</strong> Stripe (payments), Supabase (database hosting)</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your account data for as long as your account is active. QR code data and scan analytics are retained until you delete them or close your account. You can request deletion of your data at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your data, including encryption in transit (HTTPS) and at rest, secure authentication, and regular security audits.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              We use essential cookies for authentication and session management. We do not use third-party tracking cookies for advertising purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this privacy policy or our data practices, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: <a href="mailto:privacy@qrwolf.com" className="text-primary hover:underline">privacy@qrwolf.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
