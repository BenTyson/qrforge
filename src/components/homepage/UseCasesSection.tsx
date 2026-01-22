import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UseCaseCard, IconContainer } from './ui';
import { UtensilsIcon, MarketingIcon, TicketIcon, PackageIcon } from '@/components/icons';
import { ADDITIONAL_USE_CASES } from '@/constants/homepage';

export function UseCasesSection() {
  return (
    <section id="use-cases" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Use Cases
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for <span className="gradient-text">how you work</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how businesses like yours use QRWolf to connect with customers
          </p>
        </div>

        {/* Featured Use Cases */}
        <div className="space-y-6">
          {/* Restaurant */}
          <Card className="p-6 md:p-8 glass overflow-hidden">
            <UseCaseCard
              icon={<UtensilsIcon />}
              title="Restaurants & Cafés"
              subtitle="Digital menus that update instantly"
              problem="Reprinting menus every time prices change costs hundreds. Paper menus get dirty and outdated."
              solution="One QR code on each table. Update prices, add specials, or swap the entire menu in seconds."
              badges={['Menu QR', 'PDF Upload', 'Landing Page']}
              stats={[
                { value: '$2,400', label: 'Saved yearly on printing', highlight: true },
                { value: '10 sec', label: 'To update any menu item' },
              ]}
            />
          </Card>

          {/* Marketing */}
          <Card className="p-6 md:p-8 glass overflow-hidden">
            <UseCaseCard
              icon={<MarketingIcon />}
              title="Marketing & Advertising"
              subtitle="Campaigns you can measure and optimize"
              problem="Print campaigns can't be changed after printing. No way to know if billboards, flyers, or packaging actually drive traffic."
              solution="Dynamic QR codes that redirect anywhere. Change destinations mid-campaign. Track every scan by location and time."
              badges={['Dynamic URL', 'Scan Analytics', 'Bulk Generation']}
              stats={[
                { value: '3x', label: 'More campaign flexibility', highlight: true },
                { value: 'Real-time', label: 'A/B test tracking' },
              ]}
              reversed
            />
          </Card>

          {/* Events */}
          <Card className="p-6 md:p-8 glass overflow-hidden">
            <UseCaseCard
              icon={<TicketIcon />}
              title="Events & Conferences"
              subtitle="Ticketing, check-in, and attendee engagement"
              problem="Managing hundreds of unique tickets is chaotic. No visibility into check-in patterns or attendee flow."
              solution="Bulk generate unique QR codes from CSV. Track when attendees arrive and from which entrance. Add password protection for VIP areas."
              badges={['Bulk CSV', 'Event QR', 'Password Protection']}
              stats={[
                { value: '500+', label: 'Unique codes in minutes', highlight: true },
                { value: 'Live', label: 'Check-in dashboard' },
              ]}
            />
          </Card>

          {/* Retail */}
          <Card className="p-6 md:p-8 glass overflow-hidden">
            <UseCaseCard
              icon={<PackageIcon />}
              title="Product & Packaging"
              subtitle="Connect physical products to digital experiences"
              problem="Static product links become outdated. Packaging can't be updated once printed. No insight into customer engagement."
              solution="Dynamic QR codes on packaging that link to manuals, videos, or promotions. Update destinations anytime. See which products get scanned most."
              badges={['Video QR', 'PDF Manual', 'Coupon Codes']}
              stats={[
                { value: '47%', label: 'Increase in engagement', highlight: true },
                { value: '0', label: 'Packaging reprints needed' },
              ]}
              reversed
            />
          </Card>
        </div>

        {/* More use cases grid */}
        <div className="mt-12">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Also perfect for
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ADDITIONAL_USE_CASES.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <IconContainer size="sm" className="text-primary">
                  {item.icon}
                </IconContainer>
                <span className="text-sm font-medium">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
