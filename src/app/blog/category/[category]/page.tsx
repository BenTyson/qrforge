import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts } from '#content';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { ArticleCard } from '@/components/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BLOG_CATEGORIES } from '@/lib/content/utils';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return BLOG_CATEGORIES.map(cat => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = BLOG_CATEGORIES.find(c => c.slug === category);

  if (!categoryInfo) return {};

  return {
    title: `${categoryInfo.label} - Blog`,
    description: `${categoryInfo.description}. QR code articles and insights from QRWolf.`,
    openGraph: {
      title: `${categoryInfo.label} - QRWolf Blog`,
      description: `${categoryInfo.description}. QR code articles and insights from QRWolf.`,
    },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categoryInfo = BLOG_CATEGORIES.find(c => c.slug === category);

  if (!categoryInfo) {
    notFound();
  }

  const posts = blogPosts
    .filter(post => !post.draft && post.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <PublicNav showAuthButtons={true} />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back link */}
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-8 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Posts
            </Button>
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Category</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {categoryInfo.label}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {categoryInfo.description}
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Link href="/blog">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                All Posts
              </Badge>
            </Link>
            {BLOG_CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/blog/category/${cat.slug}`}>
                <Badge
                  variant={cat.slug === category ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/10"
                >
                  {cat.label}
                </Badge>
              </Link>
            ))}
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                No posts in this category yet.
              </p>
              <Link href="/blog" className="text-primary hover:underline">
                View all posts
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
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
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
