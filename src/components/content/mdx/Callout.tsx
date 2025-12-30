import { cn } from '@/lib/utils';
import { AlertCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'error';
  title?: string;
  children: React.ReactNode;
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  tip: Lightbulb,
  error: AlertCircle,
};

const styles = {
  info: 'border-primary/50 bg-primary/10 text-primary',
  warning: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500',
  tip: 'border-green-500/50 bg-green-500/10 text-green-500',
  error: 'border-destructive/50 bg-destructive/10 text-destructive',
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const Icon = icons[type];

  return (
    <div
      className={cn(
        'my-6 rounded-xl border-l-4 p-4',
        styles[type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="text-foreground">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm text-muted-foreground [&>p]:mb-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
