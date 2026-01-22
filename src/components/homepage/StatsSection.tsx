import { STATS } from '@/constants/homepage';

export function StatsSection() {
  return (
    <section className="py-16 border-t border-b border-border/30 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="text-3xl md:text-5xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
