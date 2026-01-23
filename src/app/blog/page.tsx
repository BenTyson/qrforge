import { Metadata } from 'next';
import { blogPosts } from '#content';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { BlogSearch } from '@/components/content';
import { Badge } from '@/components/ui/badge';
import { BLOG_CATEGORIES } from '@/lib/content/utils';
import { PenLine } from 'lucide-react';

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

          {/* Search and Content */}
          <BlogSearch posts={publishedPosts} categories={BLOG_CATEGORIES} />
        </div>
      </main>
      <Footer />
    </>
  );
}
