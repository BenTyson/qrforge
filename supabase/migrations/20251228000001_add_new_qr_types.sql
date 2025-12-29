-- Migration: Add new QR content types
-- Date: 2025-12-28
-- Description: Expands content_type to support 16 QR types (from 7)

-- Drop and recreate the content_type CHECK constraint
ALTER TABLE qr_codes
DROP CONSTRAINT IF EXISTS qr_codes_content_type_check;

ALTER TABLE qr_codes
ADD CONSTRAINT qr_codes_content_type_check
CHECK (content_type IN (
  -- Basic types (existing)
  'url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms',
  -- Simple URL types (new)
  'whatsapp', 'facebook', 'instagram', 'apps',
  -- File upload types (new, Pro+)
  'pdf', 'images', 'video', 'mp3',
  -- Landing page types (new, Pro+)
  'menu', 'business', 'links', 'coupon', 'social'
));

-- Add media_files column for file upload types (stores array of file metadata)
ALTER TABLE qr_codes
ADD COLUMN IF NOT EXISTS media_files JSONB DEFAULT '[]'::jsonb;

-- Add index for content_type queries
CREATE INDEX IF NOT EXISTS idx_qr_codes_content_type ON qr_codes(content_type);

-- Add comments for documentation
COMMENT ON COLUMN qr_codes.media_files IS 'Array of uploaded file metadata for pdf/images/video/mp3 types';
COMMENT ON CONSTRAINT qr_codes_content_type_check ON qr_codes IS 'Validates QR content type: basic (url,text,wifi,vcard,email,phone,sms), social (whatsapp,facebook,instagram,apps), media (pdf,images,video,mp3), landing (menu,business,links,coupon,social)';
