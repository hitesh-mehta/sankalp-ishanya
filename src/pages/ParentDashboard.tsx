import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import supabase from '@/lib/api';

const ParentDashboard = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user || !user.email) {
        setError("User information not available. Please log in again.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Attempting to fetch student data for parent email:', user.email);
        
        // Fetch student details where parents_email matches the logged-in parent's email
        const { data: students, error: studentError } = await supabase
          .from('students')
          .select('*, programs(*)')
          .eq('parents_email', user.email)
          .single();
          
        if (studentError) {
          console.error('Error fetching student data by parent email:', studentError);
          
          // Fallback: try to get student via parent record if direct match fails
          console.log('Attempting fallback with parent record lookup');
          const { data: parentData, error: parentError } = await supabase
            .from('parents')
            .select('student_id')
            .eq('email', user.email)
            .single();
            
          if (parentError || !parentData || !parentData.student_id) {
            console.error('Error fetching parent data:', parentError);
            setError("No student information found for this parent account. Please contact an administrator.");
            setLoading(false);
            return;
          }
          
          console.log('Found student_id from parent record:', parentData.student_id);
          
          // Try to fetch student with student_id from parent record
          const { data: studentFromParent, error: studentFromParentError } = await supabase
            .from('students')
            .select('*, programs(*)')
            .eq('student_id', parentData.student_id)
            .single();
            
          if (studentFromParentError) {
            console.error('Error fetching student via parent relation:', studentFromParentError);
            setError("Could not retrieve student information. Please contact an administrator.");
            setLoading(false);
            return;
          }
          
          if (!studentFromParent) {
            setError("No student data found with the linked student ID.");
            setLoading(false);
            return;
          }
          
          console.log('Successfully fetched student data via parent relation');
          setStudentData(studentFromParent);
          setLoading(false);
          return;
        }
        
        if (students) {
          console.log('Successfully fetched student data directly');
          setStudentData(students);
        } else {
          setError("No student information found.");
        }
      } catch (error) {
        console.error('Unexpected error fetching student data:', error);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [user]);
  
  const submitFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please enter feedback before submitting",
        variant: "destructive"
      });
      return;
    }
    
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit feedback",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Get parent record
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (parentError || !parentData) {
        console.error('Error finding parent record:', parentError);
        toast({
          title: "Error",
          description: "Could not find your parent record",
          variant: "destructive"
        });
        return;
      }
      
      // Update parent record with feedback
      const { error: updateError } = await supabase
        .from('parents')
        .update({ feedback: feedback })
        .eq('id', parentData.id);
        
      if (updateError) {
        console.error('Error submitting feedback:', updateError);
        toast({
          title: "Error",
          description: "Failed to submit feedback",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "An error occurred while submitting feedback",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Force re-fetch by triggering useEffect
    setStudentData(null);
  };
  
  // Dummy progress data - would be fetched from an API in a real application
  const progressData = [
    { skill: 'Communication', progress: 75, lastAssessment: '2023-10-15' },
    { skill: 'Fine Motor Skills', progress: 60, lastAssessment: '2023-10-10' },
    { skill: 'Attention Span', progress: 85, lastAssessment: '2023-10-12' },
    { skill: 'Social Interaction', progress: 70, lastAssessment: '2023-10-18' },
    { skill: 'Academic Progress', progress: 65, lastAssessment: '2023-10-05' },
  ];
  
  return (
    <Layout
      title="Parent Dashboard"
      subtitle={`Welcome, ${user?.name || 'Parent'}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <ErrorDisplay message={error} onRetry={handleRetry} />
          ) : studentData ? (
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name:</span>
                          <span className="font-medium">{studentData.first_name} {studentData.last_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Student ID:</span>
                          <span className="font-medium">{studentData.student_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Gender:</span>
                          <span className="font-medium">{studentData.gender || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date of Birth:</span>
                          <span className="font-medium">
                            {studentData.dob ? new Date(studentData.dob).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className={`font-medium ${
                            studentData.status === 'active' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {studentData.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Program Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Program:</span>
                          <span className="font-medium">{studentData.programs?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sessions:</span>
                          <span className="font-medium">{studentData.number_of_sessions || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Session Type:</span>
                          <span className="font-medium">{studentData.session_type || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Days:</span>
                          <span className="font-medium">
                            {Array.isArray(studentData.days_of_week) 
                              ? studentData.days_of_week.join(', ') 
                              : (studentData.days_of_week || 'N/A')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Joined:</span>
                          <span className="font-medium">
                            {studentData.joining_date ? new Date(studentData.joining_date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="shadow-sm mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Medical Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Primary Diagnosis:</span>
                          <span className="font-medium">{studentData.primary_diagnosis || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Comorbidity:</span>
                          <span className="font-medium">{studentData.comorbidity || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Blood Group:</span>
                          <span className="font-medium">{studentData.blood_group || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Allergies:</span>
                          <span className="font-medium">{studentData.allergies || 'None'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">UDID:</span>
                          <span className="font-medium">{studentData.udid || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Strengths and Areas for Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Strengths</h4>
                        <p className="text-sm">{studentData.strengths || 'No information available'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Areas for Growth</h4>
                        <p className="text-sm">{studentData.weakness || 'No information available'}</p>
                      </div>
                    </div>
                    {studentData.comments && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Additional Comments</h4>
                        <p className="text-sm">{studentData.comments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-500">No student information available. Please contact the administrator.</p>
              </CardContent>
            </Card>
          )}
          
          {/* Feedback Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Provide Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Share your thoughts, concerns, or feedback about your child's progress..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={submitFeedback} 
                disabled={submitting || !feedback.trim()}
              >
                {submitting ? <LoadingSpinner size="sm" /> : 'Submit Feedback'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Progress Tracking Section */}
        <div>
          <Card className="shadow-lg border-t-4 border-ishanya-green">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                Student Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {progressData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.skill}</span>
                    <span className="text-sm text-gray-500">
                      Last assessed: {new Date(item.lastAssessment).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={item.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Beginning</span>
                      <span>{item.progress}%</span>
                      <span>Proficient</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-xs text-gray-500">
                These progress indicators show your child's development in key areas based on assessments by our educators.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;

