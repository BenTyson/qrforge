'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface BatchFilterSelectProps {
  options: { value: string; label: string }[];
  selected: string;
}

export function BatchFilterSelect({ options, selected }: BatchFilterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set('batch', value);
    } else {
      params.delete('batch');
    }

    // Clear conflicting filters
    params.delete('qr');
    params.delete('campaign');
    params.delete('page');

    const qs = params.toString();
    router.push(qs ? `/analytics?${qs}` : '/analytics');
  };

  return (
    <select
      id="batch-filter"
      name="batch"
      value={selected}
      onChange={handleChange}
      className="px-3 py-2 text-sm bg-card/50 border border-amber-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-w-[200px]"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
