import { cn } from '@/lib/utils';

type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free';

interface MenuItem {
  name: string;
  description?: string;
  price: string;
  image?: string;
  dietary?: DietaryTag[];
}

interface MenuItemCardProps {
  item: MenuItem;
  accentColor: string;
  className?: string;
  style?: React.CSSProperties;
}

const DIETARY_CONFIG: Record<DietaryTag, { label: string; icon: React.ReactNode; color: string }> = {
  vegetarian: {
    label: 'V',
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  vegan: {
    label: 'VG',
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
      </svg>
    ),
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  'gluten-free': {
    label: 'GF',
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 22 16 8" />
        <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
        <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
        <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
        <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
        <path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
        <path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
        <path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
      </svg>
    ),
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  }
};

function DietaryBadge({ type }: { type: DietaryTag }) {
  const config = DIETARY_CONFIG[type];
  if (!config) return null;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border',
      config.color
    )}>
      {config.icon}
      {config.label}
    </span>
  );
}

export function MenuItemCard({ item, accentColor, className, style }: MenuItemCardProps) {
  const hasImage = !!item.image;

  return (
    <div
      style={style}
      className={cn(
        'group bg-slate-800/50 backdrop-blur rounded-xl overflow-hidden border border-slate-700/50',
        'hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/20',
        'transition-all duration-300',
        className
      )}
    >
      {/* Item Image */}
      {hasImage && (
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header: Name + Price */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white leading-tight">{item.name}</h3>

            {/* Dietary Badges */}
            {item.dietary && item.dietary.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.dietary.map((tag) => (
                  <DietaryBadge key={tag} type={tag} />
                ))}
              </div>
            )}
          </div>

          {/* Price */}
          <span
            className="font-bold text-lg shrink-0"
            style={{ color: accentColor }}
          >
            {item.price}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-slate-400 mt-2 line-clamp-2">{item.description}</p>
        )}
      </div>
    </div>
  );
}
