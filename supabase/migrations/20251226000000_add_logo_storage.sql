-- Create storage bucket for QR code logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-logos', 'qr-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload logos to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'qr-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own logos
CREATE POLICY "Users can read own logos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'qr-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access (logos are embedded in QR codes viewed publicly)
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'qr-logos');

-- Allow users to delete their own logos
CREATE POLICY "Users can delete own logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'qr-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own logos
CREATE POLICY "Users can update own logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'qr-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
