import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getReadingTime } from '@/lib/content/utils';
import { Clock, Sparkles } from 'lucide-react';

interface ArticleCardProps {
  title: string;
  description: string;
  slug: string;
  date?: string;
  category: string;
  tags?: string[];
  image?: string;
  wordCount?: number;
  type: 'blog' | 'learn';
  featured?: boolean;
  animationDelay?: number;
}

export function ArticleCard({
  title,
  description,
  slug,
  date: _date,
  category,
  tags = [],
  image,
  wordCount,
  type,
  featured,
  animationDelay = 0,
}: ArticleCardProps) {
  const href = type === 'blog' ? `/blog/${slug}` : `/learn/${slug}`;

  return (
    <Link
      href={href}
      className="group block h-full animate-slide-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <Card className={`
        relative h-full overflow-hidden transition-all duration-300
        bg-slate-800/50 backdrop-blur-xl border-slate-700/50
        hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10
        hover:scale-[1.02] hover:-translate-y-1
        ${featured ? 'border-primary/30 shadow-lg shadow-primary/20' : ''}
      `}>
        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {image && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            {featured && (
              <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-lg shadow-primary/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Featured
              </Badge>
            )}
          </div>
        )}
        <CardHeader className={image ? '' : 'pt-6'}>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge
              variant="secondary"
              className="text-xs capitalize bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
              {category.replace('-', ' ')}
            </Badge>
            {wordCount && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getReadingTime(wordCount)}
              </span>
            )}
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-slate-400">
            {description}
          </CardDescription>
        </CardHeader>
        {tags.length > 0 && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs border-slate-600/50 text-slate-400 hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground border-slate-600/50">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
