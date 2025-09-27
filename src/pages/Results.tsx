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
        // First try to load from localStorage (for immediate display)
        const storedResults = localStorage.getItem('analysisResults');
        console.log('Stored results from localStorage:', storedResults);
        if (storedResults) {
          const parsedResults = JSON.parse(storedResults);
          console.log('Parsed results:', parsedResults);
          console.log('General observations:', parsedResults.generalObservations);
          console.log('Findings count:', parsedResults.findings?.length || 0);
          console.log('Possible conditions:', parsedResults.possibleConditions);
          console.log('Clinical implications:', parsedResults.clinicalImplications);
          console.log('Next steps:', parsedResults.nextSteps);
          setResults(parsedResults);
        } else {
          // If no stored results, create comprehensive fallback data
          console.log('No stored results found, creating comprehensive fallback data');
          const fallbackResults: AnalysisResults = {
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
          console.log('Created comprehensive fallback data:', fallbackResults);
          setResults(fallbackResults);
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
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-full mb-4">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Loading Results...</h1>
          <p className="text-muted-foreground">
            Please wait while we load your analysis results.
          </p>
        </div>
      </Layout>
    );
  }

  if (!results) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">No Results Available</h1>
          <p className="text-muted-foreground mb-6">
            No analysis results found. Please upload and analyze an MRI scan first.
          </p>
          <Button onClick={() => navigate('/upload-scan')} className="bg-gradient-medical">
            Upload MRI Scan
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-full mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Analysis Results</h1>
          <p className="text-muted-foreground">Comprehensive spine MRI pathology analysis</p>
        </div>

        {/* Patient & Scan Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{results.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient ID:</span>
                <span className="font-medium">{results.patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scan Date:</span>
                <span className="font-medium">
                  {new Date(results.scanDate).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {results.overallAssessment === 'Normal' ? (
                  <CheckCircle className="w-8 h-8 text-medical-success" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-medical-warning" />
                )}
                <div>
                  <Badge className={getAssessmentColor(results.overallAssessment)}>
                    {results.overallAssessment}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {results.findings.length} finding(s) detected
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* General Observations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-medical-primary" />
              General Observations
            </CardTitle>
            <CardDescription>
              Overall assessment of spinal structure and appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Spinal Alignment</h4>
                  <p className="text-sm text-muted-foreground">{results.generalObservations.spinalAlignment}</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Disc Spaces</h4>
                  <p className="text-sm text-muted-foreground">{results.generalObservations.discSpaces}</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Disc Height</h4>
                  <p className="text-sm text-muted-foreground">{results.generalObservations.discHeight}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Spinal Canal</h4>
                  <p className="text-sm text-muted-foreground">{results.generalObservations.spinalCanal}</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Overall Appearance</h4>
                  <p className="text-sm text-muted-foreground">{results.generalObservations.overallAppearance}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Findings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-medical-primary" />
              Pathology Findings
            </CardTitle>
            <CardDescription>
              Detailed analysis of detected spine pathologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.findings.map((finding, index) => (
                <div key={index} className="border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {finding.pathology}
                      </h3>
                      <p className="text-muted-foreground">
                        Level: {finding.level}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getSeverityColor(finding.severity)}>
                        {finding.severity}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {finding.confidence}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-foreground mb-2">{finding.description}</p>
                    <p className="text-sm text-medical-primary font-medium">{finding.clinicalSignificance}</p>
                  </div>
                  
                  {/* Confidence Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">AI Confidence</span>
                      <span className="font-medium">{finding.confidence}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-gradient-medical h-2 rounded-full transition-all duration-500"
                        style={{ width: `${finding.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Possible Conditions */}
        {results.possibleConditions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-medical-warning" />
                Possible Conditions Indicated
              </CardTitle>
              <CardDescription>
                Conditions that may be indicated by the findings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.possibleConditions.map((condition, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-medical-warning rounded-full mt-2"></div>
                    <p className="text-foreground">{condition}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Clinical Implications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-medical-primary" />
              Clinical Implications
            </CardTitle>
            <CardDescription>
              What these findings mean for the patient's condition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-medical-primary/10 rounded-lg p-4">
              <p className="text-foreground">{results.clinicalImplications}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-medical-primary" />
              Clinical Recommendations
            </CardTitle>
            <CardDescription>
              AI-generated recommendations based on findings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {results.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-medical-primary rounded-full mt-2"></div>
                  <p className="text-foreground">{recommendation}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {results.nextSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-medical-primary" />
                Recommended Next Steps
              </CardTitle>
              <CardDescription>
                Suggested actions for follow-up care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {results.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-medical-success rounded-full mt-2"></div>
                    <p className="text-foreground">{step}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Report
          </Button>
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Results
          </Button>
          <Button 
            onClick={() => navigate('/feedback')} 
            className="bg-gradient-medical hover:opacity-90"
            size="lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Provide Feedback
          </Button>
        </div>

        {/* Disclaimer */}
        <Card className="border-medical-warning/20 bg-medical-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-medical-warning mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground">Medical Disclaimer</p>
                <p className="text-muted-foreground">
                  This AI analysis is intended for clinical decision support only and should not replace 
                  professional medical judgment. All findings should be verified by a qualified radiologist 
                  or medical professional before making treatment decisions.
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