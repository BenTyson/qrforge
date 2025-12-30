'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TocEntry {
  title: string;
  url: string;
  items?: TocEntry[];
}

interface TableOfContentsProps {
  toc: TocEntry[];
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0% -80% 0%' }
    );

    const headings = document.querySelectorAll('article h2, article h3');
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  // Flatten nested toc structure
  const flattenToc = (entries: TocEntry[], depth = 2): { title: string; url: string; depth: number }[] => {
    return entries.flatMap(entry => [
      { title: entry.title, url: entry.url, depth },
      ...(entry.items ? flattenToc(entry.items, depth + 1) : []),
    ]);
  };

  const flatToc = flattenToc(toc);

  if (flatToc.length === 0) return null;

  return (
    <nav className="glass rounded-xl p-4 sticky top-24">
      <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
        On This Page
      </h4>
      <ul className="space-y-2 text-sm">
        {flatToc.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              className={cn(
                'block py-1 transition-colors hover:text-primary',
                item.depth > 2 && 'pl-4',
                activeId === item.url.slice(1)
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
