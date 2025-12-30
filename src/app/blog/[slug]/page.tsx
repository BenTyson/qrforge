import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts } from '#content';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { TableOfContents, RelatedArticles, MDXContent } from '@/components/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getReadingTime } from '@/lib/content/utils';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts
    .filter(post => !post.draft)
    .map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) return {};

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [post.author],
      tags: post.tags,
      url: `${siteUrl}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
  };
}

function ArticleJsonLd({ post }: { post: typeof blogPosts[0] }) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image ? `${siteUrl}${post.image}` : undefined,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
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
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
    wordCount: post.metadata.wordCount,
    articleSection: post.category,
    keywords: post.tags.join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}


export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug && !p.draft);

  if (!post) {
    notFound();
  }

  // Find related posts (same category, exclude current)
  const relatedPosts = blogPosts
    .filter(p => !p.draft && p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  return (
    <>
      <ArticleJsonLd post={post} />
      <PublicNav showAuthButtons={true} />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back link */}
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-8 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
            {/* Main content */}
            <article>
              {/* Header */}
              <header className="mb-8">
                <Badge variant="secondary" className="mb-4 capitalize">
                  {post.category.replace('-', ' ')}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {post.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {post.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {getReadingTime(post.metadata.wordCount)}
                  </span>
                </div>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </header>

              {/* Content */}
              <div className="prose prose-invert max-w-none">
                <MDXContent code={post.content} />
              </div>

              {/* Related Articles */}
              <RelatedArticles articles={relatedPosts} type="blog" />
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <TableOfContents toc={post.toc} />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
