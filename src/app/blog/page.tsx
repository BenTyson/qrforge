import { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '#content';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { ArticleCard } from '@/components/content';
import { Badge } from '@/components/ui/badge';
import { BLOG_CATEGORIES } from '@/lib/content/utils';
import { Sparkles, PenLine } from 'lucide-react';

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
      <main className="min-h-screen pt-24 pb-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating orbs */}
          <div className="absolute top-40 right-10 w-80 h-80 rounded-full bg-primary/20 blur-[120px] animate-pulse" />
          <div className="absolute top-96 left-20 w-72 h-72 rounded-full bg-cyan-500/15 blur-[150px]" />
          <div className="absolute bottom-40 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />
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
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <PenLine className="w-3 h-3 mr-1" />
              Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              QR Code <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Tips, tutorials, and industry insights to help you make the most of QR codes.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Link href="/blog">
              <Badge className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-1.5">
                All Posts
              </Badge>
            </Link>
            {BLOG_CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/blog/category/${cat.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer border-slate-600/50 text-slate-400 hover:border-primary/50 hover:text-primary hover:bg-primary/10 transition-all px-4 py-1.5"
                >
                  {cat.label}
                </Badge>
              </Link>
            ))}
          </div>

          {publishedPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg mb-4">
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
                <section className="mb-20">
                  <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    Featured
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredPosts.map((post, index) => (
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
                        animationDelay={index * 100}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Posts */}
              {recentPosts.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-cyan-500 rounded-full" />
                    Recent Posts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentPosts.map((post, index) => (
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
                        animationDelay={index * 80}
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
