'use client';

import { cn } from '@/lib/utils';
import type { MenuContent } from '@/lib/qr/types';

interface MenuPreviewProps {
  content: Partial<MenuContent>;
  className?: string;
}

type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free';

const DIETARY_BADGES: Record<DietaryTag, { label: string; color: string }> = {
  vegetarian: { label: 'V', color: 'bg-green-500/20 text-green-400' },
  vegan: { label: 'VG', color: 'bg-emerald-500/20 text-emerald-400' },
  'gluten-free': { label: 'GF', color: 'bg-amber-500/20 text-amber-400' },
};

export function MenuPreview({ content, className }: MenuPreviewProps) {
  const accentColor = content.accentColor || '#14b8a6';
  const restaurantName = content.restaurantName || 'Your Restaurant';
  const categories = content.categories || [];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] rounded-[3rem] bg-slate-900 p-2 shadow-2xl border-4 border-slate-700">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-xl z-10" />

        {/* Screen */}
        <div
          className="w-full h-full rounded-[2.5rem] overflow-hidden overflow-y-auto scrollbar-hide"
          style={{
            background: `linear-gradient(180deg, ${accentColor}15 0%, #0f172a 30%, #0f172a 100%)`,
          }}
        >
          {/* Content */}
          <div className="p-4 pt-8">
            {/* Header */}
            <div className="text-center mb-4">
              {content.logoUrl && (
                <img
                  src={content.logoUrl}
                  alt={restaurantName}
                  className="h-12 mx-auto mb-2 object-contain"
                />
              )}
              <h1 className="text-lg font-bold text-white">{restaurantName}</h1>
              <p className="text-[10px] text-slate-400">Menu</p>
            </div>

            {/* Category Pills */}
            {categories.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                {categories.map((cat, i) => (
                  <span
                    key={i}
                    className={cn(
                      'px-2 py-1 rounded-full text-[9px] font-medium whitespace-nowrap',
                      i === 0 ? 'text-white' : 'text-slate-400 bg-slate-800/50'
                    )}
                    style={i === 0 ? { backgroundColor: accentColor } : undefined}
                  >
                    {cat.name || `Category ${i + 1}`}
                  </span>
                ))}
              </div>
            )}

            {/* Categories */}
            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-500">Add categories and items to see preview</p>
                </div>
              ) : (
                categories.map((category, catIndex) => (
                  <div key={catIndex}>
                    {/* Category Header */}
                    <h2
                      className="text-xs font-bold mb-2 pb-1 border-b"
                      style={{ color: accentColor, borderColor: `${accentColor}40` }}
                    >
                      {category.name || `Category ${catIndex + 1}`}
                    </h2>

                    {/* Items */}
                    <div className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="bg-slate-800/50 rounded-lg overflow-hidden"
                        >
                          {/* Item Image */}
                          {item.image && (
                            <div className="aspect-[16/9] overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Item Content */}
                          <div className="p-2">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-[11px] font-medium text-white leading-tight">
                                  {item.name || 'Item name'}
                                </h3>
                                {/* Dietary badges */}
                                {item.dietary && item.dietary.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {item.dietary.map((tag) => (
                                      <span
                                        key={tag}
                                        className={cn(
                                          'px-1 py-0.5 rounded text-[7px] font-medium',
                                          DIETARY_BADGES[tag]?.color
                                        )}
                                      >
                                        {DIETARY_BADGES[tag]?.label}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span
                                className="text-[10px] font-bold shrink-0"
                                style={{ color: accentColor }}
                              >
                                {item.price || '$0'}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-3 border-t border-slate-700/50 text-center">
              <p className="text-[8px] text-slate-500">Powered by QRWolf</p>
            </div>
          </div>
        </div>
      </div>

      {/* Label */}
      <p className="text-xs text-slate-400 mt-3">Live Preview</p>
    </div>
  );
}
