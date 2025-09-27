-- Updated Supabase Schema for Comprehensive Spine Analysis
-- This script updates the existing tables to support the new analysis structure

-- First, let's drop the existing scan_analyses table and recreate it with the new structure
DROP TABLE IF EXISTS scan_analyses CASCADE;

-- Recreate scan_analyses table with comprehensive structure
CREATE TABLE scan_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    scan_date TIMESTAMP WITH TIME ZONE NOT NULL,
    examination_type VARCHAR(255) NOT NULL,
    clinical_info TEXT,
    
    -- General Observations
    general_observations JSONB NOT NULL DEFAULT '{}',
    
    -- Pathology Findings
    findings JSONB NOT NULL DEFAULT '[]',
    
    -- Additional Analysis Fields
    possible_conditions TEXT[] DEFAULT '{}',
    clinical_implications TEXT,
    overall_assessment VARCHAR(100) NOT NULL,
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    next_steps TEXT[] DEFAULT '{}',
    
    -- AI Analysis Metadata
    ai_confidence DECIMAL(5,2) NOT NULL,
    analysis_version VARCHAR(20) DEFAULT '2.0',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scan_analyses_patient_id ON scan_analyses(patient_id);
CREATE INDEX IF NOT EXISTS idx_scan_analyses_created_at ON scan_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_scan_analyses_assessment ON scan_analyses(overall_assessment);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_scan_analyses_updated_at 
    BEFORE UPDATE ON scan_analyses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update the feedback table to reference the new structure
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_analysis_id_fkey;
ALTER TABLE feedback ADD CONSTRAINT feedback_analysis_id_fkey 
    FOREIGN KEY (analysis_id) REFERENCES scan_analyses(id) ON DELETE CASCADE;

-- Recreate policies for the updated table
DROP POLICY IF EXISTS "Allow public read access to scan_analyses" ON scan_analyses;
DROP POLICY IF EXISTS "Allow public insert access to scan_analyses" ON scan_analyses;
DROP POLICY IF EXISTS "Allow public update access to scan_analyses" ON scan_analyses;

CREATE POLICY "Allow public read access to scan_analyses" ON scan_analyses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to scan_analyses" ON scan_analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to scan_analyses" ON scan_analyses FOR UPDATE USING (true);

-- Create a view for easy querying of analysis results
CREATE OR REPLACE VIEW analysis_summary AS
SELECT 
    sa.id,
    sa.patient_id,
    p.patient_name,
    sa.scan_date,
    sa.examination_type,
    sa.overall_assessment,
    sa.ai_confidence,
    sa.created_at,
    jsonb_array_length(sa.findings) as findings_count,
    array_length(sa.possible_conditions, 1) as conditions_count
FROM scan_analyses sa
JOIN patients p ON sa.patient_id = p.patient_id;

-- Grant permissions on the view
GRANT SELECT ON analysis_summary TO anon, authenticated;

-- Create a function to get comprehensive analysis by ID
CREATE OR REPLACE FUNCTION get_comprehensive_analysis(analysis_uuid UUID)
RETURNS TABLE (
    id UUID,
    patient_id VARCHAR,
    patient_name VARCHAR,
    scan_date TIMESTAMP WITH TIME ZONE,
    examination_type VARCHAR,
    clinical_info TEXT,
    general_observations JSONB,
    findings JSONB,
    possible_conditions TEXT[],
    clinical_implications TEXT,
    overall_assessment VARCHAR,
    recommendations TEXT[],
    next_steps TEXT[],
    ai_confidence DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.id,
        sa.patient_id,
        p.patient_name,
        sa.scan_date,
        sa.examination_type,
        sa.clinical_info,
        sa.general_observations,
        sa.findings,
        sa.possible_conditions,
        sa.clinical_implications,
        sa.overall_assessment,
        sa.recommendations,
        sa.next_steps,
        sa.ai_confidence,
        sa.created_at
    FROM scan_analyses sa
    JOIN patients p ON sa.patient_id = p.patient_id
    WHERE sa.id = analysis_uuid;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_comprehensive_analysis(UUID) TO anon, authenticated;
