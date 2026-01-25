import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { MenuContent } from '@/lib/qr/types';
import { CategoryNav } from '@/components/menu/CategoryNav';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import {
  LandingBackground,
  LandingFooter
} from '@/components/landing';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function MenuLandingPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('content')
    .eq('short_code', code)
    .eq('content_type', 'menu')
    .single();

  if (error || !qrCode) {
    notFound();
  }

  const content = qrCode.content as MenuContent;
  const accentColor = content.accentColor || '#14b8a6';
  const categoryNames = content.categories.map(c => c.name).filter(Boolean);

  return (
    <LandingBackground accentColor={accentColor} className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 animate-fade-in">
          {content.logoUrl && (
            <div className="mb-4">
              <Image
                src={content.logoUrl}
                alt={content.restaurantName}
                width={96}
                height={96}
                className="h-24 w-auto mx-auto object-contain drop-shadow-lg"
                unoptimized
              />
            </div>
          )}
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {content.restaurantName}
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">Menu</p>
        </header>

        {/* Sticky Category Navigation */}
        <CategoryNav categories={categoryNames} accentColor={accentColor} />

        {/* Menu Categories */}
        <div className="space-y-10">
          {content.categories.map((category, categoryIndex) => (
            <section
              key={categoryIndex}
              id={`category-${categoryIndex}`}
              className="scroll-mt-20"
            >
              {/* Category Header */}
              <div className="mb-5">
                <h2
                  className="text-xl font-bold pb-2 border-b-2"
                  style={{ color: accentColor, borderColor: `${accentColor}40` }}
                >
                  {category.name}
                </h2>
                {category.items.length > 0 && (
                  <p className="text-xs text-zinc-500 mt-1">
                    {category.items.length} item{category.items.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Items Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {category.items.map((item, itemIndex) => (
                  <MenuItemCard
                    key={itemIndex}
                    item={item}
                    accentColor={accentColor}
                    className="animate-slide-up"
                    style={{
                      animationDelay: `${itemIndex * 50}ms`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-zinc-700/50">
          <LandingFooter accentColor={accentColor} delay={0} />
        </footer>
      </div>
    </LandingBackground>
  );
}
