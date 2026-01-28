import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FeatureListItem, IconContainer } from './ui';
import { CircleIcon, QRCodeIcon, ArrowRightIcon } from '@/components/icons';

export function ComparisonSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Why choose <span className="gradient-text">QRWolf?</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We built the QR code tool we wished existed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Others */}
          <Card className="p-6 glass border-red-500/20">
            <div className="flex items-center gap-2 mb-6">
              <IconContainer size="sm" className="bg-red-500/10">
                <CircleIcon />
              </IconContainer>
              <h3 className="font-semibold text-muted-foreground">
                Other QR Generators
              </h3>
            </div>

            <ul className="space-y-4">
              <FeatureListItem
                positive={false}
                title="Limited free tier"
                description="3-5 QR codes, then forced to upgrade"
              />
              <FeatureListItem
                positive={false}
                title="Cluttered interfaces"
                description="Confusing dashboards, buried features"
              />
              <FeatureListItem
                positive={false}
                title="Basic analytics only"
                description="Just scan counts, no location or device data"
              />
              <FeatureListItem
                positive={false}
                title="Watermarks on free tier"
                description="Ugly branding on your QR codes"
              />
            </ul>
          </Card>

          {/* QRWolf */}
          <Card className="p-6 glass border-primary glow">
            <div className="flex items-center gap-2 mb-6">
              <IconContainer size="sm">
                <QRCodeIcon />
              </IconContainer>
              <h3 className="font-semibold">QRWolf</h3>
              <Badge className="bg-primary/10 text-primary text-xs">
                Recommended
              </Badge>
            </div>

            <ul className="space-y-4">
              <FeatureListItem
                positive={true}
                title="Generous free tier"
                description="5 free QR codes, all with tracking"
              />
              <FeatureListItem
                positive={true}
                title="Clean, intuitive Studio"
                description="Step-by-step creation, live preview"
              />
              <FeatureListItem
                positive={true}
                title="Rich analytics"
                description="Location, device, time, and trend data"
              />
              <FeatureListItem
                positive={true}
                title="No watermarks ever"
                description="Clean, professional QR codes on all plans"
              />
            </ul>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/signup">
            <Button size="lg" className="glow-hover">
              Try QRWolf Free
              <ArrowRightIcon className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
