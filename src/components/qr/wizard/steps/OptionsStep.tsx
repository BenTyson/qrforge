'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useQRStudio } from '@/components/qr/studio/QRStudioContext';
import { getDisplayDestinationUrl } from '@/lib/qr/destination-url';

const DURABILITY_OPTIONS = [
  { level: 'L' as const, name: 'Basic', desc: 'Screens & digital' },
  { level: 'M' as const, name: 'Standard', desc: 'General print', recommended: true },
  { level: 'Q' as const, name: 'Enhanced', desc: 'Logos & busy designs' },
  { level: 'H' as const, name: 'Maximum', desc: 'Outdoor & rough use' },
];

interface OptionsStepProps {
  onContinue: () => void;
}

export function OptionsStep({ onContinue }: OptionsStepProps) {
  const { state, actions, canAccessProTypes } = useQRStudio();

  const errorCorrectionLevel = state.style.errorCorrectionLevel;
  const margin = state.style.margin;
  const {
    expiresAt,
    passwordEnabled,
    password,
    scheduledEnabled,
    activeFrom,
    activeUntil,
    abTestEnabled,
    abVariantBUrl,
    abSplitPercentage,
    userTier,
  } = state;

  const currentDestinationUrl = getDisplayDestinationUrl(state.content, state.selectedType);

  const onErrorCorrectionChange = (level: 'L' | 'M' | 'Q' | 'H') => actions.setStyle({ ...state.style, errorCorrectionLevel: level });
  const onMarginChange = (m: number) => actions.setStyle({ ...state.style, margin: m });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Options</h3>
        <p className="text-slate-400">Configure QR settings and advanced features</p>
      </div>

      {/* QR Settings Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">QR Settings</h4>

        {/* Durability (Error Correction Level) */}
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white mb-1">Durability</h4>
              <p className="text-xs text-slate-400 mb-3">Higher durability helps QR codes scan even when damaged or obscured</p>
              <div className="grid grid-cols-2 gap-2">
                {DURABILITY_OPTIONS.map((option) => (
                  <button
                    key={option.level}
                    onClick={() => onErrorCorrectionChange(option.level)}
                    className={cn(
                      'flex items-start gap-2 p-3 rounded-lg text-left transition-all border',
                      errorCorrectionLevel === option.level
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    )}
                  >
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-1.5 shrink-0',
                      errorCorrectionLevel === option.level ? 'bg-primary' : 'bg-slate-600'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-sm font-medium',
                          errorCorrectionLevel === option.level ? 'text-primary' : 'text-white'
                        )}>
                          {option.name}
                        </span>
                        {option.recommended && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{option.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Border Space (Margin) */}
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <rect x="7" y="7" width="10" height="10" rx="1" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-white">Border Space</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">
                    {margin === 0 ? 'None' : margin === 1 ? 'Minimal' : margin === 2 ? 'Standard' : margin <= 4 ? 'Normal' : 'Wide'}
                  </span>
                  {margin === 2 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Empty space around the QR helps scanners read it reliably
              </p>
              <Slider
                value={[margin]}
                onValueChange={([value]) => onMarginChange(value)}
                min={0}
                max={6}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pro Features Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Pro Features</h4>

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
                  onChange={(e) => actions.setExpiresAt(e.target.value)}
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
                        actions.setPasswordEnabled(e.target.checked);
                        if (!e.target.checked) actions.setPassword('');
                      }}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-300">Enable password</span>
                  </label>
                  {passwordEnabled && (
                    <div className="space-y-1">
                      <Input
                        type="password"
                        placeholder="Enter password (min. 4 characters)"
                        value={password}
                        onChange={(e) => actions.setPassword(e.target.value)}
                        minLength={4}
                        className="bg-slate-900 border-slate-600"
                      />
                      {password && password.length < 4 && (
                        <p className="text-xs text-yellow-500">Password must be at least 4 characters</p>
                      )}
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
                        actions.setScheduledEnabled(e.target.checked);
                        if (!e.target.checked) {
                          actions.setActiveFrom('');
                          actions.setActiveUntil('');
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
                          onChange={(e) => actions.setActiveFrom(e.target.value)}
                          className="bg-slate-900 border-slate-600 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-400">Until</Label>
                        <Input
                          type="datetime-local"
                          value={activeUntil}
                          onChange={(e) => actions.setActiveUntil(e.target.value)}
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

        {/* A/B Testing */}
        <div className={cn(
          'p-4 rounded-xl border transition-all',
          abTestEnabled
            ? 'border-primary bg-primary/5'
            : 'border-slate-700 bg-slate-800/50',
          !canAccessProTypes && 'opacity-60'
        )}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5" />
                <path d="M8 3H3v5" />
                <path d="M21 3l-7 7" />
                <path d="M3 3l7 7" />
                <path d="M21 14v7h-5" />
                <path d="M3 14v7h5" />
                <path d="M14 21l7-7" />
                <path d="M10 21l-7-7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white">A/B Testing</h4>
                {!canAccessProTypes && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Pro</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">Split traffic between destinations to test performance</p>
              {canAccessProTypes ? (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={abTestEnabled}
                      onChange={(e) => {
                        actions.setAbTestEnabled(e.target.checked);
                        if (!e.target.checked) {
                          actions.setAbVariantBUrl('');
                          actions.setAbSplitPercentage(50);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-300">Enable A/B testing</span>
                  </label>

                  {abTestEnabled && (
                    <div className="space-y-3">
                      {/* Variant A (Control) */}
                      <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30">
                        <Label className="text-xs text-teal-400 font-medium">Variant A (Control)</Label>
                        <p className="text-sm text-white truncate mt-1">
                          {currentDestinationUrl || 'Current destination'}
                        </p>
                      </div>

                      {/* Variant B input */}
                      <div className="space-y-1">
                        <Label className="text-xs text-purple-400 font-medium">Variant B</Label>
                        <Input
                          placeholder="https://example.com/alternative"
                          value={abVariantBUrl}
                          onChange={(e) => actions.setAbVariantBUrl(e.target.value)}
                          className="bg-slate-900 border-slate-600"
                        />
                      </div>

                      {/* Traffic split slider */}
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-400">Traffic Split</Label>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-teal-400 font-medium">A: {100 - abSplitPercentage}%</span>
                          <span className="text-purple-400 font-medium">B: {abSplitPercentage}%</span>
                        </div>
                        <Slider
                          value={[abSplitPercentage]}
                          onValueChange={([v]) => actions.setAbSplitPercentage(v)}
                          min={10}
                          max={90}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Same visitor always sees the same variant
                        </p>
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
      {(expiresAt || (passwordEnabled && password) || (scheduledEnabled && (activeFrom || activeUntil)) || (abTestEnabled && abVariantBUrl)) && (
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
            {abTestEnabled && abVariantBUrl && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                A/B Test ({100 - abSplitPercentage}/{abSplitPercentage} split)
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
