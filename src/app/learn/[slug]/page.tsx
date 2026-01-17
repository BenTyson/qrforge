import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { learnArticles } from '#content';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { TableOfContents, LearnSidebar, RelatedArticles, MDXContent } from '@/components/content';
import { Badge } from '@/components/ui/badge';
import { getReadingTime, LEARN_CATEGORIES } from '@/lib/content/utils';
import { Clock, ChevronRight, BookOpen } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return learnArticles
    .filter(article => !article.draft)
    .map(article => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = learnArticles.find(a => a.slug === slug);

  if (!article) return {};

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      url: `${siteUrl}/learn/${article.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
    alternates: {
      canonical: `${siteUrl}/learn/${article.slug}`,
    },
  };
}

function ArticleJsonLd({ article }: { article: typeof learnArticles[0] }) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image ? `${siteUrl}${article.image}` : undefined,
    datePublished: new Date().toISOString().split('T')[0], // Learn articles are evergreen
    dateModified: new Date().toISOString().split('T')[0],
    author: {
      '@type': 'Organization',
      name: 'QRWolf',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'QRWolf',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/QRWolf_Logo_Icon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/learn/${article.slug}`,
    },
    wordCount: article.metadata.wordCount,
    articleSection: article.category,
    keywords: article.tags.join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd({ article, categoryName }: { article: typeof learnArticles[0]; categoryName: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Learn',
        item: `${siteUrl}/learn`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${siteUrl}/learn/category/${article.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: article.title,
        item: `${siteUrl}/learn/${article.slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}


export default async function LearnArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = learnArticles.find(a => a.slug === slug && !a.draft);

  if (!article) {
    notFound();
  }

  const categoryInfo = LEARN_CATEGORIES.find(c => c.slug === article.category);

  // Find related articles
  const relatedArticles = article.relatedSlugs.length > 0
    ? learnArticles.filter(a => !a.draft && article.relatedSlugs.includes(a.slug))
    : learnArticles
        .filter(a => !a.draft && a.slug !== article.slug && a.category === article.category)
        .slice(0, 3);

  // All articles for sidebar
  const allArticles = learnArticles
    .filter(a => !a.draft)
    .map(a => ({
      title: a.title,
      slug: a.slug,
      category: a.category,
      order: a.order,
    }));

  return (
    <>
      <ArticleJsonLd article={article} />
      <BreadcrumbJsonLd article={article} categoryName={categoryInfo?.label || article.category} />
      <PublicNav showAuthButtons={true} />
      <main className="min-h-screen pt-24 pb-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating orbs */}
          <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute top-96 left-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-[150px]" />
          <div className="absolute bottom-64 right-1/3 w-80 h-80 rounded-full bg-primary/10 blur-[100px]" />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(rgba(20, 184, 166, 0.15) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_250px] gap-8">
            {/* Left Sidebar - Category Navigation */}
            <aside className="hidden lg:block">
              <LearnSidebar articles={allArticles} />
            </aside>

            {/* Main content */}
            <article className="min-w-0">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6 animate-fade-in">
                <Link href="/learn" className="hover:text-primary transition-colors flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Learn
                </Link>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <Link
                  href={`/learn/category/${article.category}`}
                  className="hover:text-primary transition-colors capitalize"
                >
                  {categoryInfo?.label || article.category.replace('-', ' ')}
                </Link>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className="text-slate-500 truncate max-w-[200px]">{article.title}</span>
              </nav>

              {/* Header */}
              <header className="mb-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Link href={`/learn/category/${article.category}`}>
                    <Badge className="capitalize bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                      {categoryInfo?.label || article.category.replace('-', ' ')}
                    </Badge>
                  </Link>
                  <span className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    {getReadingTime(article.metadata.wordCount)}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 tracking-tight leading-tight">
                  {article.title}
                </h1>
                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  {article.description}
                </p>
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {article.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs border-slate-600/50 text-slate-400 hover:border-primary/30 hover:text-primary transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </header>

              {/* Content */}
              <div
                className="prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary prose-a:no-underline hover:prose-a:underline animate-fade-in"
                style={{ animationDelay: '200ms' }}
              >
                <MDXContent code={article.content} />
              </div>

              {/* Related Articles */}
              <RelatedArticles articles={relatedArticles} type="learn" />
            </article>

            {/* Right Sidebar - Table of Contents */}
            <aside className="hidden lg:block">
              <TableOfContents toc={article.toc} />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
