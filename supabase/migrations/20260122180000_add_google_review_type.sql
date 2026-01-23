-- Migration: Add google-review QR content type
-- Date: 2026-01-22
-- Description: Adds google-review as a free tier QR type for collecting Google reviews

-- Drop and recreate the content_type CHECK constraint to include google-review
ALTER TABLE qr_codes
DROP CONSTRAINT IF EXISTS qr_codes_content_type_check;

ALTER TABLE qr_codes
ADD CONSTRAINT qr_codes_content_type_check
CHECK (content_type IN (
  -- Basic types
  'url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms',
  -- Simple URL types
  'whatsapp', 'facebook', 'instagram', 'apps',
  -- Reviews (free tier)
  'google-review',
  -- File upload types (Pro+)
  'pdf', 'images', 'video', 'mp3',
  -- Landing page types (Pro+)
  'menu', 'business', 'links', 'coupon', 'social'
));

-- Update constraint comment
COMMENT ON CONSTRAINT qr_codes_content_type_check ON qr_codes IS 'Validates QR content type: basic (url,text,wifi,vcard,email,phone,sms), social (whatsapp,facebook,instagram,apps), reviews (google-review), media (pdf,images,video,mp3), landing (menu,business,links,coupon,social)';
