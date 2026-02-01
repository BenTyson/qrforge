'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface CampaignFilterSelectProps {
  options: { value: string; label: string }[];
  selected: string;
}

export function CampaignFilterSelect({ options, selected }: CampaignFilterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    // Preserve existing params but update campaign
    if (value) {
      params.set('campaign', value);
    } else {
      params.delete('campaign');
    }

    // Reset page when changing campaign filter
    params.delete('page');

    const qs = params.toString();
    router.push(qs ? `/analytics?${qs}` : '/analytics');
  };

  return (
    <select
      id="campaign-filter"
      name="campaign"
      value={selected}
      onChange={handleChange}
      className="px-3 py-2 text-sm bg-card/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[200px]"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
