
import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import AnnouncementBoard from '@/components/announcements/AnnouncementBoard';
import DiscussionRoom from '@/components/discussion/DiscussionRoom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AttendanceTracker from '@/components/teacher/AttendanceTracker';
import TeacherReport from '@/components/teacher/TeacherReport';

const TeacherDashboard = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'programs' | 'attendance' | 'report' | 'discussion'>('programs');
  const user = getCurrentUser();
  const dataFetchedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    // Prevent multiple fetches
    if (dataFetchedRef.current) return;
    
    const fetchTeacherData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        dataFetchedRef.current = true;
        
        // First, get the employee ID based on the teacher's email
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('employee_id')
          .eq('email', user.email)
          .single();
          
        if (employeeError) {
          console.error('Error fetching employee data:', employeeError);
          toast({
            title: "Error",
            description: "Could not fetch your employee information.",
            variant: "destructive"
          });
          return;
        }
        
        const teacherEmployeeId = employeeData?.employee_id;
        console.log('Teacher Employee ID:', teacherEmployeeId);
        
        // Fetch programs where this teacher is assigned
        const { data: teacherPrograms, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .eq('center_id', user.center_id);
          
        if (programsError) {
          console.error('Error fetching teacher programs:', programsError);
          return;
        }
        
        if (teacherPrograms && teacherPrograms.length > 0) {
          setPrograms(teacherPrograms);
          
          // Set the first program as selected by default
          const firstProgramId = teacherPrograms[0].program_id;
          setSelectedProgram(firstProgramId);
          
          // Fetch students assigned to this teacher
          const { data: assignedStudents, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .or(`educator_employee_id.eq.${teacherEmployeeId},secondary_educator_employee_id.eq.${teacherEmployeeId}`)
            .eq('center_id', user.center_id);
            
          if (studentsError) {
            console.error('Error fetching students:', studentsError);
          } else {
            console.log('Assigned students:', assignedStudents);
            setStudents(assignedStudents || []);
          }
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherData();
  }, [user]); // Only depends on user
  
  const handleProgramChange = async (programId: number) => {
    setSelectedProgram(programId);
    setLoading(true);
    
    try {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('employee_id')
        .eq('email', user?.email)
        .single();
      
      const teacherEmployeeId = employeeData?.employee_id;
      
      // Fetch students for the selected program and assigned to this teacher
      const { data: programStudents, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('program_id', programId)
        .or(`educator_employee_id.eq.${teacherEmployeeId},secondary_educator_employee_id.eq.${teacherEmployeeId}`)
        .eq('center_id', user?.center_id);
        
      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      } else {
        setStudents(programStudents || []);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout
      title="Teacher Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Teacher'}`}
    >
      <div className="mb-6">
        <Tabs defaultValue="programs" onValueChange={(value) => setActiveTab(value as 'programs' | 'attendance' | 'report' | 'discussion')}>
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="programs" className="flex-1 sm:flex-none">My Programs</TabsTrigger>
            <TabsTrigger value="attendance" className="flex-1 sm:flex-none">Attendance</TabsTrigger>
            <TabsTrigger value="report" className="flex-1 sm:flex-none">My Report</TabsTrigger>
            <TabsTrigger value="discussion" className="flex-1 sm:flex-none">Discussion Room</TabsTrigger>
          </TabsList>
          
          <TabsContent value="programs" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>My Programs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {programs.length === 0 ? (
                        <p className="text-gray-500">No programs assigned to you yet.</p>
                      ) : (
                        <Tabs 
                          defaultValue={selectedProgram?.toString()} 
                          onValueChange={(value) => handleProgramChange(parseInt(value))}
                        >
                          <TabsList className="mb-4 overflow-x-auto flex whitespace-nowrap w-full">
                            {programs.map((program) => (
                              <TabsTrigger key={program.program_id} value={program.program_id.toString()}>
                                {program.name}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          
                          {programs.map((program) => (
                            <TabsContent key={program.program_id} value={program.program_id.toString()}>
                              <Card>
                                <CardHeader>
                                  <CardTitle>
                                    {program.name} - My Students ({students.length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {students.length === 0 ? (
                                    <p className="text-gray-500">No students assigned to you in this program.</p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Sessions</TableHead>
                                            <TableHead>Actions</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {students.map((student) => (
                                            <TableRow key={student.id}>
                                              <TableCell>{student.student_id}</TableCell>
                                              <TableCell>
                                                {student.first_name} {student.last_name}
                                              </TableCell>
                                              <TableCell>
                                                <span 
                                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    student.status === 'active' 
                                                      ? 'bg-green-100 text-green-800' 
                                                      : 'bg-gray-100 text-gray-800'
                                                  }`}
                                                >
                                                  {student.status || 'N/A'}
                                                </span>
                                              </TableCell>
                                              <TableCell>{student.number_of_sessions || 'N/A'}</TableCell>
                                              <TableCell>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  onClick={() => {
                                                    setActiveTab('attendance');
                                                  }}
                                                >
                                                  View Attendance
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </TabsContent>
                          ))}
                        </Tabs>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
              <div>
                <AnnouncementBoard />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="attendance" className="mt-6">
            <AttendanceTracker students={students} />
          </TabsContent>
          
          <TabsContent value="report" className="mt-6">
            <TeacherReport />
          </TabsContent>
          
          <TabsContent value="discussion" className="mt-6">
            <DiscussionRoom />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
