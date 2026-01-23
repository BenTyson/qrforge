-- Migration: Add Snapchat and Threads QR content types
-- Date: 2026-01-23
-- Description: Adds snapchat and threads as free tier social QR types

-- Drop and recreate the content_type CHECK constraint
ALTER TABLE qr_codes
DROP CONSTRAINT IF EXISTS qr_codes_content_type_check;

ALTER TABLE qr_codes
ADD CONSTRAINT qr_codes_content_type_check
CHECK (content_type IN (
  -- Basic types
  'url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms',
  -- Simple URL types
  'whatsapp', 'facebook', 'instagram', 'linkedin', 'x', 'tiktok', 'snapchat', 'threads', 'apps',
  -- Reviews (free tier)
  'google-review',
  -- File upload types (Pro+)
  'pdf', 'images', 'video', 'mp3',
  -- Landing page types (Pro+)
  'menu', 'business', 'links', 'coupon', 'social'
));

COMMENT ON CONSTRAINT qr_codes_content_type_check ON qr_codes IS 'Validates QR content type: basic (url,text,wifi,vcard,email,phone,sms), social (whatsapp,facebook,instagram,linkedin,x,tiktok,snapchat,threads,apps), reviews (google-review), media (pdf,images,video,mp3), landing (menu,business,links,coupon,social)';
