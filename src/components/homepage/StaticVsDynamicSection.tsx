import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleListItem } from './ui';

export function StaticVsDynamicSection() {
  return (
    <section className="py-16 px-4 bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Static vs Dynamic:{' '}
          <span className="gradient-text">What&apos;s the difference?</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Static QR codes link directly to a URL. Dynamic QR codes route through
          us, so you can change the destination anytime and track every scan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Static Card */}
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-4">Static QR Code</h3>
            <ul className="space-y-3 mb-4">
              <SimpleListItem positive>Free forever</SimpleListItem>
              <SimpleListItem positive>Direct link to destination</SimpleListItem>
              <SimpleListItem positive={false} muted>
                Cannot change after printing
              </SimpleListItem>
              <SimpleListItem positive={false} muted>
                No scan tracking
              </SimpleListItem>
            </ul>
            <p className="text-xs text-muted-foreground border-t border-border/50 pt-4">
              Best for: Personal use, one-time links
            </p>
          </Card>

          {/* Dynamic Card - highlighted */}
          <Card className="p-6 glass border-primary glow">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold">Dynamic QR Code</h3>
              <Badge className="bg-primary/10 text-primary text-xs">Pro</Badge>
            </div>
            <ul className="space-y-3 mb-4">
              <SimpleListItem positive>Edit destination anytime</SimpleListItem>
              <SimpleListItem positive>Track every scan</SimpleListItem>
              <SimpleListItem positive>Set expiration dates</SimpleListItem>
              <SimpleListItem positive>Password protection</SimpleListItem>
            </ul>
            <p className="text-xs text-muted-foreground border-t border-border/50 pt-4">
              Best for: Business, marketing campaigns, menus
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
