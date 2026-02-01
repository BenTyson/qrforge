import { isActiveAtTime, convertLocalToUTC, getTimezoneOptions, guessUserTimezone, getActivePeriodsPreview } from '../utils';

describe('isActiveAtTime', () => {
  // --- One-time window ---
  describe('one-time window', () => {
    it('returns early when now is before activeFrom', () => {
      const result = isActiveAtTime({
        now: new Date('2024-03-15T08:00:00Z'),
        activeFrom: '2024-03-15T10:00:00Z',
        activeUntil: '2024-03-15T18:00:00Z',
      });
      expect(result).toEqual({ active: false, reason: 'early' });
    });

    it('returns active when now is within window', () => {
      const result = isActiveAtTime({
        now: new Date('2024-03-15T12:00:00Z'),
        activeFrom: '2024-03-15T10:00:00Z',
        activeUntil: '2024-03-15T18:00:00Z',
      });
      expect(result).toEqual({ active: true, reason: 'active' });
    });

    it('returns ended when now is after activeUntil', () => {
      const result = isActiveAtTime({
        now: new Date('2024-03-15T20:00:00Z'),
        activeFrom: '2024-03-15T10:00:00Z',
        activeUntil: '2024-03-15T18:00:00Z',
      });
      expect(result).toEqual({ active: false, reason: 'ended' });
    });

    it('returns active when no schedule is set', () => {
      const result = isActiveAtTime({
        now: new Date('2024-03-15T12:00:00Z'),
      });
      expect(result).toEqual({ active: true, reason: 'active' });
    });

    it('returns active with only activeFrom in the past', () => {
      const result = isActiveAtTime({
        now: new Date('2024-03-15T12:00:00Z'),
        activeFrom: '2024-03-15T10:00:00Z',
      });
      expect(result).toEqual({ active: true, reason: 'active' });
    });
  });

  // --- Daily recurring ---
  describe('daily recurring', () => {
    const dailyRule = { type: 'daily' as const, startTime: '09:00', endTime: '17:00' };

    it('returns active during business hours', () => {
      // 12:00 UTC on a weekday
      const result = isActiveAtTime({
        now: new Date('2024-03-15T12:00:00Z'),
        timezone: 'UTC',
        rule: dailyRule,
      });
      expect(result).toEqual({ active: true, reason: 'active' });
    });

    it('returns inactive outside business hours', () => {
      // 20:00 UTC
      const result = isActiveAtTime({
        now: new Date('2024-03-15T20:00:00Z'),
        timezone: 'UTC',
        rule: dailyRule,
      });
      expect(result).toEqual({ active: false, reason: 'recurring' });
    });

    it('returns inactive just before start', () => {
      const result = isActiveAtTime({
        now: new Date('2024-03-15T08:59:00Z'),
        timezone: 'UTC',
        rule: dailyRule,
      });
      expect(result).toEqual({ active: false, reason: 'recurring' });
    });

    it('returns active at exactly start time', () => {
      const result = isActiveAtTime({
        now: new Date('2024-03-15T09:00:00Z'),
        timezone: 'UTC',
        rule: dailyRule,
      });
      expect(result).toEqual({ active: true, reason: 'active' });
    });
  });

  // --- Weekly recurring ---
  describe('weekly recurring', () => {
    const weekdayRule = {
      type: 'weekly' as const,
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    };

    it('returns active on correct day and time', () => {
      // 2024-03-15 is a Friday
      const result = isActiveAtTime({
        now: new Date('2024-03-15T12:00:00Z'),
        timezone: 'UTC',
        rule: weekdayRule,
      });
      expect(result).toEqual({ active: true, reason: 'active' });
    });

    it('returns inactive on wrong day (weekend)', () => {
      // 2024-03-16 is a Saturday
      const result = isActiveAtTime({
        now: new Date('2024-03-16T12:00:00Z'),
        timezone: 'UTC',
        rule: weekdayRule,
      });
      expect(result).toEqual({ active: false, reason: 'recurring' });
    });

    it('returns inactive on correct day but wrong time', () => {
      // Friday at 20:00
      const result = isActiveAtTime({
        now: new Date('2024-03-15T20:00:00Z'),
        timezone: 'UTC',
        rule: weekdayRule,
      });
      expect(result).toEqual({ active: false, reason: 'recurring' });
    });
  });

  // --- Timezone awareness ---
  describe('timezone', () => {
    it('evaluates "9 AM New York" correctly from UTC', () => {
      // 9 AM ET on March 15, 2024 (EDT) = 13:00 UTC
      const result = isActiveAtTime({
        now: new Date('2024-03-15T13:00:00Z'),
        timezone: 'America/New_York',
        rule: { type: 'daily', startTime: '09:00', endTime: '17:00' },
      });
      expect(result).toEqual({ active: true, reason: 'active' });
    });

    it('evaluates pre-9 AM New York as inactive', () => {
      // 12:00 UTC = 8:00 AM EDT
      const result = isActiveAtTime({
        now: new Date('2024-03-15T12:00:00Z'),
        timezone: 'America/New_York',
        rule: { type: 'daily', startTime: '09:00', endTime: '17:00' },
      });
      expect(result).toEqual({ active: false, reason: 'recurring' });
    });

    it('defaults to UTC when timezone is null', () => {
      const result = isActiveAtTime({
        now: new Date('2024-03-15T12:00:00Z'),
        timezone: null,
        rule: { type: 'daily', startTime: '09:00', endTime: '17:00' },
      });
      expect(result).toEqual({ active: true, reason: 'active' });
    });
  });

  // --- Edge cases ---
  describe('edge cases', () => {
    it('handles midnight crossing (22:00–06:00)', () => {
      const nightRule = { type: 'daily' as const, startTime: '22:00', endTime: '06:00' };

      // 23:00 UTC — should be active
      const lateNight = isActiveAtTime({
        now: new Date('2024-03-15T23:00:00Z'),
        timezone: 'UTC',
        rule: nightRule,
      });
      expect(lateNight).toEqual({ active: true, reason: 'active' });

      // 03:00 UTC — should be active
      const earlyMorning = isActiveAtTime({
        now: new Date('2024-03-16T03:00:00Z'),
        timezone: 'UTC',
        rule: nightRule,
      });
      expect(earlyMorning).toEqual({ active: true, reason: 'active' });

      // 12:00 UTC — should be inactive
      const midday = isActiveAtTime({
        now: new Date('2024-03-15T12:00:00Z'),
        timezone: 'UTC',
        rule: nightRule,
      });
      expect(midday).toEqual({ active: false, reason: 'recurring' });
    });

    it('returns active when rule is null', () => {
      const result = isActiveAtTime({
        now: new Date('2024-03-15T12:00:00Z'),
        rule: null,
      });
      expect(result).toEqual({ active: true, reason: 'active' });
    });

    it('one-time window checked before recurring rule', () => {
      // Before active_from, even if recurring rule would allow
      const result = isActiveAtTime({
        now: new Date('2024-03-10T12:00:00Z'),
        activeFrom: '2024-03-15T00:00:00Z',
        timezone: 'UTC',
        rule: { type: 'daily', startTime: '09:00', endTime: '17:00' },
      });
      expect(result).toEqual({ active: false, reason: 'early' });
    });
  });
});

describe('convertLocalToUTC', () => {
  it('converts Eastern Time to UTC', () => {
    // March 15, 2024 9:00 AM EDT = 13:00 UTC (EDT is UTC-4 in March)
    const result = convertLocalToUTC('2024-03-15T09:00', 'America/New_York');
    const date = new Date(result);
    expect(date.getUTCHours()).toBe(13);
    expect(date.getUTCMinutes()).toBe(0);
  });

  it('converts UTC to UTC unchanged', () => {
    const result = convertLocalToUTC('2024-03-15T09:00', 'UTC');
    const date = new Date(result);
    expect(date.getUTCHours()).toBe(9);
    expect(date.getUTCMinutes()).toBe(0);
  });

  it('returns empty string for empty input', () => {
    expect(convertLocalToUTC('', 'UTC')).toBe('');
  });
});

describe('getTimezoneOptions', () => {
  it('returns a non-empty array of timezone options', () => {
    const options = getTimezoneOptions();
    expect(options.length).toBeGreaterThan(30);
    expect(options[0]).toHaveProperty('value');
    expect(options[0]).toHaveProperty('label');
    expect(options[0]).toHaveProperty('group');
  });

  it('includes common timezones', () => {
    const options = getTimezoneOptions();
    const values = options.map(o => o.value);
    expect(values).toContain('America/New_York');
    expect(values).toContain('Europe/London');
    expect(values).toContain('Asia/Tokyo');
    expect(values).toContain('UTC');
  });
});

describe('guessUserTimezone', () => {
  it('returns a non-empty string', () => {
    const tz = guessUserTimezone();
    expect(typeof tz).toBe('string');
    expect(tz.length).toBeGreaterThan(0);
  });
});

describe('getActivePeriodsPreview', () => {
  it('returns 7 days by default', () => {
    const periods = getActivePeriodsPreview({
      timezone: 'UTC',
      rule: { type: 'daily', startTime: '09:00', endTime: '17:00' },
    });
    expect(periods).toHaveLength(7);
    expect(periods[0].isToday).toBe(true);
    expect(periods[1].isToday).toBe(false);
  });

  it('marks weekends as inactive for weekly rule', () => {
    const periods = getActivePeriodsPreview({
      timezone: 'UTC',
      rule: { type: 'weekly', startTime: '09:00', endTime: '17:00', daysOfWeek: [1, 2, 3, 4, 5] },
      days: 7,
    });
    // At least some days should have widthPercent > 0 (weekdays) and some 0 (weekends)
    const activeDays = periods.filter(p => p.widthPercent > 0);
    const inactiveDays = periods.filter(p => p.widthPercent === 0);
    expect(activeDays.length).toBeGreaterThan(0);
    expect(inactiveDays.length).toBeGreaterThan(0);
  });

  it('returns empty periods for one-time window entirely in the past', () => {
    const periods = getActivePeriodsPreview({
      activeFrom: '2020-01-01T00:00:00Z',
      activeUntil: '2020-01-02T00:00:00Z',
    });
    // All days should have 0 width since the window ended years ago
    periods.forEach(p => {
      expect(p.widthPercent).toBe(0);
    });
  });
});
