'use client';

import { cn } from '@/lib/utils';

type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free';

interface DietaryTagSelectorProps {
  selected: DietaryTag[];
  onChange: (selected: DietaryTag[]) => void;
  className?: string;
}

const DIETARY_OPTIONS: { value: DietaryTag; label: string; fullLabel: string; color: string; selectedColor: string }[] = [
  {
    value: 'vegetarian',
    label: 'V',
    fullLabel: 'Vegetarian',
    color: 'border-green-500/30 text-green-400/60 hover:border-green-500/50 hover:text-green-400',
    selectedColor: 'bg-green-500/20 border-green-500 text-green-400'
  },
  {
    value: 'vegan',
    label: 'VG',
    fullLabel: 'Vegan',
    color: 'border-emerald-500/30 text-emerald-400/60 hover:border-emerald-500/50 hover:text-emerald-400',
    selectedColor: 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
  },
  {
    value: 'gluten-free',
    label: 'GF',
    fullLabel: 'Gluten-Free',
    color: 'border-amber-500/30 text-amber-400/60 hover:border-amber-500/50 hover:text-amber-400',
    selectedColor: 'bg-amber-500/20 border-amber-500 text-amber-400'
  },
];

export function DietaryTagSelector({ selected, onChange, className }: DietaryTagSelectorProps) {
  const toggleTag = (tag: DietaryTag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      {DIETARY_OPTIONS.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleTag(option.value)}
            title={option.fullLabel}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-200',
              isSelected ? option.selectedColor : option.color
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
