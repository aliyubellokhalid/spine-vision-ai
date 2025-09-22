import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Users, Upload, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const stats = [
    { label: "Scans Analyzed", value: "2,847", icon: Brain, change: "+12%" },
    { label: "Patients", value: "1,234", icon: Users, change: "+8%" },
    { label: "Active Cases", value: "156", icon: Upload, change: "+15%" },
    { label: "Accuracy Rate", value: "98.5%", icon: TrendingUp, change: "+0.3%" },
  ];

  const recentResults = [
    { id: "MRI-001", patient: "John Smith", status: "Disc Herniation", severity: "Moderate", time: "2 min ago" },
    { id: "MRI-002", patient: "Sarah Johnson", status: "Normal", severity: "None", time: "5 min ago" },
    { id: "MRI-003", patient: "Mike Davis", status: "Spinal Stenosis", severity: "Mild", time: "8 min ago" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-medical rounded-full mb-6 animate-pulse-glow">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI-Powered Spine MRI Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Advanced artificial intelligence for rapid and accurate spine pathology detection. 
            Identify disc herniation, spinal stenosis, cord compression, and tumors instantly.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-medical hover:opacity-90">
              <Link to="/add-patient">Start Analysis</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/results">View Results</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-medical-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-medical-success">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-medical transition-all duration-300 cursor-pointer">
            <Link to="/add-patient">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-medical-primary/10 rounded-lg flex items-center justify-center group-hover:bg-medical-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-medical-primary" />
                </div>
                <CardTitle className="text-lg">Add Patient</CardTitle>
                <CardDescription>Register new patient information</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="group hover:shadow-medical transition-all duration-300 cursor-pointer">
            <Link to="/upload-scan">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-medical-primary/10 rounded-lg flex items-center justify-center group-hover:bg-medical-primary/20 transition-colors">
                  <Upload className="w-6 h-6 text-medical-primary" />
                </div>
                <CardTitle className="text-lg">Upload MRI</CardTitle>
                <CardDescription>Upload spine MRI scans for analysis</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="group hover:shadow-medical transition-all duration-300 cursor-pointer">
            <Link to="/results">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-medical-primary/10 rounded-lg flex items-center justify-center group-hover:bg-medical-primary/20 transition-colors">
                  <Brain className="w-6 h-6 text-medical-primary" />
                </div>
                <CardTitle className="text-lg">View Results</CardTitle>
                <CardDescription>Review AI analysis results</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="group hover:shadow-medical transition-all duration-300 cursor-pointer">
            <Link to="/feedback">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-medical-primary/10 rounded-lg flex items-center justify-center group-hover:bg-medical-primary/20 transition-colors">
                  <CheckCircle className="w-6 h-6 text-medical-primary" />
                </div>
                <CardTitle className="text-lg">Feedback</CardTitle>
                <CardDescription>Submit analysis feedback</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-medical-primary" />
              Recent Analysis Results
            </CardTitle>
            <CardDescription>Latest spine MRI analysis outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-medical-primary rounded-full"></div>
                    <div>
                      <p className="font-medium text-foreground">{result.id} - {result.patient}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.status} {result.severity !== "None" && `(${result.severity})`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{result.time}</p>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs ${
                      result.status === "Normal" 
                        ? "bg-medical-success/20 text-medical-success"
                        : "bg-medical-warning/20 text-medical-warning"
                    }`}>
                      {result.status === "Normal" ? "Normal" : "Pathology Detected"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;