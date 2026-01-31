-- Add archived_at column for soft-delete archive functionality
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficient filtering of archived vs active codes per user
CREATE INDEX IF NOT EXISTS idx_qr_codes_archived ON qr_codes(user_id, archived_at);
