-- Add bulk_batch_id to group QR codes created via bulk upload
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS bulk_batch_id UUID DEFAULT NULL;

-- Add index for efficient grouping
CREATE INDEX IF NOT EXISTS idx_qr_codes_bulk_batch_id ON qr_codes(bulk_batch_id) WHERE bulk_batch_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN qr_codes.bulk_batch_id IS 'Groups QR codes created together via bulk upload';
