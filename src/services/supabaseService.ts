import { supabase } from '@/integrations/supabase/client';

export interface Patient {
  id?: string;
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  created_at?: string;
}

export interface ScanAnalysis {
  id?: string;
  patient_id: string;
  scan_date: string;
  examination_type: string;
  clinical_info?: string;
  general_observations: any;
  findings: any[];
  possible_conditions: string[];
  clinical_implications: string;
  overall_assessment: string;
  recommendations: string[];
  next_steps: string[];
  ai_confidence: number;
  analysis_version?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Feedback {
  id?: string;
  analysis_id: string;
  feedback_text: string;
  rating: number;
  created_at?: string;
}

export class SupabaseService {
  // Patient Management
  async createPatient(patient: Omit<Patient, 'id' | 'created_at'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert([patient])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create patient: ${error.message}`);
    }

    return data;
  }

  async getPatient(patientId: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Patient not found
      }
      throw new Error(`Failed to get patient: ${error.message}`);
    }

    return data;
  }

  async updatePatient(patientId: string, updates: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('patient_id', patientId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update patient: ${error.message}`);
    }

    return data;
  }

  // Scan Analysis Management
  async saveAnalysis(analysis: Omit<ScanAnalysis, 'id' | 'created_at' | 'updated_at'>): Promise<ScanAnalysis> {
    const { data, error } = await supabase
      .from('scan_analyses')
      .insert([{
        ...analysis,
        analysis_version: '2.0'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save analysis: ${error.message}`);
    }

    return data;
  }

  async getAnalysis(analysisId: string): Promise<ScanAnalysis | null> {
    const { data, error } = await supabase
      .from('scan_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Analysis not found
      }
      throw new Error(`Failed to get analysis: ${error.message}`);
    }

    return data;
  }

  async getPatientAnalyses(patientId: string): Promise<ScanAnalysis[]> {
    const { data, error } = await supabase
      .from('scan_analyses')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get patient analyses: ${error.message}`);
    }

    return data || [];
  }

  async getAllAnalyses(): Promise<ScanAnalysis[]> {
    const { data, error } = await supabase
      .from('scan_analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get analyses: ${error.message}`);
    }

    return data || [];
  }

  // Feedback Management
  async saveFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedback])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save feedback: ${error.message}`);
    }

    return data;
  }

  async getAnalysisFeedback(analysisId: string): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get feedback: ${error.message}`);
    }

    return data || [];
  }

  // File Storage
  async uploadScanFile(file: File, patientId: string): Promise<string> {
    const fileName = `${patientId}_${Date.now()}_${file.name}`;
    const filePath = `scans/${fileName}`;

    const { data, error } = await supabase.storage
      .from('scan-files')
      .upload(filePath, file);

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return data.path;
  }

  async getScanFileUrl(filePath: string): Promise<string> {
    const { data } = supabase.storage
      .from('scan-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Statistics and Analytics
  async getAnalysisStats(): Promise<{
    totalAnalyses: number;
    totalPatients: number;
    pathologyCounts: Record<string, number>;
    averageConfidence: number;
  }> {
    const [analyses, patients] = await Promise.all([
      this.getAllAnalyses(),
      supabase.from('patients').select('id')
    ]);

    const totalAnalyses = analyses.length;
    const totalPatients = patients.data?.length || 0;
    
    // Calculate pathology counts
    const pathologyCounts: Record<string, number> = {};
    let totalConfidence = 0;
    let confidenceCount = 0;

    analyses.forEach(analysis => {
      analysis.findings.forEach((finding: any) => {
        const pathology = finding.pathology;
        pathologyCounts[pathology] = (pathologyCounts[pathology] || 0) + 1;
        
        if (finding.confidence) {
          totalConfidence += finding.confidence;
          confidenceCount++;
        }
      });
    });

    const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

    return {
      totalAnalyses,
      totalPatients,
      pathologyCounts,
      averageConfidence
    };
  }
}

export const supabaseService = new SupabaseService();
