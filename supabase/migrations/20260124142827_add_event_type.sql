-- Add 'event' content type for Event/Calendar QR codes

ALTER TABLE qr_codes
DROP CONSTRAINT IF EXISTS qr_codes_content_type_check;

ALTER TABLE qr_codes
ADD CONSTRAINT qr_codes_content_type_check
CHECK (content_type IN (
  'url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms',
  'whatsapp', 'facebook', 'instagram', 'linkedin', 'x', 'tiktok',
  'snapchat', 'threads', 'youtube', 'pinterest', 'spotify', 'reddit',
  'twitch', 'discord', 'apps',
  'google-review',
  'pdf', 'images', 'video', 'mp3',
  'menu', 'business', 'links', 'coupon', 'social',
  'event'
));
