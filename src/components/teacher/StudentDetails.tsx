
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, User, BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

type StudentDetailsProps = {
  studentId: number;
  onBack: () => void;
};

type StudentData = {
  student_id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  status: string;
  program_id: number;
  center_id: number;
  number_of_sessions?: number;
  start_date?: string;
  end_date?: string;
  program_name?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
};

const StudentDetails = ({ studentId, onBack }: StudentDetailsProps) => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
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
          console.error('Error fetching student details:', studentError);
          setError('Could not load student details');
          return;
        }
        
        if (!studentData) {
          setError('Student not found');
          return;
        }
        
        // Fetch program details
        const { data: programData, error: programError } = await supabase
          .from('programs')
          .select('name')
          .eq('program_id', studentData.program_id)
          .single();
          
        if (programError) {
          console.error('Error fetching program details:', programError);
        }
        
        // Fetch parent details
        const { data: parentData, error: parentError } = await supabase
          .from('parents')
          .select('*')
          .eq('student_id', studentId)
          .single();
          
        if (parentError && parentError.code !== 'PGRST116') { // Not a PostgreSQL error
          console.error('Error fetching parent details:', parentError);
        }
        
        // Combine all data
        const fullStudentData: StudentData = {
          ...studentData,
          program_name: programData?.name || 'Unknown Program',
          parent_name: parentData?.name || 'Not Available',
          parent_email: parentData?.email || 'Not Available',
          parent_phone: parentData?.phone || 'Not Available',
        };
        
        setStudent(fullStudentData);
      } catch (error) {
        console.error('Error in fetchStudentDetails:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || 'Could not load student details'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl md:text-2xl">
                  {student.first_name?.[0]}{student.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl md:text-2xl">
                  {student.first_name} {student.last_name}
                </CardTitle>
                <CardDescription>
                  Student ID: {student.student_id}
                </CardDescription>
                <div className="mt-1">
                  <span 
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {student.status === 'active' ? 'Active' : student.status || 'Unknown Status'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6">
          <Tabs defaultValue="info">
            <TabsList className="mb-6">
              <TabsTrigger value="info">Basic Info</TabsTrigger>
              <TabsTrigger value="program">Program</TabsTrigger>
              <TabsTrigger value="parent">Parent Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-1.5 mb-3">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{student.first_name} {student.last_name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">
                        {student.date_of_birth ? format(new Date(student.date_of_birth), 'PPP') : 'Not available'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{student.gender || 'Not available'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{student.address || 'Not available'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-1.5 mb-3">
                    <BookOpen className="h-4 w-4" />
                    Academic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Program</p>
                      <p className="font-medium">{student.program_name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium capitalize">{student.status || 'Unknown'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Sessions</p>
                      <p className="font-medium">{student.number_of_sessions || 'Not available'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">
                        {student.start_date ? format(new Date(student.start_date), 'PPP') : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="program">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-1.5 mb-3">
                    <BookOpen className="h-4 w-4" />
                    Program Details
                  </h3>
                  
                  <Card className="bg-primary/5 border-primary/10">
                    <CardHeader>
                      <CardTitle>{student.program_name}</CardTitle>
                      <CardDescription>
                        Student is currently enrolled in this program
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Start Date</p>
                          <p className="font-medium">
                            {student.start_date ? format(new Date(student.start_date), 'PPP') : 'Not available'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">End Date</p>
                          <p className="font-medium">
                            {student.end_date ? format(new Date(student.end_date), 'PPP') : 'Ongoing'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Number of Sessions</p>
                          <p className="font-medium">{student.number_of_sessions || 'Not available'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="parent">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-1.5 mb-3">
                    <User className="h-4 w-4" />
                    Parent/Guardian Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{student.parent_name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{student.parent_email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{student.parent_phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t pt-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentDetails;
