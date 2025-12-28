import { cn } from '@/lib/utils';

type ColorVariant = 'primary' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'violet';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: ColorVariant;
  subtitle?: string;
}

const colorStyles: Record<ColorVariant, { gradient: string; icon: string; text: string }> = {
  primary: {
    gradient: 'from-primary/20 via-primary/10 to-transparent',
    icon: 'bg-primary/20 text-primary',
    text: 'text-primary',
  },
  cyan: {
    gradient: 'from-cyan-500/20 via-cyan-500/10 to-transparent',
    icon: 'bg-cyan-500/20 text-cyan-500',
    text: 'text-cyan-500',
  },
  purple: {
    gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
    icon: 'bg-purple-500/20 text-purple-500',
    text: 'text-purple-500',
  },
  emerald: {
    gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
    icon: 'bg-emerald-500/20 text-emerald-500',
    text: 'text-emerald-500',
  },
  amber: {
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    icon: 'bg-amber-500/20 text-amber-500',
    text: 'text-amber-500',
  },
  violet: {
    gradient: 'from-violet-500/20 via-violet-500/10 to-transparent',
    icon: 'bg-violet-500/20 text-violet-500',
    text: 'text-violet-500',
  },
};

export function AdminStatsCard({ title, value, icon: Icon, color, subtitle }: AdminStatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/50 p-6',
        'bg-gradient-to-br',
        styles.gradient
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className={cn('text-3xl font-bold', styles.text)}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
