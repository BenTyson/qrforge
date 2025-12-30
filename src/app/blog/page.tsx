import { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '#content';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { ArticleCard } from '@/components/content';
import { Badge } from '@/components/ui/badge';
import { BLOG_CATEGORIES } from '@/lib/content/utils';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'QR code tips, tutorials, industry news, and best practices from the QRWolf team.',
  openGraph: {
    title: 'QRWolf Blog',
    description: 'QR code tips, tutorials, industry news, and best practices from the QRWolf team.',
  },
};

export default function BlogPage() {
  const publishedPosts = blogPosts
    .filter(post => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const featuredPosts = publishedPosts.filter(post => post.featured);
  const recentPosts = publishedPosts.filter(post => !post.featured);

  return (
    <>
      <PublicNav showAuthButtons={true} />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Blog</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              QR Code <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tips, tutorials, and industry insights to help you make the most of QR codes.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Link href="/blog">
              <Badge variant="default" className="cursor-pointer">
                All Posts
              </Badge>
            </Link>
            {BLOG_CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/blog/category/${cat.slug}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                  {cat.label}
                </Badge>
              </Link>
            ))}
          </div>

          {publishedPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                No blog posts yet. Check back soon!
              </p>
              <Link href="/" className="text-primary hover:underline">
                Return to homepage
              </Link>
            </div>
          ) : (
            <>
              {/* Featured Posts */}
              {featuredPosts.length > 0 && (
                <section className="mb-16">
                  <h2 className="text-2xl font-semibold mb-6">Featured</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredPosts.map(post => (
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
                        featured
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Posts */}
              {recentPosts.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-6">Recent Posts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentPosts.map(post => (
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
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
