'use client';

import { useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TEMPLATE_CATEGORIES, type TemplateCategory } from '@/lib/templates/types';

interface TemplateSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: TemplateCategory | null;
  onCategoryChange: (category: TemplateCategory | null) => void;
}

export function TemplateSearch({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: TemplateSearchProps) {
  const handleCategoryClick = useCallback((category: TemplateCategory | null) => {
    onCategoryChange(category);
  }, [onCategoryChange]);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 bg-slate-800/50 border-slate-700/50 focus:border-primary/50"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => handleCategoryClick(null)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            'border',
            selectedCategory === null
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-slate-600/50 text-slate-300 hover:border-primary/50 hover:text-white'
          )}
        >
          All
        </button>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              'border',
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-slate-600/50 text-slate-300 hover:border-primary/50 hover:text-white'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
