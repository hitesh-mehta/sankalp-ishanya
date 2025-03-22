
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTableData } from '@/lib/api';
import { getUserRole } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  User, Book, Mail, Phone, Calendar, MapPin, Award, 
  HeartPulse, Clock, FileText, Download, MessageSquare, 
  Bookmark, Bus, AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

// Extend the jsPDF type definition
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF & {
      previous: {
        finalY: number;
      };
    };
  }
}

interface ParentsViewProps {
  studentId?: number;
}

const ParentsView: React.FC<ParentsViewProps> = ({ studentId }) => {
  const [feedback, setFeedback] = useState('');
  const userRole = getUserRole();
  
  // Fetch student data
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => fetchTableData('students'),
  });

  // Fetch educators data
  const { data: educators, isLoading: educatorsLoading } = useQuery({
    queryKey: ['educators'],
    queryFn: () => fetchTableData('educators'),
  });

  // Filter to get the current student if studentId is provided
  const currentStudent = studentId && students 
    ? students.find((student: any) => student.student_id === studentId) 
    : students?.[0];

  // Find the student's educator
  const studentEducator = currentStudent && educators 
    ? educators.find((educator: any) => educator.employee_id === currentStudent.educator_employee_id) 
    : null;

  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      toast.error('Please enter feedback before submitting');
      return;
    }

    try {
      // Here you would typically call your API to save the feedback
      // For now, we'll just simulate success
      toast.success('Feedback submitted successfully');
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  // Generate and download PDF report
  const downloadProgressReport = () => {
    if (!currentStudent) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Student Progress Report', 14, 22);
    
    // Add student basic info
    doc.setFontSize(16);
    doc.text('Student Information', 14, 35);
    
    const studentInfo = [
      [`Name: ${currentStudent.first_name} ${currentStudent.last_name}`],
      [`Student ID: ${currentStudent.student_id}`],
      [`Enrollment: ${currentStudent.enrollment_year}`],
      [`Status: ${currentStudent.status || 'Active'}`],
      [`Program ID: ${currentStudent.program_id}`],
    ];
    
    let yPosition = 38;
    
    doc.autoTable({
      startY: yPosition,
      body: studentInfo,
      theme: 'plain',
      styles: { fontSize: 12, cellPadding: 3 },
    });
    
    yPosition = doc.autoTable.previous.finalY + 10;
    
    // Add medical info
    doc.setFontSize(16);
    doc.text('Medical Information', 14, yPosition);
    
    const medicalInfo = [
      [`Primary Diagnosis: ${currentStudent.primary_diagnosis || 'Not specified'}`],
      [`Comorbidity: ${currentStudent.comorbidity || 'None'}`],
      [`Blood Group: ${currentStudent.blood_group || 'Not specified'}`],
      [`Allergies: ${currentStudent.allergies || 'None'}`],
    ];
    
    doc.autoTable({
      startY: yPosition + 2,
      body: medicalInfo,
      theme: 'plain',
      styles: { fontSize: 12, cellPadding: 3 },
    });
    
    yPosition = doc.autoTable.previous.finalY + 10;
    
    // Add session info
    doc.setFontSize(16);
    doc.text('Session Information', 14, yPosition);
    
    const sessionInfo = [
      [`Number of Sessions: ${currentStudent.number_of_sessions || 'Not specified'}`],
      [`Session Type: ${currentStudent.session_type || 'Not specified'}`],
      [`Days: ${Array.isArray(currentStudent.days_of_week) ? currentStudent.days_of_week.join(', ') : currentStudent.days_of_week || 'Not specified'}`],
      [`Timings: ${Array.isArray(currentStudent.timings) ? currentStudent.timings.join(', ') : currentStudent.timings || 'Not specified'}`],
    ];
    
    doc.autoTable({
      startY: yPosition + 2,
      body: sessionInfo,
      theme: 'plain',
      styles: { fontSize: 12, cellPadding: 3 },
    });
    
    yPosition = doc.autoTable.previous.finalY + 10;
    
    // Add strengths and weakness
    doc.setFontSize(16);
    doc.text('Performance', 14, yPosition);
    
    const performanceInfo = [
      [`Strengths: ${currentStudent.strengths || 'Not evaluated'}`],
      [`Areas for Improvement: ${currentStudent.weakness || 'Not evaluated'}`],
      [`Additional Comments: ${currentStudent.comments || 'No comments'}`],
    ];
    
    doc.autoTable({
      startY: yPosition + 2,
      body: performanceInfo,
      theme: 'plain',
      styles: { fontSize: 12, cellPadding: 3 },
    });
    
    // Save the PDF
    doc.save(`${currentStudent.first_name}_${currentStudent.last_name}_Report.pdf`);
    toast.success('Progress report downloaded successfully');
  };

  if (studentsLoading || educatorsLoading) {
    return <LoadingSpinner />;
  }

  if (!students || students.length === 0) {
    return <div className="p-4 text-center">No student records found.</div>;
  }

  if (!currentStudent) {
    return <div className="p-4 text-center">Student not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start my-4">
          <TabsTrigger value="profile">Student Profile</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Student Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {currentStudent.photo ? (
                      <img 
                        src={currentStudent.photo} 
                        alt={`${currentStudent.first_name} ${currentStudent.last_name}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <CardTitle>{`${currentStudent.first_name} ${currentStudent.last_name}`}</CardTitle>
                    <CardDescription>Student ID: {currentStudent.student_id}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">DOB: {currentStudent.dob ? new Date(currentStudent.dob).toLocaleDateString() : 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Gender: {currentStudent.gender || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Enrolled: {currentStudent.enrollment_year || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Status: {currentStudent.status || 'Active'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Performance & Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-green-500" />
                    Strengths
                  </h4>
                  <p className="text-sm text-gray-600 pl-6">
                    {currentStudent.strengths || 'No strengths recorded yet.'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Areas for Improvement
                  </h4>
                  <p className="text-sm text-gray-600 pl-6">
                    {currentStudent.weakness || 'No areas for improvement recorded yet.'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Comments
                  </h4>
                  <p className="text-sm text-gray-600 pl-6">
                    {currentStudent.comments || 'No additional comments.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Download Progress Report</CardTitle>
              <CardDescription>Get a comprehensive report of your child's progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadProgressReport} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Download PDF Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submit Feedback</CardTitle>
              <CardDescription>Share your thoughts about your child's progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Type your feedback here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmitFeedback} className="w-full sm:w-auto">
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Information about your child's sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Detail</TableHead>
                    <TableHead>Information</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Number of Sessions</TableCell>
                    <TableCell>{currentStudent.number_of_sessions || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Session Type</TableCell>
                    <TableCell>{currentStudent.session_type || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Days of Week</TableCell>
                    <TableCell>
                      {Array.isArray(currentStudent.days_of_week) 
                        ? currentStudent.days_of_week.join(', ') 
                        : currentStudent.days_of_week || 'Not specified'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Timings</TableCell>
                    <TableCell>
                      {Array.isArray(currentStudent.timings) 
                        ? currentStudent.timings.join(', ') 
                        : currentStudent.timings || 'Not specified'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Program ID</TableCell>
                    <TableCell>{currentStudent.program_id || 'Not assigned'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Transport</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-gray-500" />
                        {currentStudent.transport || 'Not specified'}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Tab */}
        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Health-related details for your child</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Detail</TableHead>
                    <TableHead>Information</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="h-4 w-4 text-red-500" />
                        Primary Diagnosis
                      </div>
                    </TableCell>
                    <TableCell>{currentStudent.primary_diagnosis || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Comorbidity</TableCell>
                    <TableCell>{currentStudent.comorbidity || 'None'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Blood Group</TableCell>
                    <TableCell>{currentStudent.blood_group || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Allergies</TableCell>
                    <TableCell>{currentStudent.allergies || 'None'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Family Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Detail</TableHead>
                      <TableHead>Information</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Father's Name</TableCell>
                      <TableCell>{currentStudent.fathers_name || 'Not specified'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Mother's Name</TableCell>
                      <TableCell>{currentStudent.mothers_name || 'Not specified'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          Contact Number
                        </div>
                      </TableCell>
                      <TableCell>{currentStudent.contact_number || 'Not specified'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Alternative Contact</TableCell>
                      <TableCell>{currentStudent.alt_contact_number || 'Not specified'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          Parents' Email
                        </div>
                      </TableCell>
                      <TableCell>{currentStudent.parents_email || 'Not specified'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          Address
                        </div>
                      </TableCell>
                      <TableCell>{currentStudent.address || 'Not specified'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Educator Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                {studentEducator ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Detail</TableHead>
                        <TableHead>Information</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Educator Name</TableCell>
                        <TableCell>{studentEducator.name || 'Not specified'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            Email
                          </div>
                        </TableCell>
                        <TableCell>{studentEducator.email || 'Not specified'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            Phone
                          </div>
                        </TableCell>
                        <TableCell>{studentEducator.phone || 'Not specified'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Designation</TableCell>
                        <TableCell>{studentEducator.designation || 'Educator'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    No educator information available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentsView;
