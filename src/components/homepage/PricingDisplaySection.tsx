import { PricingSection } from '@/components/pricing';
import { LargeSectionHeader } from './ui';

interface PricingDisplaySectionProps {
  isAuthenticated: boolean;
  currentTier: string;
}

export function PricingDisplaySection({
  isAuthenticated,
  currentTier,
}: PricingDisplaySectionProps) {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <LargeSectionHeader
          title="Simple,"
          highlightedText="transparent"
          description="Start free, upgrade when you need more."
        />

        <PricingSection
          isAuthenticated={isAuthenticated}
          currentTier={currentTier}
        />
      </div>
    </section>
  );
}
