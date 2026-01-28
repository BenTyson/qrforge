'use client';

import { useRouter } from 'next/navigation';

interface QRCodeFilterSelectProps {
  options: { value: string; label: string }[];
  selected: string;
}

export function QRCodeFilterSelect({ options, selected }: QRCodeFilterSelectProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      router.push(`/analytics?qr=${encodeURIComponent(value)}`);
    } else {
      router.push('/analytics');
    }
  };

  return (
    <select
      id="qr-filter"
      name="qr"
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
