import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateShort, getReadingTime } from '@/lib/content/utils';

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
}

export function ArticleCard({
  title,
  description,
  slug,
  date,
  category,
  tags = [],
  image,
  wordCount,
  type,
  featured,
}: ArticleCardProps) {
  const href = type === 'blog' ? `/blog/${slug}` : `/learn/${slug}`;

  return (
    <Link href={href} className="group block h-full">
      <Card className={`glass h-full overflow-hidden transition-all duration-300 hover:glow group-hover:border-primary/30 ${featured ? 'border-primary/20' : ''}`}>
        {image && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {featured && (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
          </div>
        )}
        <CardHeader className={image ? '' : 'pt-6'}>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="secondary" className="text-xs capitalize">
              {category.replace('-', ' ')}
            </Badge>
            {date && (
              <span className="text-xs text-muted-foreground">
                {formatDateShort(date)}
              </span>
            )}
            {wordCount && (
              <span className="text-xs text-muted-foreground">
                {getReadingTime(wordCount)}
              </span>
            )}
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
        {tags.length > 0 && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
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
