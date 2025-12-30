import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { learnArticles } from '#content';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { ArticleCard } from '@/components/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LEARN_CATEGORIES } from '@/lib/content/utils';
import { ArrowLeft, BookOpen, Cog, Lightbulb, Building2, CheckCircle2, Code2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ category: string }>;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'qr-basics': <BookOpen className="w-8 h-8" />,
  'how-it-works': <Cog className="w-8 h-8" />,
  'use-cases': <Lightbulb className="w-8 h-8" />,
  'industries': <Building2 className="w-8 h-8" />,
  'best-practices': <CheckCircle2 className="w-8 h-8" />,
  'technical': <Code2 className="w-8 h-8" />,
};

export async function generateStaticParams() {
  return LEARN_CATEGORIES.map(cat => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = LEARN_CATEGORIES.find(c => c.slug === category);

  if (!categoryInfo) return {};

  return {
    title: `${categoryInfo.label} - Learn QR Codes`,
    description: `${categoryInfo.description}. Learn everything about QR codes with QRWolf.`,
    openGraph: {
      title: `${categoryInfo.label} - Learn QR Codes | QRWolf`,
      description: `${categoryInfo.description}. Learn everything about QR codes with QRWolf.`,
    },
  };
}

export default async function LearnCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categoryInfo = LEARN_CATEGORIES.find(c => c.slug === category);

  if (!categoryInfo) {
    notFound();
  }

  const articles = learnArticles
    .filter(article => !article.draft && article.category === category)
    .sort((a, b) => a.order - b.order);

  const icon = CATEGORY_ICONS[category];

  return (
    <>
      <PublicNav showAuthButtons={true} />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back link */}
          <Link href="/learn">
            <Button variant="ghost" size="sm" className="mb-8 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Categories
            </Button>
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              {icon}
            </div>
            <Badge variant="secondary" className="mb-4">Category</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {categoryInfo.label}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {categoryInfo.description}
            </p>
          </div>

          {/* Category Quick Nav */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {LEARN_CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/learn/category/${cat.slug}`}>
                <Badge
                  variant={cat.slug === category ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/10"
                >
                  {cat.label}
                </Badge>
              </Link>
            ))}
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                No articles in this category yet.
              </p>
              <Link href="/learn" className="text-primary hover:underline">
                Browse all categories
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
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
                  featured={index === 0}
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
