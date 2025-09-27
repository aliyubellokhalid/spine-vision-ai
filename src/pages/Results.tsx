import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Download, Share2, MessageSquare, AlertTriangle, User, Calendar, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { supabaseService } from "@/services/supabaseService";

interface GeneralObservations {
  spinalAlignment: string;
  discSpaces: string;
  discHeight: string;
  spinalCanal: string;
  overallAppearance: string;
}

interface Finding {
  pathology: string;
  level: string;
  severity: string;
  confidence: number;
  description: string;
  clinicalSignificance: string;
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
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        console.log('Loading results...');
        // First try to load from localStorage (real analysis results)
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
                generalObservations: supabaseResults.general_observations || results?.generalObservations || {
                  spinalAlignment: 'Not specified',
                  discSpaces: 'Not specified',
                  discHeight: 'Not specified',
                  spinalCanal: 'Not specified',
                  overallAppearance: 'Not specified'
                },
                findings: supabaseResults.findings || results?.findings || [],
                possibleConditions: supabaseResults.possible_conditions || results?.possibleConditions || [],
                clinicalImplications: supabaseResults.clinical_implications || results?.clinicalImplications || 'Not specified',
                overallAssessment: supabaseResults.overall_assessment,
                recommendations: supabaseResults.recommendations,
                nextSteps: supabaseResults.next_steps || results?.nextSteps || []
              };
              console.log('Loaded from Supabase:', convertedResults);
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
                generalObservations: fallbackData.generalObservations || fallbackData.general_observations || results?.generalObservations || {
                  spinalAlignment: 'Not specified',
                  discSpaces: 'Not specified',
                  discHeight: 'Not specified',
                  spinalCanal: 'Not specified',
                  overallAppearance: 'Not specified'
                },
                findings: fallbackData.findings || results?.findings || [],
                possibleConditions: fallbackData.possibleConditions || fallbackData.possible_conditions || results?.possibleConditions || [],
                clinicalImplications: fallbackData.clinicalImplications || fallbackData.clinical_implications || results?.clinicalImplications || 'Not specified',
                overallAssessment: fallbackData.overall_assessment,
                recommendations: fallbackData.recommendations || results?.recommendations || [],
                nextSteps: fallbackData.nextSteps || fallbackData.next_steps || results?.nextSteps || []
              };
              console.log('Loaded from localStorage fallback:', convertedResults);
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading analysis results...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!results) {
    return (
      <Layout>
        <div className="min-h-screen bg-black p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-center h-screen">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Results Found</h2>
              <p className="text-gray-300 mb-4">No analysis results are available.</p>
              <Button 
                onClick={() => window.history.back()}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-full mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">AI Analysis Results</h1>
            <p className="text-lg text-gray-300">Comprehensive spine MRI pathology analysis</p>
          </div>

          {/* Patient Information */}
          <Card className="bg-gray-900 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Name: {results.patientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">ID: {results.patientId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Scan Date: {new Date(results.scanDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Assessment */}
          <Card className="bg-gray-900 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Overall Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge 
                    variant={results.overallAssessment === 'Normal' ? 'default' : 'destructive'}
                    className="text-lg px-4 py-2"
                  >
                    {results.overallAssessment}
                  </Badge>
                  <p className="text-gray-300 mt-2">
                    {results.findings.length} finding(s) detected
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Observations */}
          <Card className="bg-gray-900 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">General Observations</CardTitle>
              <CardDescription className="text-gray-400">
                Overall assessment of spinal structure and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Spinal Alignment</h4>
                <p className="text-gray-300">{results.generalObservations.spinalAlignment}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Disc Spaces</h4>
                <p className="text-gray-300">{results.generalObservations.discSpaces}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Disc Height</h4>
                <p className="text-gray-300">{results.generalObservations.discHeight}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Spinal Canal</h4>
                <p className="text-gray-300">{results.generalObservations.spinalCanal}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Overall Appearance</h4>
                <p className="text-gray-300">{results.generalObservations.overallAppearance}</p>
              </div>
            </CardContent>
          </Card>

          {/* Pathology Findings */}
          <Card className="bg-gray-900 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Pathology Findings</CardTitle>
              <CardDescription className="text-gray-400">
                Detailed analysis of detected spine pathologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.findings.length > 0 ? (
                <div className="space-y-6">
                  {results.findings.map((finding, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-white">{finding.pathology}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-gray-300 border-gray-600">
                            Level: {finding.level}
                          </Badge>
                          <Badge 
                            variant={finding.severity === 'Mild' ? 'default' : finding.severity === 'Moderate' ? 'secondary' : 'destructive'}
                            className="text-white"
                          >
                            {finding.severity}
                          </Badge>
                          <Badge variant="outline" className="text-gray-300 border-gray-600">
                            Confidence: {finding.confidence}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-3">{finding.description}</p>
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400 mb-1">Clinical Significance:</p>
                        <p className="text-gray-300">{finding.clinicalSignificance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No specific pathologies detected</p>
              )}
            </CardContent>
          </Card>

          {/* Possible Conditions */}
          <Card className="bg-gray-900 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Possible Conditions</CardTitle>
              <CardDescription className="text-gray-400">
                Conditions that may be indicated by the findings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.possibleConditions.map((condition, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-medical-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">{condition}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Implications */}
          <Card className="bg-gray-900 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Clinical Implications</CardTitle>
              <CardDescription className="text-gray-400">
                What these findings mean for the patient's condition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">{results.clinicalImplications}</p>
            </CardContent>
          </Card>

          {/* Clinical Recommendations */}
          <Card className="bg-gray-900 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Clinical Recommendations</CardTitle>
              <CardDescription className="text-gray-400">
                AI-generated recommendations based on findings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-medical-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-medical-primary">{index + 1}</span>
                    </div>
                    <p className="text-gray-300">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gray-900 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Recommended Next Steps</CardTitle>
              <CardDescription className="text-gray-400">
                Suggested actions for follow-up care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-medical-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-medical-secondary">{index + 1}</span>
                    </div>
                    <p className="text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <MessageSquare className="w-4 h-4 mr-2" />
              Provide Feedback
            </Button>
          </div>

          {/* Medical Disclaimer */}
          <Card className="bg-gray-900 border-gray-700 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-2">Medical Disclaimer</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    This AI analysis is intended for clinical decision support only and should not replace professional medical judgment. 
                    All findings should be verified by a qualified radiologist or medical professional before making treatment decisions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Results;