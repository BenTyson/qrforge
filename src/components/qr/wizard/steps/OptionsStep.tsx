'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface OptionsStepProps {
  // Expiration
  expiresAt: string;
  onExpiresAtChange: (value: string) => void;
  // Password
  passwordEnabled: boolean;
  onPasswordEnabledChange: (enabled: boolean) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  // Scheduling
  scheduledEnabled: boolean;
  onScheduledEnabledChange: (enabled: boolean) => void;
  activeFrom: string;
  onActiveFromChange: (value: string) => void;
  activeUntil: string;
  onActiveUntilChange: (value: string) => void;
  // Access
  canAccessProTypes: boolean;
  userTier: 'free' | 'pro' | 'business' | null;
  // Actions
  onContinue: () => void;
}

export function OptionsStep({
  expiresAt,
  onExpiresAtChange,
  passwordEnabled,
  onPasswordEnabledChange,
  password,
  onPasswordChange,
  scheduledEnabled,
  onScheduledEnabledChange,
  activeFrom,
  onActiveFromChange,
  activeUntil,
  onActiveUntilChange,
  canAccessProTypes,
  userTier,
  onContinue,
}: OptionsStepProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Advanced Options</h3>
        <p className="text-slate-400">Configure expiration, password protection, and more</p>
      </div>

      {/* Pro Feature Cards */}
      <div className="space-y-4">
        {/* Expiration Date */}
        <div className={cn(
          'p-4 rounded-xl border transition-all',
          expiresAt
            ? 'border-primary bg-primary/5'
            : 'border-slate-700 bg-slate-800/50',
          !canAccessProTypes && 'opacity-60'
        )}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white">Expiration Date</h4>
                {!canAccessProTypes && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Pro</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">Set a date when this QR code stops working</p>
              {canAccessProTypes ? (
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => onExpiresAtChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-slate-900 border-slate-600"
                />
              ) : (
                <Link href="/plans">
                  <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Password Protection */}
        <div className={cn(
          'p-4 rounded-xl border transition-all',
          passwordEnabled
            ? 'border-primary bg-primary/5'
            : 'border-slate-700 bg-slate-800/50',
          !canAccessProTypes && 'opacity-60'
        )}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white">Password Protection</h4>
                {!canAccessProTypes && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Pro</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">Require a password to view content</p>
              {canAccessProTypes ? (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passwordEnabled}
                      onChange={(e) => {
                        onPasswordEnabledChange(e.target.checked);
                        if (!e.target.checked) onPasswordChange('');
                      }}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-300">Enable password</span>
                  </label>
                  {passwordEnabled && (
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => onPasswordChange(e.target.value)}
                      className="bg-slate-900 border-slate-600"
                    />
                  )}
                </div>
              ) : (
                <Link href="/plans">
                  <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scheduled Activation */}
        <div className={cn(
          'p-4 rounded-xl border transition-all',
          scheduledEnabled
            ? 'border-primary bg-primary/5'
            : 'border-slate-700 bg-slate-800/50',
          !canAccessProTypes && 'opacity-60'
        )}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white">Scheduled Activation</h4>
                {!canAccessProTypes && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Pro</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">Set when the QR code becomes active</p>
              {canAccessProTypes ? (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduledEnabled}
                      onChange={(e) => {
                        onScheduledEnabledChange(e.target.checked);
                        if (!e.target.checked) {
                          onActiveFromChange('');
                          onActiveUntilChange('');
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-300">Enable scheduling</span>
                  </label>
                  {scheduledEnabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-slate-400">From</Label>
                        <Input
                          type="datetime-local"
                          value={activeFrom}
                          onChange={(e) => onActiveFromChange(e.target.value)}
                          className="bg-slate-900 border-slate-600 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-400">Until</Label>
                        <Input
                          type="datetime-local"
                          value={activeUntil}
                          onChange={(e) => onActiveUntilChange(e.target.value)}
                          className="bg-slate-900 border-slate-600 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/plans">
                  <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary of enabled options */}
      {(expiresAt || (passwordEnabled && password) || (scheduledEnabled && (activeFrom || activeUntil))) && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <h4 className="font-medium text-white mb-2">Enabled Options</h4>
          <div className="flex flex-wrap gap-2">
            {expiresAt && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                Expires {new Date(expiresAt).toLocaleDateString()}
              </span>
            )}
            {passwordEnabled && password && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                Password Protected
              </span>
            )}
            {scheduledEnabled && (activeFrom || activeUntil) && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                Scheduled
              </span>
            )}
          </div>
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {!canAccessProTypes && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">Unlock all options</p>
              <p className="text-sm text-slate-400">Upgrade to Pro to access expiration dates, passwords, scheduling, and more</p>
            </div>
            <Link href={userTier === null ? "/signup" : "/plans"}>
              <Button className="shrink-0 glow-hover">
                {userTier === null ? "Sign Up" : "Upgrade"}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <Button onClick={onContinue} className="w-full" size="lg">
        Continue to Download
        <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}
