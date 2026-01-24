-- Add 'youtube' to the qr_codes content_type check constraint
-- This allows storing YouTube video QR codes in the database

-- Drop the existing constraint
ALTER TABLE qr_codes DROP CONSTRAINT IF EXISTS qr_codes_content_type_check;

-- Add the updated constraint with 'youtube' included
ALTER TABLE qr_codes ADD CONSTRAINT qr_codes_content_type_check CHECK (
  content_type IN (
    -- Basic types
    'url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms',
    -- Simple URL types (social media)
    'whatsapp', 'facebook', 'instagram', 'linkedin', 'x', 'tiktok', 'snapchat', 'threads', 'youtube', 'apps',
    -- Reviews
    'google-review',
    -- File upload types (Pro+)
    'pdf', 'images', 'video', 'mp3',
    -- Landing page types (Pro+)
    'menu', 'business', 'links', 'coupon', 'social'
  )
);
