import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLineRightIcon } from '@/components/icons';

export function FinalCTASection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
          No credit card required
        </Badge>
        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
          Ready to create your first QR code?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Join thousands of businesses using QRWolf to connect with their
          customers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="glow-hover text-lg px-8">
              Get Started Free
              <ArrowLineRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <a
            href="#pricing"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            View pricing →
          </a>
        </div>
      </div>
    </section>
  );
}
