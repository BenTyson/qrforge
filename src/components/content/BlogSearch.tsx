'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArticleCard } from '@/components/content';
import { Search, X, Sparkles } from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags?: string[];
  image?: string;
  featured?: boolean;
  metadata: { wordCount: number };
}

interface Category {
  slug: string;
  label: string;
}

interface BlogSearchProps {
  posts: BlogPost[];
  categories: readonly Category[];
}

export function BlogSearch({ posts, categories }: BlogSearchProps) {
  const [query, setQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (!query.trim()) {
      return null;
    }

    const searchTerm = query.toLowerCase().trim();

    return posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.description.toLowerCase().includes(searchTerm) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      post.category.toLowerCase().includes(searchTerm)
    );
  }, [query, posts]);

  const isSearching = query.trim().length > 0;
  const featuredPosts = posts.filter(post => post.featured);
  const recentPosts = posts.filter(post => !post.featured);

  return (
    <>
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <Link href="/blog">
          <Badge className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-1.5">
            All Posts
          </Badge>
        </Link>
        {categories.map((cat) => (
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

      {/* Search Bar */}
      <div className="mb-12 animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-10 py-6 text-base bg-slate-800/50 border-slate-700/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {isSearching && (
          <p className="text-center text-sm text-slate-400 mt-3">
            {filteredPosts?.length} {filteredPosts?.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Content */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg mb-4">
            No blog posts yet. Check back soon!
          </p>
          <Link href="/" className="text-primary hover:underline">
            Return to homepage
          </Link>
        </div>
      ) : isSearching ? (
        <section className="mb-20">
          {filteredPosts && filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
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
                  animationDelay={index * 50}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg mb-2">No posts found</p>
              <p className="text-slate-500 text-sm">Try a different search term</p>
            </div>
          )}
        </section>
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
    </>
  );
}
