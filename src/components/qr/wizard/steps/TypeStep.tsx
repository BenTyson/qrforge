'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TYPE_CATEGORIES } from '../constants';
import { TYPE_ICONS } from '../type-icons';

interface TypeStepProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  onTypeSelect: (typeId: string) => void;
  canAccessProTypes: boolean;
  userTier: 'free' | 'pro' | 'business' | null;
}

export function TypeStep({
  selectedCategory,
  onCategorySelect,
  onTypeSelect,
  canAccessProTypes,
  userTier,
}: TypeStepProps) {
  const typesSectionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to types section when category is selected
  useEffect(() => {
    if (selectedCategory && typesSectionRef.current) {
      setTimeout(() => {
        typesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">What would you like to create?</h3>
        <p className="text-slate-400">Choose the type of QR code you need</p>
      </div>

      {/* Category Grid - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {TYPE_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
              selectedCategory === category.id
                ? 'border-primary bg-primary/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
            )}
          >
            {category.pro && !canAccessProTypes && (
              <span className="absolute top-2 right-2 text-[10px] font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                Pro
              </span>
            )}
            <div className={cn(
              'mb-2 transition-colors [&>svg]:w-6 [&>svg]:h-6',
              selectedCategory === category.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-300'
            )}>
              {category.icon}
            </div>
            <h4 className="font-medium text-white text-sm mb-0.5">{category.name}</h4>
            <p className="text-xs text-slate-500">
              {category.types.length} option{category.types.length > 1 ? 's' : ''}
            </p>
          </button>
        ))}
      </div>

      {/* Type options for selected category */}
      {selectedCategory && (
        <div ref={typesSectionRef} className="mt-6 pt-6 border-t border-slate-700/50 scroll-mt-4">
          <h4 className="text-lg font-semibold text-white mb-4">
            Choose a type
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TYPE_CATEGORIES.find((c) => c.id === selectedCategory)?.types.map((type) => {
              const isProType = 'pro' in type && type.pro;
              const isDisabled = isProType && !canAccessProTypes;
              const visual = TYPE_ICONS[type.id];
              return (
                <button
                  key={type.id}
                  onClick={() => onTypeSelect(type.id)}
                  disabled={isDisabled}
                  aria-disabled={isDisabled}
                  className={cn(
                    'group p-3.5 rounded-xl border transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                    isDisabled
                      ? 'border-slate-700 bg-slate-800/30 opacity-60 cursor-not-allowed'
                      : 'border-slate-700 bg-slate-800/50 hover:border-primary/60 hover:bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {visual && (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5 text-white transition-transform group-hover:scale-105"
                        style={{ backgroundColor: visual.color }}
                      >
                        {visual.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-white">{type.name}</h5>
                      <p className="text-sm text-slate-400">{type.description}</p>
                    </div>
                    {isDisabled ? (
                      <Link
                        href="/plans"
                        className="text-xs font-medium bg-primary/20 text-primary px-2 py-1 rounded-full hover:bg-primary/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Pro
                      </Link>
                    ) : (
                      <svg className="w-5 h-5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade CTA - only show for non-pro users */}
      {!canAccessProTypes && (
        <div className="mt-8 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">Unlock all QR types</p>
              <p className="text-sm text-slate-400">Get analytics, dynamic codes, file uploads & more</p>
            </div>
            <Link href={userTier === null ? "/signup" : "/plans"}>
              <Button className="shrink-0 glow-hover">
                {userTier === null ? "Sign Up" : "View Plans"}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
