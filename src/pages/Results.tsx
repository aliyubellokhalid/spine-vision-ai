import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, CheckCircle, FileText, Download, Share2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Finding {
  pathology: string;
  level: string;
  severity: string;
  confidence: number;
  description: string;
}

interface AnalysisResults {
  patientId: string;
  patientName: string;
  scanDate: string;
  findings: Finding[];
  overallAssessment: string;
  recommendations: string[];
}

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<AnalysisResults | null>(null);

  useEffect(() => {
    const storedResults = localStorage.getItem('analysisResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
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
                  
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-sm text-foreground">{finding.description}</p>
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