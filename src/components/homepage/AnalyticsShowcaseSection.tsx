import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconContainer, FeatureListItem } from './ui';
import {
  ChartIcon,
  LocationIcon,
  MobileIcon,
  ClockIcon,
  TrendUpIcon,
  ArrowLineRightIcon,
} from '@/components/icons';

export function AnalyticsShowcaseSection() {
  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Mock Dashboard */}
          <div className="order-2 lg:order-1">
            <Card className="p-6 glass glow overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <ChartIcon className="w-5 h-5" />
                <span className="font-semibold">Scan Analytics</span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Total Scans</p>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-green-500">+23% this week</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">
                    Unique Visitors
                  </p>
                  <p className="text-2xl font-bold">892</p>
                  <p className="text-xs text-green-500">+18% this week</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Top Location</p>
                  <p className="text-lg font-semibold">United States</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Peak Time</p>
                  <p className="text-lg font-semibold">2-4 PM</p>
                </div>
              </div>

              {/* Mini Chart */}
              <div className="h-16 bg-secondary/30 rounded-lg flex items-end justify-around px-2 pb-2">
                {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                  <div
                    key={i}
                    className="w-6 bg-primary/60 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Copy */}
          <div className="order-1 lg:order-2">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Pro Feature
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What if you knew{' '}
              <span className="gradient-text">exactly</span> when they scan?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stop guessing. See real-time data on who&apos;s scanning your QR
              codes, where they&apos;re located, and when they&apos;re most
              active.
            </p>

            <ul className="space-y-4 mb-8">
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <LocationIcon />
                  </IconContainer>
                }
                title="Location data"
                description="Country and city breakdowns"
              />
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <MobileIcon />
                  </IconContainer>
                }
                title="Device insights"
                description="Mobile, tablet, or desktop"
              />
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <ClockIcon />
                  </IconContainer>
                }
                title="Time patterns"
                description="Peak hours and days"
              />
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <TrendUpIcon />
                  </IconContainer>
                }
                title="Trend tracking"
                description="Performance over time"
              />
            </ul>

            <Link href="/signup">
              <Button size="lg" className="glow-hover">
                Get Analytics with Pro
                <ArrowLineRightIcon className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
