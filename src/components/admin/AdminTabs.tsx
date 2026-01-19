'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface AdminTabsProps {
  tabs: Tab[];
  basePath: string;
}

export function AdminTabs({ tabs, basePath }: AdminTabsProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || tabs[0]?.id;

  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`${basePath}?tab=${tab.id}`}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2',
            currentTab === tab.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'px-2 py-0.5 text-xs rounded-full',
                currentTab === tab.id
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
