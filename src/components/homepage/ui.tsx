import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, XIcon } from '@/components/icons';

// Icon container with background - used 25+ times
interface IconContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function IconContainer({ children, className, size = 'md' }: IconContainerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-lg',
    lg: 'w-12 h-12 rounded-xl',
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        'bg-primary/10 flex items-center justify-center shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
}

// Feature list item with icon - used 20+ times
interface FeatureListItemProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  positive?: boolean;
  children?: ReactNode;
  className?: string;
}

export function FeatureListItem({
  icon,
  title,
  description,
  positive = true,
  children,
  className,
}: FeatureListItemProps) {
  const defaultIcon = positive ? (
    <CheckIcon className="mt-0.5" />
  ) : (
    <XIcon className="mt-0.5" />
  );

  return (
    <li className={cn('flex items-start gap-3', className)}>
      {icon || defaultIcon}
      {children || (
        <div>
          {title && <p className="font-medium">{title}</p>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </li>
  );
}

// Simple list item with check/x icon
interface SimpleListItemProps {
  positive?: boolean;
  children: ReactNode;
  muted?: boolean;
  className?: string;
}

export function SimpleListItem({
  positive = true,
  children,
  muted = false,
  className,
}: SimpleListItemProps) {
  return (
    <li
      className={cn(
        'flex items-center gap-2 text-sm',
        muted && 'text-muted-foreground',
        className
      )}
    >
      {positive ? (
        <CheckIcon className="w-4 h-4 shrink-0" />
      ) : (
        <XIcon className="w-4 h-4 shrink-0" />
      )}
      {children}
    </li>
  );
}

// Stat block - used 6+ times
interface StatBlockProps {
  value: string;
  label: string;
  className?: string;
  highlight?: boolean;
}

export function StatBlock({ value, label, className, highlight = false }: StatBlockProps) {
  return (
    <div className={className}>
      <p className={cn('text-2xl font-bold', highlight && 'text-primary')}>
        {value}
      </p>
      <p className={cn('text-xs', highlight ? 'text-primary' : 'text-muted-foreground')}>
        {label}
      </p>
    </div>
  );
}

// Section header with badge, heading, and description - used 8+ times
interface SectionHeaderProps {
  badge?: string;
  badgeVariant?: 'default' | 'outline' | 'pro' | 'business';
  title: ReactNode;
  highlightedText?: string;
  description?: string;
  className?: string;
  centered?: boolean;
}

export function SectionHeader({
  badge,
  badgeVariant = 'default',
  title,
  highlightedText,
  description,
  className,
  centered = true,
}: SectionHeaderProps) {
  const badgeClasses = {
    default: 'bg-primary/10 text-primary border-primary/20',
    outline: 'border-border',
    pro: 'bg-primary/10 text-primary border-primary/20',
    business: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className={cn(centered && 'text-center', className)}>
      {badge && (
        <Badge className={cn('mb-4', badgeClasses[badgeVariant])}>{badge}</Badge>
      )}
      <h2 className="text-2xl md:text-3xl font-bold mb-4">
        {title}
        {highlightedText && (
          <>
            {' '}
            <span className="gradient-text">{highlightedText}</span>
          </>
        )}
      </h2>
      {description && (
        <p
          className={cn(
            'text-muted-foreground',
            centered && 'max-w-xl mx-auto'
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// Large section header for pricing/features
interface LargeSectionHeaderProps {
  title: ReactNode;
  highlightedText?: string;
  description?: string;
  className?: string;
}

export function LargeSectionHeader({
  title,
  highlightedText,
  description,
  className,
}: LargeSectionHeaderProps) {
  return (
    <div className={cn('text-center mb-16', className)}>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        {title}
        {highlightedText && (
          <>
            {' '}
            <span className="gradient-text">{highlightedText}</span>
          </>
        )}
      </h2>
      {description && (
        <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
      )}
    </div>
  );
}

// Use case card with problem/solution pattern
interface UseCaseCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  problem: string;
  solution: string;
  badges: string[];
  stats: { value: string; label: string; highlight?: boolean }[];
  reversed?: boolean;
}

export function UseCaseCard({
  icon,
  title,
  subtitle,
  problem,
  solution,
  badges,
  stats,
  reversed = false,
}: UseCaseCardProps) {
  const content = (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <IconContainer size="lg">{icon}</IconContainer>
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2">
          <XIcon className="mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">The problem:</span>{' '}
            {problem}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckIcon className="mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">The solution:</span>{' '}
            {solution}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <Badge key={badge} variant="outline" className="text-xs">
            {badge}
          </Badge>
        ))}
      </div>
    </div>
  );

  const statsBlock = (
    <div className="bg-secondary/50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-4 h-4 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        </svg>
        <span className="text-sm font-medium">Results</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <StatBlock
            key={stat.label}
            value={stat.value}
            label={stat.label}
            highlight={stat.highlight}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      {reversed ? (
        <>
          <div className="order-2 md:order-1">{statsBlock}</div>
          <div className="order-1 md:order-2">{content}</div>
        </>
      ) : (
        <>
          {content}
          {statsBlock}
        </>
      )}
    </div>
  );
}

// Star rating component
interface StarRatingProps {
  count?: number;
  className?: string;
}

export function StarRating({ count = 5, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-yellow-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// Security feature card
interface SecurityCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function SecurityCard({ icon, title, description }: SecurityCardProps) {
  return (
    <div className="p-4 rounded-xl bg-secondary/30 text-center">
      <IconContainer size="md" className="mx-auto mb-3">
        {icon}
      </IconContainer>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
