import { Metadata } from 'next';
import Link from 'next/link';
import { learnArticles, blogPosts } from '#content';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { ArticleCard } from '@/components/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LEARN_CATEGORIES } from '@/lib/content/utils';
import { BookOpen, Cog, Lightbulb, Building2, CheckCircle2, Code2, ArrowRight, Newspaper } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Learn QR Codes',
  description: 'Everything you need to know about QR codes. From basics to advanced use cases, best practices, and industry guides.',
  openGraph: {
    title: 'Learn QR Codes - QRWolf',
    description: 'Everything you need to know about QR codes. From basics to advanced use cases, best practices, and industry guides.',
  },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'qr-basics': <BookOpen className="w-6 h-6" />,
  'how-it-works': <Cog className="w-6 h-6" />,
  'use-cases': <Lightbulb className="w-6 h-6" />,
  'industries': <Building2 className="w-6 h-6" />,
  'best-practices': <CheckCircle2 className="w-6 h-6" />,
  'technical': <Code2 className="w-6 h-6" />,
};

export default function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const publishedArticles = learnArticles
    .filter(article => !article.draft)
    .sort((a, b) => a.order - b.order);

  const articlesByCategory = LEARN_CATEGORIES.map(cat => ({
    ...cat,
    icon: CATEGORY_ICONS[cat.slug],
    articles: publishedArticles.filter(a => a.category === cat.slug),
    count: publishedArticles.filter(a => a.category === cat.slug).length,
  }));

  // Get featured articles (first from each category)
  const featuredArticles = articlesByCategory
    .filter(cat => cat.articles.length > 0)
    .map(cat => cat.articles[0])
    .slice(0, 6);

  return (
    <>
      <PublicNav showAuthButtons={true} />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Knowledge Base</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Learn <span className="gradient-text">QR Codes</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about QR codes. From basics to advanced use cases,
              best practices, and industry-specific guides.
            </p>
          </div>

          {/* Category Grid */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articlesByCategory.map(category => (
                <Link key={category.slug} href={`/learn/category/${category.slug}`} className="group">
                  <Card className="h-full glass transition-all duration-300 group-hover:border-primary/30 group-hover:glow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                          {category.icon}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {category.count} {category.count === 1 ? 'article' : 'articles'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                        {category.label}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </CardTitle>
                      <CardDescription>
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured/Getting Started */}
          {featuredArticles.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArticles.map(article => (
                  <ArticleCard
                    key={article.slug}
                    title={article.title}
                    description={article.description}
                    slug={article.slug}
                    category={article.category}
                    tags={article.tags}
                    image={article.image}
                    wordCount={article.metadata.wordCount}
                    type="learn"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Latest from the Blog */}
          {blogPosts.filter(p => !p.draft).length > 0 && (
            <section className="mt-16 pt-12 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-semibold">Latest from the Blog</h2>
                </div>
                <Link href="/blog">
                  <Button variant="outline" size="sm">
                    View all posts
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts
                  .filter(post => !post.draft)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 3)
                  .map(post => (
                    <ArticleCard
                      key={post.slug}
                      title={post.title}
                      description={post.description}
                      slug={post.slug}
                      date={post.date}
                      category={post.category}
                      tags={post.tags}
                      image={post.image}
                      wordCount={post.metadata.wordCount}
                      type="blog"
                      featured={post.featured}
                    />
                  ))}
              </div>
            </section>
          )}

          {publishedArticles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                Knowledge base articles coming soon!
              </p>
              <Link href="/" className="text-primary hover:underline">
                Return to homepage
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
