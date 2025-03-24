
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type StudentDetailsProps = {
  studentId: number;
  onBack?: () => void;
};

const StudentDetails = ({ studentId, onBack }: StudentDetailsProps) => {
  const [student, setStudent] = useState<any | null>(null);
  const [parent, setParent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!studentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch student details
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('student_id', studentId)
          .single();
          
        if (studentError) {
          console.error('Error fetching student:', studentError);
          setError('Could not load student details');
          return;
        }
        
        setStudent(studentData);
        
        // Fetch parent details
        const { data: parentData, error: parentError } = await supabase
          .from('parents')
          .select('*')
          .eq('student_id', studentId)
          .single();
          
        if (parentError) {
          console.error('Error fetching parent:', parentError);
          setError('Could not load parent details');
          return;
        }
        
        setParent(parentData);
      } catch (error) {
        console.error('Error in fetchStudentDetails:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentDetails();
  }, [studentId]);

  const displayParentInfo = (parent: any) => {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p>{parent?.email || 'Not provided'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Feedback</h3>
          <p>{parent?.feedback || 'No feedback provided'}</p>
        </div>
      </div>
    );
  };

  // Function to get the correct profile image based on gender
  const getProfileImage = (gender: string) => {
    if (gender && gender.toLowerCase() === 'female') {
      return '/lovable-uploads/29e4e0c1-de7b-4d44-86ac-0d3635c81440.png'; // Female image
    }
    return '/lovable-uploads/fb9542e8-5f06-420d-8d09-80d9058b8158.png'; // Male image (default)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!student) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Student not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
          <CardDescription>
            <Button onClick={onBack} variant="ghost" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full overflow-hidden">
                  <img 
                    src={getProfileImage(student.gender)}
                    alt={`${student.first_name} ${student.last_name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">{student.first_name} {student.last_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Student ID: {student.student_id}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                  <p>{student.first_name} {student.last_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>{student.student_email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                  <p>{student.gender}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                  <p>{student.dob ? format(new Date(student.dob), 'MMMM d, yyyy') : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                  <p>{student.contact_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p>{student.address || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Program Information</h3>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Program ID</h3>
                      <p>{student.program_id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Enrollment Year</h3>
                      <p>{student.enrollment_year}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <Badge variant="secondary">{student.status}</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Parent Information</h3>
                  {parent ? (
                    displayParentInfo(parent)
                  ) : (
                    <p className="text-muted-foreground">No parent information available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetails;
