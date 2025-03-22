import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getCurrentUser } from '@/lib/auth';
import supabase from '@/lib/api';
import AnnouncementBoard from '@/components/announcements/AnnouncementBoard';

const ParentDashboard = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
          return;
        }
        
        if (student) {
          setStudentData(student);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [user]);
  
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
                          <span className="text-gray-500">Age:</span>
                          <span className="font-medium">{studentData.age || 'N/A'}</span>
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
                    <CardTitle className="text-lg">Recent Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Activity</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* This would be populated with actual progress data */}
                        <TableRow>
                          <TableCell>No progress data available</TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
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
        </div>
        <div>
          <AnnouncementBoard />
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
