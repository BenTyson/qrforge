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
import { BookOpen, Cog, Lightbulb, Building2, CheckCircle2, Code2, ArrowRight, Newspaper, GraduationCap } from 'lucide-react';

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

export default function LearnPage() {
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
      <main className="min-h-screen pt-24 pb-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating orbs */}
          <div className="absolute top-32 left-10 w-72 h-72 rounded-full bg-primary/20 blur-[120px] animate-pulse" />
          <div className="absolute top-64 right-20 w-96 h-96 rounded-full bg-cyan-500/15 blur-[150px]" />
          <div className="absolute bottom-32 left-1/3 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(rgba(20, 184, 166, 0.15) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <GraduationCap className="w-3 h-3 mr-1" />
              Knowledge Base
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Learn <span className="gradient-text">QR Codes</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about QR codes. From basics to advanced use cases,
              best practices, and industry-specific guides.
            </p>
          </div>

          {/* Category Grid */}
          <section className="mb-20">
            <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-cyan-500 rounded-full" />
              Browse by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articlesByCategory.map((category, index) => (
                <Link
                  key={category.slug}
                  href={`/learn/category/${category.slug}`}
                  className="group animate-slide-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <Card className="h-full bg-slate-800/50 backdrop-blur-xl border-slate-700/50 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center text-primary mb-4 group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow">
                          {category.icon}
                        </div>
                        <Badge variant="outline" className="text-xs border-slate-600/50 text-slate-400">
                          {category.count} {category.count === 1 ? 'article' : 'articles'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                        {category.label}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="text-slate-400">
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
            <section className="mb-20">
              <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-cyan-500 rounded-full" />
                Getting Started
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArticles.map((article, index) => (
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
                    animationDelay={index * 80}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Latest from the Blog */}
          {blogPosts.filter(p => !p.draft).length > 0 && (
            <section className="relative">
              {/* Gradient divider */}
              <div className="absolute -top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

              <div className="flex items-center justify-between mb-8 pt-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center text-primary">
                    <Newspaper className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Latest from the Blog</h2>
                    <p className="text-sm text-slate-400">Stay up to date with QR code trends</p>
                  </div>
                </div>
                <Link href="/blog">
                  <Button variant="outline" size="sm" className="border-slate-600/50 hover:border-primary/50 hover:bg-primary/10 group">
                    View all posts
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts
                  .filter(post => !post.draft)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 3)
                  .map((post, index) => (
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
                      animationDelay={index * 80}
                    />
                  ))}
              </div>
            </section>
          )}

          {publishedArticles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg mb-4">
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
