'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface CategoryNavProps {
  categories: string[];
  accentColor: string;
}

export function CategoryNav({ categories, accentColor }: CategoryNavProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Scroll to category when clicked
  const scrollToCategory = useCallback((index: number) => {
    const element = document.getElementById(`category-${index}`);
    if (element) {
      const navHeight = 60; // Account for sticky nav height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Track scroll position to highlight active category
  useEffect(() => {
    const handleScroll = () => {
      const navHeight = 80;

      for (let i = categories.length - 1; i >= 0; i--) {
        const element = document.getElementById(`category-${i}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= navHeight + 20) {
            setActiveIndex(i);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories.length]);

  if (categories.length <= 1) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 py-3 px-4 -mx-4 mb-6">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((category, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={index}
              onClick={() => scrollToCategory(index)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
              style={isActive ? { backgroundColor: accentColor } : undefined}
            >
              {category}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
