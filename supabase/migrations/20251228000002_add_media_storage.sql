-- Migration: Add storage bucket for QR media files
-- Date: 2025-12-28
-- Description: Creates qr-media bucket for PDF, images, video, and audio files

-- Create storage bucket for QR code media files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('qr-media', 'qr-media', true, 104857600)  -- 100MB limit for videos
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload media to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'qr-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own media
CREATE POLICY "Users can read own media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'qr-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access (media files are accessed via QR code landing pages)
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'qr-media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'qr-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own media
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'qr-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
