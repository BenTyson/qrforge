import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconContainer, FeatureListItem, StatBlock } from './ui';
import {
  ShieldIcon,
  SmileIcon,
  ImageIcon,
  SettingsIcon,
  ArrowLineRightIcon,
} from '@/components/icons';

export function BrandingShowcaseSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Pro Feature
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What if your QR code{' '}
              <span className="gradient-text">looked like you?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Generic QR codes get ignored. Branded QR codes get scanned. Add
              your logo and colors to create instant recognition and build
              trust.
            </p>

            <ul className="space-y-4 mb-8">
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <ShieldIcon />
                  </IconContainer>
                }
                title="Build trust instantly"
                description="People scan codes they recognize"
              />
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <SmileIcon />
                  </IconContainer>
                }
                title="Increase engagement"
                description="Branded codes see up to 80% more scans"
              />
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <ImageIcon />
                  </IconContainer>
                }
                title="Your logo, front and center"
                description="Upload any image, auto-optimized for scanning"
              />
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <SettingsIcon />
                  </IconContainer>
                }
                title="Match your brand colors"
                description="Custom foreground and background colors"
              />
            </ul>

            <Link href="/signup">
              <Button size="lg" className="glow-hover">
                Start Branding with Pro
                <ArrowLineRightIcon className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Right: Visual Demo */}
          <div className="order-first lg:order-last">
            <Card className="p-8 glass glow overflow-hidden">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Your brand, your QR code
                </p>
              </div>

              {/* Mock QR Code Comparison */}
              <div className="grid grid-cols-2 gap-6">
                {/* Generic QR */}
                <div className="text-center">
                  <div className="bg-white p-3 rounded-xl mb-3 aspect-square">
                    <Image
                      src="/codes/qrwolf-qr-wolf-4.png"
                      alt="Generic black and white QR code"
                      width={200}
                      height={200}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Generic</p>
                </div>

                {/* Branded QR */}
                <div className="text-center">
                  <div className="rounded-xl mb-3 aspect-square bg-white p-3">
                    <Image
                      src="/codes/qrwolf-qrwolf-2.png"
                      alt="Branded QR code with custom logo"
                      width={200}
                      height={200}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-primary font-medium">Branded</p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-2 gap-4 text-center">
                <StatBlock value="12%" label="Scan rate" />
                <StatBlock value="47%" label="Scan rate" highlight />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
