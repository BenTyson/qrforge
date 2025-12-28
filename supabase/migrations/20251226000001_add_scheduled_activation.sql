-- Add scheduled activation fields to qr_codes table
-- Allows Pro+ users to set start/end times for when QR codes are active

ALTER TABLE qr_codes
ADD COLUMN IF NOT EXISTS active_from TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS active_until TIMESTAMPTZ DEFAULT NULL;

-- Add index for efficient queries on active time windows
CREATE INDEX IF NOT EXISTS idx_qr_codes_active_window
ON qr_codes (active_from, active_until)
WHERE active_from IS NOT NULL OR active_until IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN qr_codes.active_from IS 'QR code only works after this timestamp (Pro+ feature)';
COMMENT ON COLUMN qr_codes.active_until IS 'QR code stops working after this timestamp (Pro+ feature)';
