-- Add spotify and reddit to content_type constraint
ALTER TABLE qr_codes
DROP CONSTRAINT IF EXISTS qr_codes_content_type_check;

ALTER TABLE qr_codes
ADD CONSTRAINT qr_codes_content_type_check
CHECK (content_type IN (
  -- Basic types
  'url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms',
  -- Simple URL types (social)
  'whatsapp', 'facebook', 'instagram', 'linkedin', 'x', 'tiktok', 'snapchat', 'threads', 'youtube', 'pinterest', 'apps',
  -- New social types
  'spotify', 'reddit',
  -- Reviews
  'google-review',
  -- File upload types (Pro+)
  'pdf', 'images', 'video', 'mp3',
  -- Landing page types (Pro+)
  'menu', 'business', 'links', 'coupon', 'social'
));
