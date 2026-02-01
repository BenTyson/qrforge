'use client';

import { useState, useCallback } from 'react';
import { guessUserTimezone } from '@/lib/scheduling/utils';

export type ScheduleMode = 'once' | 'daily' | 'weekly';

export interface ProOptionsState {
  expiresAt: string;
  passwordEnabled: boolean;
  password: string;
  scheduledEnabled: boolean;
  activeFrom: string;
  activeUntil: string;
  scheduleTimezone: string;
  scheduleMode: ScheduleMode;
  recurringStartTime: string;
  recurringEndTime: string;
  recurringDaysOfWeek: number[];
  landingPageEnabled: boolean;
  landingPageTitle: string;
  landingPageDescription: string;
  landingPageButtonText: string;
  abTestEnabled: boolean;
  abVariantBUrl: string;
  abSplitPercentage: number;
}

export interface ProOptionsActions {
  setExpiresAt: (date: string) => void;
  setPasswordEnabled: (enabled: boolean) => void;
  setPassword: (password: string) => void;
  setScheduledEnabled: (enabled: boolean) => void;
  setActiveFrom: (date: string) => void;
  setActiveUntil: (date: string) => void;
  setScheduleTimezone: (tz: string) => void;
  setScheduleMode: (mode: ScheduleMode) => void;
  setRecurringStartTime: (time: string) => void;
  setRecurringEndTime: (time: string) => void;
  setRecurringDaysOfWeek: (days: number[]) => void;
  setLandingPageEnabled: (enabled: boolean) => void;
  setLandingPageTitle: (title: string) => void;
  setLandingPageDescription: (description: string) => void;
  setLandingPageButtonText: (text: string) => void;
  setAbTestEnabled: (enabled: boolean) => void;
  setAbVariantBUrl: (url: string) => void;
  setAbSplitPercentage: (percent: number) => void;
  resetProOptions: () => void;
}

export function useProOptions(): [ProOptionsState, ProOptionsActions] {
  const [expiresAt, setExpiresAt] = useState('');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [scheduledEnabled, setScheduledEnabled] = useState(false);
  const [activeFrom, setActiveFrom] = useState('');
  const [activeUntil, setActiveUntil] = useState('');
  const [scheduleTimezone, setScheduleTimezone] = useState(() => guessUserTimezone());
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('once');
  const [recurringStartTime, setRecurringStartTime] = useState('');
  const [recurringEndTime, setRecurringEndTime] = useState('');
  const [recurringDaysOfWeek, setRecurringDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [landingPageEnabled, setLandingPageEnabled] = useState(false);
  const [landingPageTitle, setLandingPageTitle] = useState('');
  const [landingPageDescription, setLandingPageDescription] = useState('');
  const [landingPageButtonText, setLandingPageButtonText] = useState('Continue');
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [abVariantBUrl, setAbVariantBUrl] = useState('');
  const [abSplitPercentage, setAbSplitPercentage] = useState(50);

  const resetProOptions = useCallback(() => {
    setExpiresAt('');
    setPasswordEnabled(false);
    setPassword('');
    setScheduledEnabled(false);
    setActiveFrom('');
    setActiveUntil('');
    setScheduleTimezone(guessUserTimezone());
    setScheduleMode('once');
    setRecurringStartTime('');
    setRecurringEndTime('');
    setRecurringDaysOfWeek([1, 2, 3, 4, 5]);
    setLandingPageEnabled(false);
    setLandingPageTitle('');
    setLandingPageDescription('');
    setLandingPageButtonText('Continue');
    setAbTestEnabled(false);
    setAbVariantBUrl('');
    setAbSplitPercentage(50);
  }, []);

  const state: ProOptionsState = {
    expiresAt,
    passwordEnabled,
    password,
    scheduledEnabled,
    activeFrom,
    activeUntil,
    scheduleTimezone,
    scheduleMode,
    recurringStartTime,
    recurringEndTime,
    recurringDaysOfWeek,
    landingPageEnabled,
    landingPageTitle,
    landingPageDescription,
    landingPageButtonText,
    abTestEnabled,
    abVariantBUrl,
    abSplitPercentage,
  };

  const actions: ProOptionsActions = {
    setExpiresAt,
    setPasswordEnabled,
    setPassword,
    setScheduledEnabled,
    setActiveFrom,
    setActiveUntil,
    setScheduleTimezone,
    setScheduleMode,
    setRecurringStartTime,
    setRecurringEndTime,
    setRecurringDaysOfWeek,
    setLandingPageEnabled,
    setLandingPageTitle,
    setLandingPageDescription,
    setLandingPageButtonText,
    setAbTestEnabled,
    setAbVariantBUrl,
    setAbSplitPercentage,
    resetProOptions,
  };

  return [state, actions];
}
