'use client';

import { useState } from 'react';
import { Image as ImageIcon, Palette, Grid3X3, Frame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ColorsTabContent } from './style-tabs/ColorsTabContent';
import { LogoTabContent } from './style-tabs/LogoTabContent';
import { PatternTabContent } from './style-tabs/PatternTabContent';
import { FrameTabContent } from './style-tabs/FrameTabContent';
import type { QRStyleOptions } from '@/lib/qr/types';

interface StyleStepProps {
  style: QRStyleOptions;
  onStyleChange: (style: QRStyleOptions) => void;
  onContinue: () => void;
  canAccessProTypes: boolean;
}

type TabType = 'pattern' | 'colors' | 'logo' | 'frame';

export function StyleStep({
  style,
  onStyleChange,
  onContinue,
  canAccessProTypes,
}: StyleStepProps) {
  const [activeTab, setActiveTab] = useState<TabType>('colors');

  const tabs: { id: TabType; label: string; icon: React.ReactNode; proBadge?: boolean; indicator?: boolean }[] = [
    { id: 'colors', label: 'Colors', icon: <Palette className="w-5 h-5" /> },
    { id: 'logo', label: 'Logo', icon: <ImageIcon className="w-5 h-5" />, proBadge: true, indicator: !!style.logoUrl },
    { id: 'pattern', label: 'Pattern', icon: <Grid3X3 className="w-5 h-5" />, proBadge: true },
    { id: 'frame', label: 'Frame', icon: <Frame className="w-5 h-5" />, proBadge: true, indicator: style.frame?.enabled },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Prominent Tab Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all relative",
              activeTab === tab.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10"
            )}
          >
            {tab.icon}
            <span className="text-sm font-medium">{tab.label}</span>
            {tab.proBadge && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">
                Pro
              </Badge>
            )}
            {tab.indicator && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content - Full Width */}
      <div className="min-h-[400px]">
        {activeTab === 'colors' && (
          <ColorsTabContent
            style={style}
            onStyleChange={onStyleChange}
            canAccessProTypes={canAccessProTypes}
          />
        )}
        {activeTab === 'pattern' && (
          <PatternTabContent
            style={style}
            onStyleChange={onStyleChange}
            canAccessProTypes={canAccessProTypes}
          />
        )}
        {activeTab === 'frame' && (
          <FrameTabContent
            style={style}
            onStyleChange={onStyleChange}
            canAccessProTypes={canAccessProTypes}
          />
        )}
        {activeTab === 'logo' && (
          <LogoTabContent
            style={style}
            onStyleChange={onStyleChange}
            canAccessProTypes={canAccessProTypes}
          />
        )}
      </div>

      {/* Continue Button */}
      <Button onClick={onContinue} className="w-full mt-6" size="lg">
        Continue to Options
        <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}
