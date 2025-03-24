
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

const TeacherDashboard = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'programs' | 'discussion'>('programs');
  const user = getCurrentUser();
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple fetches
    if (dataFetchedRef.current) return;
    
    const fetchTeacherData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        dataFetchedRef.current = true;
        
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
          
          // Fetch students for the first program
          const { data: programStudents, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('program_id', firstProgramId)
            .eq('center_id', user.center_id);
            
          if (studentsError) {
            console.error('Error fetching students:', studentsError);
          } else {
            setStudents(programStudents || []);
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
      // Fetch students for the selected program
      const { data: programStudents, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('program_id', programId)
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
        <Tabs defaultValue="programs" onValueChange={(value) => setActiveTab(value as 'programs' | 'discussion')}>
          <TabsList className="mb-4">
            <TabsTrigger value="programs">My Programs</TabsTrigger>
            <TabsTrigger value="discussion">Discussion Room</TabsTrigger>
          </TabsList>
          
          <TabsContent value="programs">
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
                          <TabsList className="mb-4">
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
                                    {program.name} - Enrolled Students ({students.length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {students.length === 0 ? (
                                    <p className="text-gray-500">No students enrolled in this program.</p>
                                  ) : (
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>ID</TableHead>
                                          <TableHead>Name</TableHead>
                                          <TableHead>Status</TableHead>
                                          <TableHead>Sessions</TableHead>
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
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
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
          
          <TabsContent value="discussion">
            <DiscussionRoom />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
