import type { ScheduleRule } from '@/lib/supabase/types';

// ---------- Core schedule check ----------

interface IsActiveParams {
  now: Date;
  activeFrom?: string | null;
  activeUntil?: string | null;
  timezone?: string | null;
  rule?: ScheduleRule | null;
}

interface IsActiveResult {
  active: boolean;
  reason: 'active' | 'early' | 'ended' | 'recurring';
}

/**
 * Determine whether a QR code is active at the given instant.
 * Handles one-time windows, daily recurring, and weekly recurring schedules.
 */
export function isActiveAtTime({ now, activeFrom, activeUntil, timezone, rule }: IsActiveParams): IsActiveResult {
  // --- One-time window (active_from / active_until) ---
  if (activeFrom) {
    const from = new Date(activeFrom);
    if (now < from) {
      return { active: false, reason: 'early' };
    }
  }
  if (activeUntil) {
    const until = new Date(activeUntil);
    if (now > until) {
      return { active: false, reason: 'ended' };
    }
  }

  // --- Recurring rule ---
  if (!rule) {
    return { active: true, reason: 'active' };
  }

  const tz = timezone || 'UTC';
  const localParts = getLocalTimeParts(now, tz);
  const currentMinutes = localParts.hours * 60 + localParts.minutes;
  const startMinutes = parseTimeToMinutes(rule.startTime);
  const endMinutes = parseTimeToMinutes(rule.endTime);

  // Weekly: check day-of-week first
  if (rule.type === 'weekly' && rule.daysOfWeek) {
    if (!rule.daysOfWeek.includes(localParts.dayOfWeek)) {
      return { active: false, reason: 'recurring' };
    }
  }

  // Check time range (handles midnight crossing)
  const inRange = isTimeInRange(currentMinutes, startMinutes, endMinutes);
  if (!inRange) {
    return { active: false, reason: 'recurring' };
  }

  return { active: true, reason: 'active' };
}

// ---------- Timezone helpers ----------

interface LocalTimeParts {
  hours: number;
  minutes: number;
  dayOfWeek: number; // 0=Sun..6=Sat
  year: number;
  month: number; // 1-12
  day: number;
}

function getLocalTimeParts(date: Date, timezone: string): LocalTimeParts {
  // Use Intl.DateTimeFormat to get parts in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '0';

  const weekdayStr = get('weekday');
  const dayOfWeekMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  return {
    hours: parseInt(get('hour'), 10),
    minutes: parseInt(get('minute'), 10),
    dayOfWeek: dayOfWeekMap[weekdayStr] ?? 0,
    year: parseInt(get('year'), 10),
    month: parseInt(get('month'), 10),
    day: parseInt(get('day'), 10),
  };
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Check if currentMinutes falls within [start, end), handling midnight crossing.
 * e.g. 22:00–06:00 means active from 22:00 to 23:59 and 00:00 to 05:59.
 */
function isTimeInRange(current: number, start: number, end: number): boolean {
  if (start <= end) {
    // Normal range: e.g. 09:00–17:00
    return current >= start && current < end;
  }
  // Midnight crossing: e.g. 22:00–06:00
  return current >= start || current < end;
}

// ---------- Timezone options ----------

interface TimezoneOption {
  value: string;
  label: string;
  group: string;
}

const TIMEZONE_LIST: Array<{ iana: string; label: string; group: string }> = [
  // Americas
  { iana: 'America/New_York', label: 'Eastern Time (New York)', group: 'Americas' },
  { iana: 'America/Chicago', label: 'Central Time (Chicago)', group: 'Americas' },
  { iana: 'America/Denver', label: 'Mountain Time (Denver)', group: 'Americas' },
  { iana: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)', group: 'Americas' },
  { iana: 'America/Anchorage', label: 'Alaska (Anchorage)', group: 'Americas' },
  { iana: 'Pacific/Honolulu', label: 'Hawaii (Honolulu)', group: 'Americas' },
  { iana: 'America/Phoenix', label: 'Arizona (Phoenix)', group: 'Americas' },
  { iana: 'America/Toronto', label: 'Toronto', group: 'Americas' },
  { iana: 'America/Vancouver', label: 'Vancouver', group: 'Americas' },
  { iana: 'America/Mexico_City', label: 'Mexico City', group: 'Americas' },
  { iana: 'America/Bogota', label: 'Bogota', group: 'Americas' },
  { iana: 'America/Lima', label: 'Lima', group: 'Americas' },
  { iana: 'America/Santiago', label: 'Santiago', group: 'Americas' },
  { iana: 'America/Buenos_Aires', label: 'Buenos Aires', group: 'Americas' },
  { iana: 'America/Sao_Paulo', label: 'Sao Paulo', group: 'Americas' },
  // Europe
  { iana: 'Europe/London', label: 'London (GMT/BST)', group: 'Europe' },
  { iana: 'Europe/Paris', label: 'Paris (CET)', group: 'Europe' },
  { iana: 'Europe/Berlin', label: 'Berlin (CET)', group: 'Europe' },
  { iana: 'Europe/Madrid', label: 'Madrid', group: 'Europe' },
  { iana: 'Europe/Rome', label: 'Rome', group: 'Europe' },
  { iana: 'Europe/Amsterdam', label: 'Amsterdam', group: 'Europe' },
  { iana: 'Europe/Zurich', label: 'Zurich', group: 'Europe' },
  { iana: 'Europe/Stockholm', label: 'Stockholm', group: 'Europe' },
  { iana: 'Europe/Warsaw', label: 'Warsaw', group: 'Europe' },
  { iana: 'Europe/Athens', label: 'Athens (EET)', group: 'Europe' },
  { iana: 'Europe/Helsinki', label: 'Helsinki', group: 'Europe' },
  { iana: 'Europe/Bucharest', label: 'Bucharest', group: 'Europe' },
  { iana: 'Europe/Istanbul', label: 'Istanbul', group: 'Europe' },
  { iana: 'Europe/Moscow', label: 'Moscow', group: 'Europe' },
  // Asia
  { iana: 'Asia/Dubai', label: 'Dubai (GST)', group: 'Asia' },
  { iana: 'Asia/Karachi', label: 'Karachi (PKT)', group: 'Asia' },
  { iana: 'Asia/Kolkata', label: 'Mumbai / Kolkata (IST)', group: 'Asia' },
  { iana: 'Asia/Dhaka', label: 'Dhaka', group: 'Asia' },
  { iana: 'Asia/Bangkok', label: 'Bangkok (ICT)', group: 'Asia' },
  { iana: 'Asia/Singapore', label: 'Singapore (SGT)', group: 'Asia' },
  { iana: 'Asia/Hong_Kong', label: 'Hong Kong', group: 'Asia' },
  { iana: 'Asia/Shanghai', label: 'Shanghai (CST)', group: 'Asia' },
  { iana: 'Asia/Taipei', label: 'Taipei', group: 'Asia' },
  { iana: 'Asia/Seoul', label: 'Seoul (KST)', group: 'Asia' },
  { iana: 'Asia/Tokyo', label: 'Tokyo (JST)', group: 'Asia' },
  { iana: 'Asia/Jakarta', label: 'Jakarta (WIB)', group: 'Asia' },
  { iana: 'Asia/Manila', label: 'Manila', group: 'Asia' },
  // Oceania
  { iana: 'Australia/Perth', label: 'Perth (AWST)', group: 'Oceania' },
  { iana: 'Australia/Adelaide', label: 'Adelaide (ACST)', group: 'Oceania' },
  { iana: 'Australia/Sydney', label: 'Sydney (AEST)', group: 'Oceania' },
  { iana: 'Australia/Melbourne', label: 'Melbourne', group: 'Oceania' },
  { iana: 'Australia/Brisbane', label: 'Brisbane', group: 'Oceania' },
  { iana: 'Pacific/Auckland', label: 'Auckland (NZST)', group: 'Oceania' },
  // Africa
  { iana: 'Africa/Cairo', label: 'Cairo (EET)', group: 'Africa' },
  { iana: 'Africa/Lagos', label: 'Lagos (WAT)', group: 'Africa' },
  { iana: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', group: 'Africa' },
  { iana: 'Africa/Nairobi', label: 'Nairobi (EAT)', group: 'Africa' },
  { iana: 'Africa/Casablanca', label: 'Casablanca', group: 'Africa' },
  // UTC
  { iana: 'UTC', label: 'UTC', group: 'UTC' },
];

export function getTimezoneOptions(): TimezoneOption[] {
  return TIMEZONE_LIST.map(tz => ({
    value: tz.iana,
    label: tz.label,
    group: tz.group,
  }));
}

export function guessUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

// ---------- Active periods preview ----------

export interface ActivePeriod {
  dayLabel: string;         // "Mon 2/3"
  startPercent: number;     // 0–100 (position in 24h bar)
  widthPercent: number;     // 0–100
  isToday: boolean;
}

interface PreviewParams {
  activeFrom?: string | null;
  activeUntil?: string | null;
  timezone?: string | null;
  rule?: ScheduleRule | null;
  days?: number;
}

export function getActivePeriodsPreview({
  activeFrom,
  activeUntil,
  timezone,
  rule,
  days = 7,
}: PreviewParams): ActivePeriod[] {
  const tz = timezone || 'UTC';
  const now = new Date();
  const result: ActivePeriod[] = [];

  for (let d = 0; d < days; d++) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() + d);

    const localParts = getLocalTimeParts(dayDate, tz);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayLabel = `${dayNames[localParts.dayOfWeek]} ${localParts.month}/${localParts.day}`;
    const isToday = d === 0;

    if (!rule) {
      // One-time window: show as full-day blocks within the window
      const dayStartUTC = new Date(dayDate);
      dayStartUTC.setHours(0, 0, 0, 0);
      const dayEndUTC = new Date(dayDate);
      dayEndUTC.setHours(23, 59, 59, 999);

      let start = 0;
      let end = 100;

      if (activeFrom) {
        const from = new Date(activeFrom);
        if (from > dayEndUTC) {
          result.push({ dayLabel, startPercent: 0, widthPercent: 0, isToday });
          continue;
        }
        if (from > dayStartUTC) {
          start = ((from.getHours() * 60 + from.getMinutes()) / 1440) * 100;
        }
      }
      if (activeUntil) {
        const until = new Date(activeUntil);
        if (until < dayStartUTC) {
          result.push({ dayLabel, startPercent: 0, widthPercent: 0, isToday });
          continue;
        }
        if (until < dayEndUTC) {
          end = ((until.getHours() * 60 + until.getMinutes()) / 1440) * 100;
        }
      }

      result.push({ dayLabel, startPercent: start, widthPercent: Math.max(0, end - start), isToday });
    } else {
      // Recurring
      const startMin = parseTimeToMinutes(rule.startTime);
      const endMin = parseTimeToMinutes(rule.endTime);

      // Weekly: check day
      if (rule.type === 'weekly' && rule.daysOfWeek && !rule.daysOfWeek.includes(localParts.dayOfWeek)) {
        result.push({ dayLabel, startPercent: 0, widthPercent: 0, isToday });
        continue;
      }

      if (startMin <= endMin) {
        const startPct = (startMin / 1440) * 100;
        const widthPct = ((endMin - startMin) / 1440) * 100;
        result.push({ dayLabel, startPercent: startPct, widthPercent: widthPct, isToday });
      } else {
        // Midnight crossing — two segments
        // Segment 1: start -> midnight
        const seg1Start = (startMin / 1440) * 100;
        const seg1Width = ((1440 - startMin) / 1440) * 100;
        // Segment 2: midnight -> end
        const seg2Width = (endMin / 1440) * 100;
        // We combine as a single period for simplicity (wrap-around visual)
        // Show the later part of the day (start -> end of day)
        result.push({ dayLabel, startPercent: seg1Start, widthPercent: seg1Width + seg2Width, isToday });
      }
    }
  }

  return result;
}

// ---------- Timezone-aware UTC conversion ----------

/**
 * Convert a datetime-local string (e.g. "2024-03-15T09:00") interpreted in the
 * given timezone to a UTC ISO string.
 */
export function convertLocalToUTC(datetimeLocal: string, timezone: string): string {
  if (!datetimeLocal) return '';

  // Build a formatter that outputs ISO-like parts in the given timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Parse the input as a local datetime
  const [datePart, timePart] = datetimeLocal.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  // Create a date assuming UTC, then find the offset for the target timezone
  // by comparing what the formatter produces vs what we want
  let guess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  // Iterative approach: adjust until the formatted time matches the desired local time
  for (let i = 0; i < 3; i++) {
    const parts = formatter.formatToParts(guess);
    const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);

    const fmtHour = get('hour');
    const fmtMinute = get('minute');
    const fmtDay = get('day');
    const fmtMonth = get('month');

    const diffMinutes =
      (hours - fmtHour) * 60 + (minutes - fmtMinute) +
      (day - fmtDay) * 1440 +
      (month - fmtMonth) * 43200; // rough month correction

    if (diffMinutes === 0) break;
    guess = new Date(guess.getTime() + diffMinutes * 60000);
  }

  return guess.toISOString();
}
