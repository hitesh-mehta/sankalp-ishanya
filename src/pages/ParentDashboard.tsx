
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/auth';
import supabase from '@/lib/api';
import AnnouncementBoard from '@/components/announcements/AnnouncementBoard';

const ParentDashboard = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user || !user.student_id) return;
      
      try {
        setLoading(true);
        
        // Fetch student details
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*, programs(*)')
          .eq('student_id', user.student_id)
          .single();
          
        if (studentError) {
          console.error('Error fetching student data:', studentError);
          toast.error('Failed to load student information');
          return;
        }
        
        if (student) {
          setStudentData(student);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [user]);
  
  const submitFeedback = async () => {
    if (!feedback.trim()) {
      toast.error('Please enter feedback before submitting');
      return;
    }
    
    if (!user || !user.id) {
      toast.error('You must be logged in to submit feedback');
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
        toast.error('Could not find your parent record');
        console.error('Error finding parent record:', parentError);
        return;
      }
      
      // Update parent record with feedback
      const { error: updateError } = await supabase
        .from('parents')
        .update({ feedback: feedback })
        .eq('id', parentData.id);
        
      if (updateError) {
        toast.error('Failed to submit feedback');
        console.error('Error submitting feedback:', updateError);
        return;
      }
      
      toast.success('Feedback submitted successfully');
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('An error occurred while submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };
  
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
        <div>
          <AnnouncementBoard />
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
