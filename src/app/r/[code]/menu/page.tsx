import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { MenuContent } from '@/lib/qr/types';

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

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background: `linear-gradient(135deg, ${accentColor}10 0%, #0f172a 100%)`,
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {content.logoUrl && (
            <img
              src={content.logoUrl}
              alt={content.restaurantName}
              className="h-20 mx-auto mb-4 object-contain"
            />
          )}
          <h1 className="text-3xl font-bold text-white">{content.restaurantName}</h1>
          <p className="text-slate-400 mt-2">Menu</p>
        </div>

        {/* Menu Categories */}
        <div className="space-y-8">
          {content.categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {/* Category Header */}
              <h2
                className="text-xl font-bold mb-4 pb-2 border-b-2"
                style={{ color: accentColor, borderColor: `${accentColor}40` }}
              >
                {category.name}
              </h2>

              {/* Items */}
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex justify-between items-start gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h3 className="font-medium text-white">{item.name}</h3>
                        {item.dietary && item.dietary.length > 0 && (
                          <div className="flex gap-1">
                            {item.dietary.map((d) => (
                              <span
                                key={d}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300"
                              >
                                {d === 'vegetarian' && 'V'}
                                {d === 'vegan' && 'VG'}
                                {d === 'gluten-free' && 'GF'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                      )}
                    </div>
                    <span
                      className="font-bold shrink-0"
                      style={{ color: accentColor }}
                    >
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-700/50">
          <p className="text-center text-sm text-slate-500">
            Powered by{' '}
            <Link href="/" className="hover:text-primary transition-colors">
              QRWolf
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
