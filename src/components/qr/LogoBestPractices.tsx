'use client';

import { Sparkles, Maximize2, Contrast, Square, Smartphone, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoBestPracticesProps {
  className?: string;
}

const tips = [
  {
    icon: Maximize2,
    title: "Recommended dimensions",
    description: "Upload at 300×300px or larger. Square ratio (1:1) works best for the center zone."
  },
  {
    icon: Sparkles,
    title: "Keep it simple",
    description: "Bold, minimal logos work best. Avoid fine details that disappear at small sizes."
  },
  {
    icon: Square,
    title: "Square or circular shapes",
    description: "Use the built-in shape tool to crop and mask your logo as a square, rounded square, or circle."
  },
  {
    icon: Contrast,
    title: "High contrast",
    description: "Use PNG with transparency, or ensure your logo contrasts with the QR background color."
  },
  {
    icon: Smartphone,
    title: "Test before printing",
    description: "Always scan with 2-3 different phones/apps. Keep logo size at 20-25% for reliability."
  }
];

export function LogoBestPractices({ className }: LogoBestPracticesProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="text-sm font-medium flex items-center gap-2 text-white">
        <FileText className="w-4 h-4 text-primary" />
        Best Practices for Scannable QR Codes
      </h4>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <tip.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{tip.title}</p>
              <p className="text-xs text-slate-400">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pro tip callout */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-4">
        <p className="text-xs text-slate-400">
          <span className="text-primary font-medium">Pro tip:</span> We automatically
          use maximum error correction when you add a logo, ensuring your QR stays
          readable even with the center obscured.
        </p>
      </div>

      {/* Learn more link */}
      <Link
        href="/blog/qr-code-with-logo"
        target="_blank"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors mt-2"
      >
        Learn more about logos in QR codes
        <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  );
}
