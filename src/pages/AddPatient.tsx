import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, Phone, User, Building2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabaseService } from "@/services/supabaseService";

const AddPatient = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    gender: "",
    age: "",
    phoneNumber: "",
    doctorName: "",
    treatmentDate: "",
    department: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.patientName || !formData.patientId || !formData.age) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, ID, Age).",
        variant: "destructive",
      });
      return;
    }

    try {
      // Try to save patient to Supabase first
      try {
        await supabaseService.createPatient({
          patient_id: formData.patientId,
          patient_name: formData.patientName,
          age: parseInt(formData.age),
          gender: formData.gender || 'Not specified'
        });
        console.log('Patient saved to Supabase successfully');
      } catch (supabaseError) {
        console.warn('Supabase save failed, using localStorage fallback:', supabaseError);
        // Continue with localStorage fallback
      }

      // Always store patient data locally for immediate use
      localStorage.setItem('currentPatient', JSON.stringify(formData));
      
      toast({
        title: "Patient Added Successfully",
        description: `${formData.patientName} has been registered in the system.`,
      });

      // Navigate to upload scan page
      navigate('/upload-scan');

    } catch (error) {
      console.error('Error saving patient:', error);
      toast({
        title: "Error Saving Patient",
        description: error instanceof Error ? error.message : "Failed to save patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Add New Patient</h1>
          <p className="text-muted-foreground">Register patient information before MRI analysis</p>
        </div>

        {/* Patient Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-medical-primary" />
              Patient Information
            </CardTitle>
            <CardDescription>
              Enter the patient's details to create a new medical record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Name */}
                <div className="space-y-2">
                  <Label htmlFor="patientName" className="text-foreground">
                    Patient Name *
                  </Label>
                  <Input
                    id="patientName"
                    placeholder="Enter full name"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    className="bg-secondary border-border focus:ring-medical-primary"
                    required
                  />
                </div>

                {/* Patient ID */}
                <div className="space-y-2">
                  <Label htmlFor="patientId" className="text-foreground">
                    Patient ID *
                  </Label>
                  <Input
                    id="patientId"
                    placeholder="e.g., P001234"
                    value={formData.patientId}
                    onChange={(e) => handleInputChange('patientId', e.target.value)}
                    className="bg-secondary border-border focus:ring-medical-primary"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-foreground">Gender</Label>
                  <Select onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-foreground">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter age"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="bg-secondary border-border focus:ring-medical-primary"
                    min="1"
                    max="120"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="bg-secondary border-border focus:ring-medical-primary"
                  />
                </div>

                {/* Doctor Name */}
                <div className="space-y-2">
                  <Label htmlFor="doctorName" className="text-foreground">
                    Doctor Name
                  </Label>
                  <Input
                    id="doctorName"
                    placeholder="Enter doctor's name"
                    value={formData.doctorName}
                    onChange={(e) => handleInputChange('doctorName', e.target.value)}
                    className="bg-secondary border-border focus:ring-medical-primary"
                  />
                </div>

                {/* Treatment Date */}
                <div className="space-y-2">
                  <Label htmlFor="treatmentDate" className="text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Treatment Date
                  </Label>
                  <Input
                    id="treatmentDate"
                    type="date"
                    value={formData.treatmentDate}
                    onChange={(e) => handleInputChange('treatmentDate', e.target.value)}
                    className="bg-secondary border-border focus:ring-medical-primary"
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Department
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="neurosurgery">Neurosurgery</SelectItem>
                      <SelectItem value="pain-management">Pain Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-medical hover:opacity-90"
                  size="lg"
                >
                  Add Patient & Continue
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

        {/* Info Card */}
        <Card className="border-medical-primary/20 bg-medical-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-medical-primary rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-foreground font-medium">Next Steps</p>
                <p className="text-sm text-muted-foreground">
                  After adding the patient, you'll be directed to upload their spine MRI scan for AI analysis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddPatient;