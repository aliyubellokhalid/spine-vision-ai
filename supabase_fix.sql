-- Quick fix for existing Supabase setup
-- This script only adds missing policies and handles conflicts

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to patients" ON patients;
DROP POLICY IF EXISTS "Allow public insert access to patients" ON patients;
DROP POLICY IF EXISTS "Allow public update access to patients" ON patients;

DROP POLICY IF EXISTS "Allow public read access to scan_analyses" ON scan_analyses;
DROP POLICY IF EXISTS "Allow public insert access to scan_analyses" ON scan_analyses;
DROP POLICY IF EXISTS "Allow public update access to scan_analyses" ON scan_analyses;

DROP POLICY IF EXISTS "Allow public read access to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow public insert access to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow public update access to feedback" ON feedback;

-- Create new policies
CREATE POLICY "Allow public read access to patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to patients" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to patients" ON patients FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to scan_analyses" ON scan_analyses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to scan_analyses" ON scan_analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to scan_analyses" ON scan_analyses FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to feedback" ON feedback FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to feedback" ON feedback FOR UPDATE USING (true);

-- Create storage policies for file uploads
CREATE POLICY "Allow public upload to scan-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'scan-files');
CREATE POLICY "Allow public download from scan-files" ON storage.objects FOR SELECT USING (bucket_id = 'scan-files');
