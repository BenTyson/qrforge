import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts } from '#content';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { TableOfContents, RelatedArticles, MDXContent } from '@/components/content';
import { Badge } from '@/components/ui/badge';
import { formatDate, getReadingTime, BLOG_CATEGORIES } from '@/lib/content/utils';
import { Calendar, Clock, User, ChevronRight, PenLine } from 'lucide-react';

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

function BreadcrumbJsonLd({ post, categoryName }: { post: typeof blogPosts[0]; categoryName: string }) {
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
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${siteUrl}/blog/category/${post.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: post.title,
        item: `${siteUrl}/blog/${post.slug}`,
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

  const categoryInfo = BLOG_CATEGORIES.find(c => c.slug === post.category);

  return (
    <>
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd post={post} categoryName={categoryInfo?.label || post.category} />
      <PublicNav showAuthButtons={true} />
      <main className="min-h-screen pt-24 pb-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating orbs */}
          <div className="absolute top-32 left-20 w-80 h-80 rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute top-80 right-10 w-72 h-72 rounded-full bg-cyan-500/10 blur-[150px]" />
          <div className="absolute bottom-40 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(rgba(20, 184, 166, 0.15) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8 animate-fade-in">
            <Link href="/blog" className="hover:text-primary transition-colors flex items-center gap-1">
              <PenLine className="w-4 h-4" />
              Blog
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <Link
              href={`/blog/category/${post.category}`}
              className="hover:text-primary transition-colors capitalize"
            >
              {categoryInfo?.label || post.category.replace('-', ' ')}
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-slate-500 truncate max-w-[200px]">{post.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
            {/* Main content */}
            <article>
              {/* Header */}
              <header className="mb-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <Link href={`/blog/category/${post.category}`}>
                  <Badge className="mb-4 capitalize bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    {categoryInfo?.label || post.category.replace('-', ' ')}
                  </Badge>
                </Link>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 tracking-tight leading-tight">
                  {post.title}
                </h1>
                <p className="text-lg md:text-xl text-slate-400 mb-6 leading-relaxed">
                  {post.description}
                </p>

                {/* Author card */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{post.author}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {getReadingTime(post.metadata.wordCount)}
                      </span>
                    </div>
                  </div>
                </div>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {post.tags.map(tag => (
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
