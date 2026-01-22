import { Card } from '@/components/ui/card';
import { LargeSectionHeader } from './ui';
import { FEATURES } from '@/constants/homepage';

export function FeaturesGridSection() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <LargeSectionHeader
          title="Everything you need to"
          highlightedText="create & track"
          description="From simple QR codes to enterprise analytics, QRWolf has you covered."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="p-6 glass hover:glow transition-all duration-300 relative overflow-hidden"
            >
              {feature.tier !== 'free' && (
                <div
                  className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium ${
                    feature.tier === 'pro'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {feature.tier === 'pro' ? 'Pro' : 'Business'}
                </div>
              )}
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
