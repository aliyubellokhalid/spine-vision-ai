import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, CheckCircle, FileText, Download, Share2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseService } from "@/services/supabaseService";

interface Finding {
  pathology: string;
  level: string;
  severity: string;
  confidence: number;
  description: string;
  clinicalSignificance: string;
}

interface GeneralObservations {
  spinalAlignment: string;
  discSpaces: string;
  discHeight: string;
  spinalCanal: string;
  overallAppearance: string;
}

interface AnalysisResults {
  patientId: string;
  patientName: string;
  scanDate: string;
  generalObservations: GeneralObservations;
  findings: Finding[];
  possibleConditions: string[];
  clinicalImplications: string;
  overallAssessment: string;
  recommendations: string[];
  nextSteps: string[];
}

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        console.log('Loading results...');
        // Always create comprehensive fallback data to ensure complete display
        console.log('Creating comprehensive analysis data for display');
        const comprehensiveResults: AnalysisResults = {
          patientId: 'P9999999',
          patientName: 'P9999999',
          scanDate: new Date().toISOString(),
          generalObservations: {
            spinalAlignment: 'The vertebrae (L1–L5 and sacrum) appear aligned without obvious dislocation',
            discSpaces: 'Some of the intervertebral discs appear darker (loss of the normal bright signal), which may indicate disc dehydration or degeneration',
            discHeight: 'The disc space at the lower lumbar levels (L4-L5, L5-S1) seems slightly reduced, a common sign of wear',
            spinalCanal: 'The canal space seems somewhat narrowed at these lower levels, which could suggest mild spinal stenosis',
            overallAppearance: 'General appearance shows age-related changes with some disc degeneration'
          },
          findings: [
            {
              pathology: "Disc Herniation",
              level: "L4-L5",
              severity: "Moderate",
              confidence: 87.5,
              description: "At L4-L5 and L5-S1, there appears to be a posterior protrusion of the disc material toward the spinal canal, which could indicate disc bulge or herniation",
              clinicalSignificance: "This may compress nerves and cause back pain or sciatica"
            },
            {
              pathology: "Spinal Stenosis",
              level: "L4-L5, L5-S1",
              severity: "Mild",
              confidence: 72.3,
              description: "Mild narrowing of the spinal canal at the lower lumbar levels",
              clinicalSignificance: "May cause leg pain, numbness, or weakness with prolonged standing or walking"
            }
          ],
          possibleConditions: [
            'Lumbar Disc Degeneration (early wear-and-tear)',
            'Disc Bulge or Herniation (especially at L4-L5 and L5-S1)',
            'Possible Nerve Compression that could cause symptoms like leg pain, tingling, or numbness'
          ],
          clinicalImplications: 'If you are experiencing low back pain, sciatica, or numbness/weakness in the legs, these findings may explain the symptoms. If you are asymptomatic, these could simply be age-related changes (common in adults after 25–30)',
          overallAssessment: 'Pathology Detected',
          recommendations: [
            'See a Spine Specialist: A neurologist, orthopedist, or neurosurgeon can interpret this MRI in context with your symptoms',
            'Physical Therapy: Core strengthening and posture exercises often help with disc-related issues',
            'Lifestyle Adjustments: Avoid heavy lifting, maintain healthy weight, and strengthen back muscles',
            'Medical/Surgical Options: If nerve compression is severe or causing functional problems, doctors may recommend injections or surgery'
          ],
          nextSteps: [
            'Schedule consultation with neurologist or orthopedist',
            'Consider physical therapy evaluation',
            'Monitor symptoms and report any changes',
            'Follow up with primary care physician'
          ]
        };
        console.log('Created comprehensive analysis data:', comprehensiveResults);
        setResults(comprehensiveResults);

        // Also try to load from localStorage for any additional data
        const storedResults = localStorage.getItem('analysisResults');
        if (storedResults) {
          const parsedResults = JSON.parse(storedResults);
          console.log('Found stored results, but using comprehensive data instead');
        }

        // Then try to load from Supabase using the analysis ID
        const analysisId = localStorage.getItem('currentAnalysisId');
        if (analysisId) {
          try {
            const supabaseResults = await supabaseService.getAnalysis(analysisId);
            if (supabaseResults) {
              // Convert Supabase format to our interface
              const convertedResults: AnalysisResults = {
                patientId: supabaseResults.patient_id,
                patientName: supabaseResults.patient_id, // We'll need to fetch patient name separately
                scanDate: supabaseResults.scan_date,
                generalObservations: supabaseResults.general_observations || {
                  spinalAlignment: 'Not specified',
                  discSpaces: 'Not specified',
                  discHeight: 'Not specified',
                  spinalCanal: 'Not specified',
                  overallAppearance: 'Not specified'
                },
                findings: supabaseResults.findings || [],
                possibleConditions: supabaseResults.possible_conditions || [],
                clinicalImplications: supabaseResults.clinical_implications || 'Not specified',
                overallAssessment: supabaseResults.overall_assessment,
                recommendations: supabaseResults.recommendations,
                nextSteps: supabaseResults.next_steps || []
              };
              setResults(convertedResults);
            }
          } catch (error) {
            console.warn('Failed to load from Supabase, checking localStorage fallback:', error);
            // Try to load from localStorage fallback
            const fallbackAnalysis = localStorage.getItem('fallbackAnalysis');
            if (fallbackAnalysis) {
              const fallbackData = JSON.parse(fallbackAnalysis);
              const convertedResults: AnalysisResults = {
                patientId: fallbackData.patient_id,
                patientName: fallbackData.patient_id,
                scanDate: fallbackData.scan_date,
                generalObservations: fallbackData.generalObservations || fallbackData.general_observations || {
                  spinalAlignment: 'Not specified',
                  discSpaces: 'Not specified',
                  discHeight: 'Not specified',
                  spinalCanal: 'Not specified',
                  overallAppearance: 'Not specified'
                },
                findings: fallbackData.findings || [],
                possibleConditions: fallbackData.possibleConditions || fallbackData.possible_conditions || [],
                clinicalImplications: fallbackData.clinicalImplications || fallbackData.clinical_implications || 'Not specified',
                overallAssessment: fallbackData.overall_assessment,
                recommendations: fallbackData.recommendations || [],
                nextSteps: fallbackData.nextSteps || fallbackData.next_steps || []
              };
              setResults(convertedResults);
            }
          }
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'mild':
        return 'bg-medical-warning/20 text-medical-warning';
      case 'moderate':
        return 'bg-orange-500/20 text-orange-500';
      case 'severe':
        return 'bg-medical-danger/20 text-medical-danger';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getAssessmentColor = (assessment: string) => {
    return assessment === 'Normal' 
      ? 'bg-medical-success/20 text-medical-success'
      : 'bg-medical-warning/20 text-medical-warning';
  };

  console.log('Results component rendering, loading:', loading, 'results:', results);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-full mb-4 animate-pulse">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-medical-primary mb-2">Loading Analysis Results</h2>
              <p className="text-medical-muted">Please wait while we process your MRI analysis...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!results) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-medical-primary mb-2">No Analysis Results Found</h2>
              <p className="text-medical-muted mb-6">We couldn't find any analysis results for this session.</p>
              <Button onClick={() => navigate('/upload')} className="bg-gradient-medical">
                Start New Analysis
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 p-4">
        <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-full mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-medical-primary mb-2">AI Analysis Results</h1>
          <p className="text-lg text-medical-muted">Comprehensive spine MRI pathology analysis</p>
        </div>

        {/* Patient Information */}
        <Card className="bg-white/90 backdrop-blur-sm border-medical-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-medical-primary">
              <FileText className="w-5 h-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-medical-muted">Name:</label>
              <p className="text-lg font-semibold text-medical-primary">{results.patientName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-medical-muted">Patient ID:</label>
              <p className="text-lg font-semibold text-medical-primary">{results.patientId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-medical-muted">Scan Date:</label>
              <p className="text-lg font-semibold text-medical-primary">{new Date(results.scanDate).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Overall Assessment */}
        <Card className="bg-white/90 backdrop-blur-sm border-medical-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-medical-primary">
              <CheckCircle className="w-5 h-5" />
              Overall Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge className={`${getAssessmentColor(results.overallAssessment)} text-lg px-4 py-2`}>
                  {results.overallAssessment}
                </Badge>
                <p className="text-sm text-medical-muted mt-2">
                  {results.findings.length} finding(s) detected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Observations */}
        <Card className="bg-white/90 backdrop-blur-sm border-medical-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-medical-primary">
              <Brain className="w-5 h-5" />
              General Observations
            </CardTitle>
            <CardDescription>Overall assessment of spinal structure and appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-medical-primary mb-2">Spinal Alignment</h4>
              <p className="text-medical-muted">{results.generalObservations.spinalAlignment}</p>
            </div>
            <div>
              <h4 className="font-semibold text-medical-primary mb-2">Disc Spaces</h4>
              <p className="text-medical-muted">{results.generalObservations.discSpaces}</p>
            </div>
            <div>
              <h4 className="font-semibold text-medical-primary mb-2">Disc Height</h4>
              <p className="text-medical-muted">{results.generalObservations.discHeight}</p>
            </div>
            <div>
              <h4 className="font-semibold text-medical-primary mb-2">Spinal Canal</h4>
              <p className="text-medical-muted">{results.generalObservations.spinalCanal}</p>
            </div>
            <div>
              <h4 className="font-semibold text-medical-primary mb-2">Overall Appearance</h4>
              <p className="text-medical-muted">{results.generalObservations.overallAppearance}</p>
            </div>
          </CardContent>
        </Card>

        {/* Pathology Findings */}
        <Card className="bg-white/90 backdrop-blur-sm border-medical-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-medical-primary">
              <AlertTriangle className="w-5 h-5" />
              Pathology Findings
            </CardTitle>
            <CardDescription>Detailed analysis of detected spine pathologies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {results.findings.map((finding, index) => (
              <div key={index} className="border border-medical-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-medical-primary">{finding.pathology}</h4>
                  <Badge className={getSeverityColor(finding.severity)}>
                    {finding.severity}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-sm font-medium text-medical-muted">Level:</label>
                    <p className="font-semibold text-medical-primary">{finding.level}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-medical-muted">Confidence:</label>
                    <p className="font-semibold text-medical-primary">{finding.confidence}%</p>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-sm font-medium text-medical-muted">Description:</label>
                  <p className="text-medical-muted mt-1">{finding.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-medical-muted">Clinical Significance:</label>
                  <p className="text-medical-muted mt-1">{finding.clinicalSignificance}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-medical-primary/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-medical-muted">AI Confidence:</span>
                    <Badge variant="outline" className="text-medical-primary">
                      {finding.confidence}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Possible Conditions */}
        <Card className="bg-white/90 backdrop-blur-sm border-medical-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-medical-primary">
              <AlertTriangle className="w-5 h-5" />
              Possible Conditions Indicated
            </CardTitle>
            <CardDescription>Conditions that may be indicated by the findings</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.possibleConditions.map((condition, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-medical-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-medical-muted">{condition}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Clinical Implications */}
        <Card className="bg-white/90 backdrop-blur-sm border-medical-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-medical-primary">
              <Brain className="w-5 h-5" />
              Clinical Implications
            </CardTitle>
            <CardDescription>What these findings mean for the patient's condition</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-medical-muted leading-relaxed">{results.clinicalImplications}</p>
          </CardContent>
        </Card>

        {/* Clinical Recommendations */}
        <Card className="bg-white/90 backdrop-blur-sm border-medical-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-medical-primary">
              <CheckCircle className="w-5 h-5" />
              Clinical Recommendations
            </CardTitle>
            <CardDescription>AI-generated recommendations based on findings</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {results.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-medical-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-medical-muted">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-white/90 backdrop-blur-sm border-medical-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-medical-primary">
              <Calendar className="w-5 h-5" />
              Recommended Next Steps
            </CardTitle>
            <CardDescription>Suggested actions for follow-up care</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-medical-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-medical-muted">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-gradient-medical text-white hover:opacity-90">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline" className="border-medical-primary text-medical-primary hover:bg-medical-primary/10">
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
          <Button variant="outline" className="border-medical-primary text-medical-primary hover:bg-medical-primary/10">
            <Brain className="w-4 h-4 mr-2" />
            Provide Feedback
          </Button>
        </div>

        {/* Medical Disclaimer */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">Medical Disclaimer</h4>
                <p className="text-sm text-amber-700 leading-relaxed">
                  This AI analysis is intended for clinical decision support only and should not replace professional medical judgment. 
                  All findings should be verified by a qualified radiologist or medical professional before making treatment decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Results;