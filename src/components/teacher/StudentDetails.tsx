import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

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
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student.photo || `https://avatar.vercel.sh/${student.first_name} ${student.last_name}.png`} alt="Student Avatar" />
                  <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
                </Avatar>
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
