'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArticleCard } from '@/components/content';
import { Search, ArrowRight, X } from 'lucide-react';

interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  image?: string;
  metadata: { wordCount: number };
}

interface Category {
  slug: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  articles: Article[];
  count: number;
}

interface LearnSearchProps {
  categories: Category[];
  featuredArticles: Article[];
}

export function LearnSearch({ categories, featuredArticles }: LearnSearchProps) {
  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return { categories, featuredArticles, allMatches: [] };
    }

    const searchTerm = query.toLowerCase().trim();

    // Search all articles across categories
    const allArticles = categories.flatMap(cat => cat.articles);
    const matchingArticles = allArticles.filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.description.toLowerCase().includes(searchTerm) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    // Filter categories that have matching articles
    const filteredCategories = categories
      .map(cat => ({
        ...cat,
        articles: cat.articles.filter(article =>
          article.title.toLowerCase().includes(searchTerm) ||
          article.description.toLowerCase().includes(searchTerm) ||
          article.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        ),
      }))
      .map(cat => ({ ...cat, count: cat.articles.length }))
      .filter(cat => cat.count > 0);

    return {
      categories: filteredCategories,
      featuredArticles: [],
      allMatches: matchingArticles,
    };
  }, [query, categories, featuredArticles]);

  const isSearching = query.trim().length > 0;

  return (
    <>
      {/* Search Bar */}
      <div className="mb-12 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search articles..."
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
            {filteredResults.allMatches.length} {filteredResults.allMatches.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Search Results */}
      {isSearching ? (
        <section className="mb-20">
          {filteredResults.allMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.allMatches.map((article, index) => (
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
                  animationDelay={index * 50}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg mb-2">No articles found</p>
              <p className="text-slate-500 text-sm">Try a different search term</p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Category Grid */}
          <section className="mb-20">
            <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-cyan-500 rounded-full" />
              Browse by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((category, index) => (
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
        </>
      )}
    </>
  );
}
