-- Enhanced Scheduling: add timezone and recurring schedule support
ALTER TABLE qr_codes
ADD COLUMN IF NOT EXISTS schedule_timezone TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS schedule_rule JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN qr_codes.schedule_timezone IS 'IANA timezone string (e.g. America/New_York). Applies to both one-time and recurring schedules.';
COMMENT ON COLUMN qr_codes.schedule_rule IS 'Recurring schedule definition: { type: daily|weekly, startTime: HH:MM, endTime: HH:MM, daysOfWeek?: number[] }';
