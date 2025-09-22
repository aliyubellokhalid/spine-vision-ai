import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Feedback = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    rating: "",
    accuracy: "",
    feedback: "",
    improvements: "",
  });

  const [hoveredRating, setHoveredRating] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rating || !formData.feedback) {
      toast({
        title: "Missing Information",
        description: "Please provide a rating and feedback before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Store feedback (in a real app, this would go to a backend)
    const feedback = {
      ...formData,
      submissionDate: new Date().toISOString(),
    };
    
    const existingFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));
    
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your valuable feedback! It helps us improve our AI analysis.",
    });

    // Navigate back to dashboard
    navigate('/');
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 transition-colors"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => handleInputChange('rating', star.toString())}
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hoveredRating || parseInt(formData.rating))
                  ? 'fill-medical-primary text-medical-primary'
                  : 'text-muted-foreground hover:text-medical-primary'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {formData.rating ? `${formData.rating}/5` : 'Rate your experience'}
        </span>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Feedback & Evaluation</h1>
          <p className="text-muted-foreground">Help us improve our AI analysis accuracy and user experience</p>
        </div>

        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-medical-primary" />
              Your Feedback
            </CardTitle>
            <CardDescription>
              Share your experience with the AI spine MRI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Overall Rating */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium">
                  Overall Experience Rating *
                </Label>
                {renderStarRating()}
              </div>

              {/* Analysis Accuracy */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  How accurate was the AI analysis?
                </Label>
                <Select onValueChange={(value) => handleInputChange('accuracy', value)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select accuracy assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very-accurate">Very Accurate - Matches clinical assessment</SelectItem>
                    <SelectItem value="mostly-accurate">Mostly Accurate - Minor discrepancies</SelectItem>
                    <SelectItem value="somewhat-accurate">Somewhat Accurate - Some significant differences</SelectItem>
                    <SelectItem value="inaccurate">Inaccurate - Major discrepancies</SelectItem>
                    <SelectItem value="unable-to-assess">Unable to assess</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* General Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-foreground font-medium">
                  General Feedback *
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Please share your thoughts about the AI analysis results, user interface, workflow, or any other aspects of the system..."
                  value={formData.feedback}
                  onChange={(e) => handleInputChange('feedback', e.target.value)}
                  className="bg-secondary border-border focus:ring-medical-primary min-h-[120px]"
                  required
                />
              </div>

              {/* Suggestions for Improvement */}
              <div className="space-y-2">
                <Label htmlFor="improvements" className="text-foreground font-medium">
                  Suggestions for Improvement
                </Label>
                <Textarea
                  id="improvements"
                  placeholder="What features would you like to see added or improved? Any specific suggestions for better accuracy or user experience?"
                  value={formData.improvements}
                  onChange={(e) => handleInputChange('improvements', e.target.value)}
                  className="bg-secondary border-border focus:ring-medical-primary min-h-[100px]"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-medical hover:opacity-90"
                  size="lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Submit Feedback
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Feedback Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="group hover:shadow-medical transition-all duration-300 cursor-pointer border-medical-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-3">
                <ThumbsUp className="w-8 h-8 text-medical-success" />
                <div>
                  <p className="font-medium text-foreground">Positive Experience</p>
                  <p className="text-sm text-muted-foreground">Quick positive feedback</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-medical transition-all duration-300 cursor-pointer border-medical-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-3">
                <ThumbsDown className="w-8 h-8 text-medical-warning" />
                <div>
                  <p className="font-medium text-foreground">Needs Improvement</p>
                  <p className="text-sm text-muted-foreground">Report issues or concerns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="border-medical-primary/20 bg-medical-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="font-medium text-foreground">Need Additional Support?</p>
              <p className="text-sm text-muted-foreground">
                For technical issues or detailed clinical discussions, please contact our medical AI support team.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Feedback;