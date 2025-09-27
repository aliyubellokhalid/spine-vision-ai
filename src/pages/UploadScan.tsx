import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileImage, Brain, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { openaiService, testOpenAIConnection } from "@/services/openaiService";
import { supabaseService } from "@/services/supabaseService";

const UploadScan = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    examination: "",
    clinicalInfo: "",
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Get current patient data
  const currentPatient = JSON.parse(localStorage.getItem('currentPatient') || '{}');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/dicom', 'application/dicom'];
    if (!validTypes.some(type => file.type.includes(type.split('/')[1]) || file.name.toLowerCase().includes('dcm'))) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid MRI scan file (JPEG, PNG, or DICOM format).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    toast({
      title: "File Selected",
      description: `${file.name} is ready for analysis.`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const performAIAnalysis = async () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload an MRI scan before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Test OpenAI connection first
      console.log('Testing OpenAI API connection...');
      const apiWorking = await testOpenAIConnection();
      console.log('OpenAI API working:', apiWorking);
      
      // Upload file to Supabase bucket first
      console.log('Uploading file to data-photos bucket...');
      let uploadedFilePath;
      try {
        uploadedFilePath = await supabaseService.uploadDataPhoto(
          uploadedFile, 
          currentPatient.patientId || currentPatient.patient_id || 'unknown'
        );
        console.log('File uploaded to bucket:', uploadedFilePath);
      } catch (uploadError) {
        console.warn('Bucket upload failed, continuing with analysis:', uploadError);
        // Continue with analysis even if upload fails
      }

      // Perform real OpenAI analysis
      console.log('Starting OpenAI analysis with file:', uploadedFile.name, 'size:', uploadedFile.size);
      console.log('Clinical info:', formData.clinicalInfo);
      
      const analysisResults = await openaiService.analyzeSpineMRI(
        uploadedFile, 
        formData.clinicalInfo
      );
      
      console.log('Analysis results received:', analysisResults);

      // Calculate average confidence
      const avgConfidence = analysisResults.findings.length > 0 
        ? analysisResults.findings.reduce((sum, finding) => sum + finding.confidence, 0) / analysisResults.findings.length
        : 0;

      // Try to save to Supabase, with fallback to localStorage
      let savedAnalysis;
      try {
        savedAnalysis = await supabaseService.saveAnalysis({
          patient_id: analysisResults.patientId,
          scan_date: analysisResults.scanDate,
          examination_type: formData.examination || 'Spine MRI',
          clinical_info: formData.clinicalInfo || null,
          general_observations: analysisResults.generalObservations,
          findings: analysisResults.findings,
          possible_conditions: analysisResults.possibleConditions,
          clinical_implications: analysisResults.clinicalImplications,
          overall_assessment: analysisResults.overallAssessment,
          recommendations: analysisResults.recommendations,
          next_steps: analysisResults.nextSteps,
          ai_confidence: avgConfidence
        });
        console.log('Analysis saved to Supabase successfully');
      } catch (supabaseError) {
        console.warn('Supabase save failed, using localStorage fallback:', supabaseError);
        // Create a fallback analysis object
        savedAnalysis = {
          id: crypto.randomUUID(),
          patient_id: analysisResults.patientId,
          scan_date: analysisResults.scanDate,
          examination_type: formData.examination || 'Spine MRI',
          clinical_info: formData.clinicalInfo || null,
          general_observations: analysisResults.generalObservations,
          findings: analysisResults.findings,
          possible_conditions: analysisResults.possibleConditions,
          clinical_implications: analysisResults.clinicalImplications,
          overall_assessment: analysisResults.overallAssessment,
          recommendations: analysisResults.recommendations,
          next_steps: analysisResults.nextSteps,
          ai_confidence: avgConfidence,
          analysis_version: '2.0',
          created_at: new Date().toISOString()
        };
        // Store in localStorage as fallback
        localStorage.setItem('fallbackAnalysis', JSON.stringify(savedAnalysis));
      }

      // Store results locally for immediate display
      console.log('Storing analysis results in localStorage:', analysisResults);
      localStorage.setItem('analysisResults', JSON.stringify(analysisResults));
      localStorage.setItem('currentAnalysisId', savedAnalysis.id);
      console.log('Analysis results stored successfully');

      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "AI analysis completed successfully. Redirecting to results...",
      });
      
      // Navigate to results page
      setTimeout(() => navigate('/results'), 1000);

    } catch (error) {
      setIsAnalyzing(false);
      console.error('Analysis error:', error);
      
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze the MRI scan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload an MRI scan before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (!currentPatient.patientName) {
      toast({
        title: "No Patient Information",
        description: "Please add patient information first.",
        variant: "destructive",
      });
      navigate('/add-patient');
      return;
    }

    await performAIAnalysis();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-full mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload MRI Scan</h1>
          <p className="text-muted-foreground">Upload spine MRI scan for AI-powered pathology analysis</p>
        </div>

        {/* Patient Info Summary */}
        {currentPatient.patientName && (
          <Card className="border-medical-primary/20 bg-medical-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-medical-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    Patient: {currentPatient.patientName} (ID: {currentPatient.patientId})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Age: {currentPatient.age} | Gender: {currentPatient.gender || 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Examination Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-medical-primary" />
                Examination Details
              </CardTitle>
              <CardDescription>
                Provide examination and clinical information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="examination" className="text-foreground">
                  Examination Type
                </Label>
                <Input
                  id="examination"
                  placeholder="e.g., Lumbar Spine MRI"
                  value={formData.examination}
                  onChange={(e) => handleInputChange('examination', e.target.value)}
                  className="bg-secondary border-border focus:ring-medical-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalInfo" className="text-foreground">
                  Clinical Information
                </Label>
                <Textarea
                  id="clinicalInfo"
                  placeholder="Enter symptoms, clinical history, or specific concerns..."
                  value={formData.clinicalInfo}
                  onChange={(e) => handleInputChange('clinicalInfo', e.target.value)}
                  className="bg-secondary border-border focus:ring-medical-primary min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-medical-primary" />
                MRI Scan Upload
              </CardTitle>
              <CardDescription>
                Upload spine MRI scan for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragOver
                    ? 'border-medical-primary bg-medical-primary/10'
                    : uploadedFile
                    ? 'border-medical-success bg-medical-success/10'
                    : 'border-border hover:border-medical-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.dcm,.dicom"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                {uploadedFile ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-12 h-12 text-medical-success mx-auto" />
                    <div>
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="font-medium text-foreground">
                        Drag and drop your MRI scan here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-medical-warning mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">Supported Formats:</p>
                    <p className="text-muted-foreground">
                      JPEG, PNG, DICOM (.dcm) - Max file size: 50MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analyze Button */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-medical hover:opacity-90"
                  size="lg"
                  disabled={!uploadedFile || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing Scan...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Start AI Analysis
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  size="lg"
                  disabled={isAnalyzing}
                >
                  Cancel
                </Button>
              </div>
            </form>

            {isAnalyzing && (
              <div className="mt-6 p-4 bg-medical-primary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-medical-primary rounded-full animate-pulse"></div>
                  <p className="text-sm text-foreground">
                    AI is analyzing the spine MRI scan for pathologies...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UploadScan;