-- Add missing scan_limit_notified_at column to profiles table
-- This column tracks when a user was last notified about reaching their scan limit
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scan_limit_notified_at TIMESTAMPTZ;
