import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { learnArticles } from '#content';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { TableOfContents, LearnSidebar, RelatedArticles, MDXContent } from '@/components/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getReadingTime, LEARN_CATEGORIES } from '@/lib/content/utils';
import { ArrowLeft, Clock } from 'lucide-react';

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
  const categoryInfo = LEARN_CATEGORIES.find(c => c.slug === article.category);

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
      <PublicNav showAuthButtons={true} />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-8">
            {/* Left Sidebar - Category Navigation */}
            <aside className="hidden lg:block">
              <LearnSidebar articles={allArticles} />
            </aside>

            {/* Main content */}
            <article className="min-w-0">
              {/* Back link */}
              <Link href="/learn">
                <Button variant="ghost" size="sm" className="mb-6 -ml-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Learn
                </Button>
              </Link>

              {/* Header */}
              <header className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Link href={`/learn/category/${article.category}`}>
                    <Badge variant="secondary" className="capitalize hover:bg-secondary/80">
                      {categoryInfo?.label || article.category.replace('-', ' ')}
                    </Badge>
                  </Link>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {getReadingTime(article.metadata.wordCount)}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {article.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {article.description}
                </p>
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {article.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </header>

              {/* Content */}
              <div className="prose prose-invert max-w-none">
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
