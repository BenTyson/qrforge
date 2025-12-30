'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LEARN_CATEGORIES } from '@/lib/content/utils';
import { BookOpen, Cog, Lightbulb, Building2, CheckCircle2, Code2 } from 'lucide-react';

interface LearnArticle {
  title: string;
  slug: string;
  category: string;
  order: number;
}

interface LearnSidebarProps {
  articles: LearnArticle[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'qr-basics': <BookOpen className="w-4 h-4" />,
  'how-it-works': <Cog className="w-4 h-4" />,
  'use-cases': <Lightbulb className="w-4 h-4" />,
  'industries': <Building2 className="w-4 h-4" />,
  'best-practices': <CheckCircle2 className="w-4 h-4" />,
  'technical': <Code2 className="w-4 h-4" />,
};

export function LearnSidebar({ articles }: LearnSidebarProps) {
  const pathname = usePathname();
  const currentSlug = pathname?.split('/').pop();

  const articlesByCategory = LEARN_CATEGORIES.map(cat => ({
    ...cat,
    icon: CATEGORY_ICONS[cat.slug],
    articles: articles
      .filter(a => a.category === cat.slug)
      .sort((a, b) => a.order - b.order),
  }));

  return (
    <nav className="glass rounded-xl p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
      <h4 className="font-semibold mb-4 text-lg">Learn QR Codes</h4>
      <div className="space-y-4">
        {articlesByCategory.map(category => (
          <div key={category.slug}>
            <Link
              href={`/learn/category/${category.slug}`}
              className="flex items-center gap-2 font-medium text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              {category.icon}
              {category.label}
            </Link>
            {category.articles.length > 0 && (
              <ul className="space-y-1 pl-6 border-l border-border">
                {category.articles.map(article => (
                  <li key={article.slug}>
                    <Link
                      href={`/learn/${article.slug}`}
                      className={cn(
                        'block py-1 text-sm transition-colors hover:text-primary',
                        currentSlug === article.slug
                          ? 'text-primary font-medium'
                          : 'text-muted-foreground'
                      )}
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
