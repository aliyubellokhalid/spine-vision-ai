-- Spine Vision AI Database Schema
-- Copy this entire script into your Supabase SQL Editor

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scan_analyses table
CREATE TABLE IF NOT EXISTS scan_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    scan_date TIMESTAMP WITH TIME ZONE NOT NULL,
    examination_type VARCHAR(255) NOT NULL,
    clinical_info TEXT,
    findings JSONB NOT NULL,
    overall_assessment VARCHAR(100) NOT NULL,
    recommendations TEXT[] NOT NULL,
    ai_confidence DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES scan_analyses(id),
    feedback_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for scan files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('scan-files', 'scan-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_scan_analyses_patient_id ON scan_analyses(patient_id);
CREATE INDEX IF NOT EXISTS idx_scan_analyses_created_at ON scan_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_analysis_id ON feedback(analysis_id);

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security requirements)
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to patients" ON patients;
DROP POLICY IF EXISTS "Allow public insert access to patients" ON patients;
DROP POLICY IF EXISTS "Allow public update access to patients" ON patients;

DROP POLICY IF EXISTS "Allow public read access to scan_analyses" ON scan_analyses;
DROP POLICY IF EXISTS "Allow public insert access to scan_analyses" ON scan_analyses;
DROP POLICY IF EXISTS "Allow public update access to scan_analyses" ON scan_analyses;

DROP POLICY IF EXISTS "Allow public read access to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow public insert access to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow public update access to feedback" ON feedback;

DROP POLICY IF EXISTS "Allow public upload to scan-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public download from scan-files" ON storage.objects;

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

-- Create storage policies
CREATE POLICY "Allow public upload to scan-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'scan-files');
CREATE POLICY "Allow public download from scan-files" ON storage.objects FOR SELECT USING (bucket_id = 'scan-files');
