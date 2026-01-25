'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TemplateCard } from './TemplateCard';
import { TemplateSearch } from './TemplateSearch';
import { ProTemplateModal } from './ProTemplateModal';
import { TEMPLATES, searchTemplates } from '@/lib/templates';
import type { Template, TemplateCategory } from '@/lib/templates/types';
import { createClient } from '@/lib/supabase/client';

export function TemplateGallery() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(
    (searchParams.get('category') as TemplateCategory) || null
  );
  const [showProModal, setShowProModal] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'business' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user tier on mount
  useEffect(() => {
    const fetchUserTier = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

          setUserTier((profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business');
        } else {
          setUserTier('free');
        }
      } catch {
        setUserTier('free');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTier();
  }, []);

  // Update URL when category changes
  const handleCategoryChange = (category: TemplateCategory | null) => {
    setSelectedCategory(category);
    const url = category ? `/templates?category=${category}` : '/templates';
    router.push(url, { scroll: false });
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let templates: Template[] = TEMPLATES;

    // Filter by search query
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    }

    // Filter by category
    if (selectedCategory) {
      templates = templates.filter((t) => t.category === selectedCategory);
    }

    return templates;
  }, [searchQuery, selectedCategory]);

  const canAccessPro = userTier === 'pro' || userTier === 'business';

  return (
    <>
      {/* Search and filters */}
      <TemplateSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Template grid */}
      <div className="mt-12">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-slate-400">
              No templates found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange(null);
              }}
              className="mt-4 text-primary hover:text-primary/80 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template, index) => (
              <div
                key={template.id}
                className="animate-slide-up"
                style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
              >
                <TemplateCard
                  template={template}
                  canAccessPro={canAccessPro || isLoading}
                  onProClick={() => setShowProModal(true)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pro modal */}
      <ProTemplateModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
      />
    </>
  );
}
