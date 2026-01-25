'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Crown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProTemplateModal({ isOpen, onClose }: ProTemplateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative bg-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full',
        'shadow-2xl shadow-primary/10',
        'animate-scale-in'
      )}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-2">Pro Template</h2>

          {/* Description */}
          <p className="text-slate-400 mb-8">
            This template uses Pro features like custom patterns, gradients, and frames. Upgrade to unlock all 40+ templates.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/plans" className="block">
              <Button
                size="lg"
                className="w-full glow-hover bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              className="w-full text-slate-400 hover:text-white"
              onClick={onClose}
            >
              Browse Free Templates
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
