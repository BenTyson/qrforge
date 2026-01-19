import { cn } from '@/lib/utils';

interface DetailItem {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

interface AdminDetailSectionProps {
  title: string;
  items: DetailItem[];
  className?: string;
  action?: React.ReactNode;
}

export function AdminDetailSection({ title, items, className, action }: AdminDetailSectionProps) {
  return (
    <div className={cn('rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">{title}</h3>
        {action}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'space-y-1',
              item.fullWidth && 'md:col-span-2'
            )}
          >
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {item.label}
            </dt>
            <dd className="text-sm">
              {item.value ?? <span className="text-muted-foreground">—</span>}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}
