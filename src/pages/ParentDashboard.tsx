
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCurrentUser } from '@/lib/auth';
import supabase from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { User, BookOpen, Calendar, BarChart3 } from 'lucide-react';

// Define student data type
type StudentData = {
  name: string;
  first_name: string;
  last_name: string;
  grade: string;
  attendance: number;
  photo?: string;
  student_id?: number;
  dob?: string;
  contact_number?: string;
  parents_email?: string;
  subjects: Array<{
    name: string;
    score: number;
    remarks: string;
  }>;
  recentActivities: Array<{
    date: string;
    activity: string;
  }>;
};

const ParentDashboard = () => {
  const user = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  
  // Default data for fallback
  const defaultStudentData: StudentData = {
    name: "Student",
    first_name: "",
    last_name: "",
    grade: "Grade",
    attendance: 90,
    photo: "",
    subjects: [
      { name: "Mathematics", score: 85, remarks: "Good progress in algebra" },
      { name: "Science", score: 78, remarks: "Needs to focus more on physics concepts" },
      { name: "English", score: 92, remarks: "Excellent comprehension skills" },
      { name: "History", score: 88, remarks: "Very engaged in class discussions" },
      { name: "Computer Science", score: 95, remarks: "Outstanding programming skills" }
    ],
    recentActivities: [
      { date: "2023-03-15", activity: "Submitted science project" },
      { date: "2023-03-10", activity: "Mathematics quiz - 90%" },
      { date: "2023-03-05", activity: "English presentation" },
      { date: "2023-02-28", activity: "Field trip to science museum" }
    ]
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user || !user.student_id) {
        // If no student_id is associated with parent, use default data
        setStudentData(defaultStudentData);
        setLoading(false);
        return;
      }

      try {
        // Fetch student data from Supabase
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('student_id', user.student_id)
          .single();

        if (error) {
          console.error('Error fetching student data:', error);
          toast.error('Failed to load student data');
          setStudentData(defaultStudentData);
        } else if (data) {
          // Map the database data to our component state
          const studentInfo: StudentData = {
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Student',
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            grade: data.grade || 'Grade',
            attendance: data.attendance || 92,
            photo: data.photo || '',
            student_id: data.student_id,
            dob: data.dob,
            contact_number: data.contact_number,
            parents_email: data.parents_email,
            // Use actual subject data if available, otherwise default
            subjects: data.subjects || defaultStudentData.subjects,
            recentActivities: data.activities || defaultStudentData.recentActivities
          };
          
          setStudentData(studentInfo);
        } else {
          toast.warning('No student data found');
          setStudentData(defaultStudentData);
        }
      } catch (e) {
        console.error('Error in fetching student data:', e);
        setStudentData(defaultStudentData);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  if (loading) {
    return (
      <Layout
        title="Parent Dashboard"
        subtitle="Loading student data..."
      >
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout
      title="Parent Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Parent'}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <Card className="md:col-span-2 shadow-lg border-t-4 border-ishanya-yellow">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <User className="h-5 w-5 text-ishanya-green" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {studentData?.photo ? (
                  <div className="h-16 w-16 rounded-full overflow-hidden">
                    <img 
                      src={studentData.photo} 
                      alt={studentData.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-ishanya-green/20 flex items-center justify-center text-xl font-bold text-ishanya-green">
                    {studentData?.name.split(' ').map(n => n[0]).join('') || 'S'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-medium text-gray-800">{studentData?.name || 'Student'}</h3>
                  <p className="text-gray-500">{studentData?.grade || 'Grade'}</p>
                  {studentData?.student_id && <p className="text-sm text-gray-400">ID: {studentData.student_id}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 border-t border-gray-100 pt-4">
                {studentData?.dob && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-ishanya-green" />
                    <span className="text-sm font-medium">Date of Birth:</span>
                    <span className="text-sm">{studentData.dob}</span>
                  </div>
                )}
                {studentData?.contact_number && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ishanya-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span className="text-sm font-medium">Contact:</span>
                    <span className="text-sm">{studentData.contact_number}</span>
                  </div>
                )}
                {studentData?.parents_email && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ishanya-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{studentData.parents_email}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1 text-ishanya-green" />
                    Attendance
                  </span>
                  <span className="text-sm font-medium">{studentData?.attendance || 0}%</span>
                </div>
                <Progress 
                  value={studentData?.attendance || 0} 
                  className="h-2" 
                  indicatorClassName={`bg-gradient-to-r ${studentData?.attendance && studentData.attendance > 90 
                    ? 'from-ishanya-green to-green-400' 
                    : studentData?.attendance && studentData.attendance > 75 
                      ? 'from-ishanya-yellow to-yellow-400' 
                      : 'from-orange-500 to-red-500'}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-t-4 border-ishanya-green">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Calendar className="h-5 w-5 text-ishanya-green" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {studentData?.recentActivities.map((activity, index) => (
                <li key={index} className="border-b border-gray-100 pb-2 last:border-0 hover:bg-gray-50 transition-colors rounded p-2">
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-3 w-3 mr-1 inline" />
                    {activity.date}
                  </p>
                  <p className="font-medium text-gray-800">{activity.activity}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3 shadow-lg border-t-4 border-ishanya-green">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <BookOpen className="h-5 w-5 text-ishanya-green" />
              Academic Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Score</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold">Performance</TableHead>
                  <TableHead className="font-semibold">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentData?.subjects.map((subject, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800">{subject.name}</TableCell>
                    <TableCell className="font-medium">
                      <span className={`${subject.score >= 90 
                        ? 'text-green-600' 
                        : subject.score >= 75 
                          ? 'text-ishanya-green' 
                          : subject.score >= 60 
                            ? 'text-yellow-600' 
                            : 'text-red-600'}`}>
                        {subject.score}%
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Progress 
                        value={subject.score} 
                        className="h-2 w-full max-w-md" 
                        indicatorClassName={`${subject.score >= 90 
                          ? 'bg-green-500' 
                          : subject.score >= 75 
                            ? 'bg-ishanya-green' 
                            : subject.score >= 60 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'}`}
                      />
                    </TableCell>
                    <TableCell className="text-gray-600">{subject.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="border-t border-gray-100 pt-4 bg-gray-50">
            <p className="text-gray-500 text-sm">
              Note: Scores are based on recent assessments and may change with future evaluations.
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
