'use client';

import { useMemo } from 'react';
import { getActivePeriodsPreview } from '@/lib/scheduling/utils';
import type { ScheduleRule } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

interface SchedulePreviewProps {
  activeFrom?: string | null;
  activeUntil?: string | null;
  timezone?: string | null;
  rule?: ScheduleRule | null;
}

export function SchedulePreview({ activeFrom, activeUntil, timezone, rule }: SchedulePreviewProps) {
  const periods = useMemo(() =>
    getActivePeriodsPreview({ activeFrom, activeUntil, timezone, rule, days: 7 }),
    [activeFrom, activeUntil, timezone, rule]
  );

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-slate-500 font-medium">7-day preview</p>
      <div className="space-y-1">
        {periods.map((period, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={cn(
              'text-[10px] w-16 shrink-0 text-right font-mono',
              period.isToday ? 'text-primary font-semibold' : 'text-slate-500'
            )}>
              {period.dayLabel}
            </span>
            <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden relative">
              {period.widthPercent > 0 && (
                <div
                  className={cn(
                    'absolute top-0 h-full rounded-full',
                    period.isToday ? 'bg-primary' : 'bg-primary/60'
                  )}
                  style={{
                    left: `${period.startPercent}%`,
                    width: `${Math.min(period.widthPercent, 100 - period.startPercent)}%`,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-slate-600 px-[72px]">
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
        <span>12am</span>
      </div>
    </div>
  );
}
