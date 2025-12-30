import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface RelatedArticle {
  title: string;
  description: string;
  slug: string;
  category: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
  type: 'blog' | 'learn';
}

export function RelatedArticles({ articles, type }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-border">
      <h3 className="text-xl font-semibold mb-6">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => {
          const href = type === 'blog' ? `/blog/${article.slug}` : `/learn/${article.slug}`;
          return (
            <Link key={article.slug} href={href} className="group">
              <Card className="h-full glass transition-all duration-300 group-hover:border-primary/30">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit text-xs mb-2 capitalize">
                    {article.category.replace('-', ' ')}
                  </Badge>
                  <CardTitle className="text-base group-hover:text-primary transition-colors flex items-center gap-2">
                    {article.title}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {article.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
