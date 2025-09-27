-- Create data-photos bucket for storing uploaded images
-- This should be run in Supabase SQL Editor

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'data-photos',
  'data-photos',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/dicom', 'application/dicom']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload to data-photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'data-photos' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to view files
CREATE POLICY "Allow authenticated users to view data-photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'data-photos' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update data-photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'data-photos' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete data-photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'data-photos' AND 
  auth.role() = 'authenticated'
);

-- Also allow public access for viewing (optional - remove if you want more security)
CREATE POLICY "Allow public access to view data-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'data-photos');
