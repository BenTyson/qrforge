import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconContainer, FeatureListItem } from './ui';
import {
  PatternsIcon,
  CornerStylesIcon,
  GradientIcon,
  FrameIcon,
  ArrowLineRightIcon,
} from '@/components/icons';

export function CreativeDesignSection() {
  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* LEFT: Visual Showcase Card */}
          <Card className="p-10 glass glow overflow-hidden">
            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground">
                Same QR code, infinite styles
              </p>
            </div>

            {/* 2-panel Grid of Styled QR Codes */}
            <div className="grid grid-cols-2 gap-8">
              {/* Panel 1: Gradient Dots */}
              <div className="w-full aspect-square rounded-xl bg-white p-4">
                <Image
                  src="/codes/qrwolf-qr-wolf.png"
                  alt="QR code with gradient and dots pattern"
                  width={300}
                  height={300}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Panel 2: Custom Pattern */}
              <div className="w-full aspect-square rounded-xl bg-[#0f172a] p-4">
                <Image
                  src="/codes/qrwolf-qrwolf-3.png"
                  alt="QR code with custom pattern style"
                  width={300}
                  height={300}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Bottom stat bar */}
            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="text-2xl font-bold text-primary">∞</span> style
                combinations
              </p>
            </div>
          </Card>

          {/* RIGHT: Copy + Features + CTA */}
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Pro Feature
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What if your QR code was a{' '}
              <span className="gradient-text">work of art?</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Go beyond basic squares. With Pro, unlock creative styling options
              that make your QR codes truly stand out and match your brand
              perfectly.
            </p>

            <ul className="space-y-4 mb-8">
              {/* 1. Module Patterns */}
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <PatternsIcon />
                  </IconContainer>
                }
                title="6 unique patterns"
                description="From classic squares to elegant dots"
              />

              {/* 2. Corner Styles */}
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <CornerStylesIcon />
                  </IconContainer>
                }
                title="Custom corner styles"
                description="6 eye shapes, mix and match"
              />

              {/* 3. Gradients */}
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <GradientIcon />
                  </IconContainer>
                }
                title="Stunning gradients"
                description="6 presets or create your own blend"
              />

              {/* 4. Frames */}
              <FeatureListItem
                icon={
                  <IconContainer size="sm">
                    <FrameIcon />
                  </IconContainer>
                }
                title="Decorative frames"
                description="Add call-to-action text around your code"
              />
            </ul>

            <Link href="/plans">
              <Button size="lg" className="glow-hover">
                Unlock Creative Design
                <ArrowLineRightIcon className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
