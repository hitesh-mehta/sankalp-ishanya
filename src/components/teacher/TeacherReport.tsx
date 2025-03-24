import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

type TeacherSummary = {
  totalStudents: number;
  activeStudents: number;
  programsCount: number;
  monthlyAttendance: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
};

const TeacherReport = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<TeacherSummary>({
    totalStudents: 0,
    activeStudents: 0,
    programsCount: 0,
    monthlyAttendance: {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    }
  });
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchTeacherReport = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // First fetch the employee details
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('email', user.email)
          .single();
          
        if (employeeError) {
          console.error('Error fetching employee details:', employeeError);
          return;
        }
        
        setEmployeeDetails(employee);
        
        const employeeId = employee?.employee_id;
        
        // Fetch students assigned to this teacher
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .or(`educator_employee_id.eq.${employeeId},secondary_educator_employee_id.eq.${employeeId}`)
          .eq('center_id', user.center_id);
          
        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          return;
        }
        
        // Fetch programs
        const { data: programs, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .eq('center_id', user.center_id);
          
        if (programsError) {
          console.error('Error fetching programs:', programsError);
          return;
        }
        
        // Get unique program IDs from assigned students
        const programIds = Array.from(new Set(
          students?.map(student => student.program_id) || []
        ));
        
        // Calculate active students
        const activeStudents = students?.filter(student => student.status === 'active') || [];
        
        // Get current month's attendance
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const { data: attendance, error: attendanceError } = await supabase
          .from('student_attendance')
          .select('*')
          .gte('date', format(firstDayOfMonth, 'yyyy-MM-dd'))
          .lte('date', format(lastDayOfMonth, 'yyyy-MM-dd'));
          
        if (attendanceError) {
          console.error('Error fetching attendance:', attendanceError);
          return;
        }
        
        // Filter attendance for assigned students
        const studentIds = students?.map(student => student.student_id) || [];
        const filteredAttendance = attendance?.filter(record => 
          studentIds.includes(record.student_id)
        ) || [];
        
        // Count attendance by status
        const attendanceSummary = getAttendanceStats(filteredAttendance);
        
        setSummary({
          totalStudents: students?.length || 0,
          activeStudents: activeStudents.length,
          programsCount: programIds.length,
          monthlyAttendance: attendanceSummary
        });
        
      } catch (error) {
        console.error('Error fetching teacher report:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherReport();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!employeeDetails) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not load your employee details. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Overview</CardTitle>
          <CardDescription>
            Summary of your teaching profile and assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Personal Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{employeeDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-medium">{employeeDetails.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Designation</p>
                  <p className="font-medium">{employeeDetails.designation || "Teacher"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Joining</p>
                  <p className="font-medium">
                    {employeeDetails.date_of_joining 
                      ? format(new Date(employeeDetails.date_of_joining), 'PPP') 
                      : "Not available"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Assignment Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-100">
                  <p className="text-2xl font-bold text-blue-700">{summary.totalStudents}</p>
                  <p className="text-sm text-blue-600">Total Students</p>
                </Card>
                <Card className="p-4 bg-green-50 border-green-100">
                  <p className="text-2xl font-bold text-green-700">{summary.activeStudents}</p>
                  <p className="text-sm text-green-600">Active Students</p>
                </Card>
                <Card className="p-4 bg-purple-50 border-purple-100">
                  <p className="text-2xl font-bold text-purple-700">{summary.programsCount}</p>
                  <p className="text-sm text-purple-600">Programs</p>
                </Card>
                <Card className="p-4 bg-amber-50 border-amber-100">
                  <p className="text-2xl font-bold text-amber-700">
                    {summary.monthlyAttendance.total > 0 
                      ? ((summary.monthlyAttendance.present / summary.monthlyAttendance.total) * 100).toFixed(0) 
                      : 0}%
                  </p>
                  <p className="text-sm text-amber-600">Attendance Rate</p>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Attendance Stats</CardTitle>
          <CardDescription>
            {format(new Date(), 'MMMM yyyy')} attendance summary for your students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-green-50 border-green-100">
              <p className="text-2xl font-bold text-green-700">{summary.monthlyAttendance.present}</p>
              <p className="text-sm text-green-600">Present</p>
            </Card>
            <Card className="p-4 bg-red-50 border-red-100">
              <p className="text-2xl font-bold text-red-700">{summary.monthlyAttendance.absent}</p>
              <p className="text-sm text-red-600">Absent</p>
            </Card>
            <Card className="p-4 bg-yellow-50 border-yellow-100">
              <p className="text-2xl font-bold text-yellow-700">{summary.monthlyAttendance.late}</p>
              <p className="text-sm text-yellow-600">Late</p>
            </Card>
            <Card className="p-4 bg-blue-50 border-blue-100">
              <p className="text-2xl font-bold text-blue-700">{summary.monthlyAttendance.excused}</p>
              <p className="text-sm text-blue-600">Excused</p>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const getAttendanceStats = (records: any[]) => {
  const total = records.length;
  const present = records.filter(record => record.attendance === true).length;
  const absent = records.filter(record => record.attendance === false).length;
  const late = 0;
  const excused = 0;
  
  return {
    total,
    present,
    absent,
    late,
    excused,
    presentPercentage: total > 0 ? (present / total) * 100 : 0,
    absentPercentage: total > 0 ? (absent / total) * 100 : 0,
  };
};

export default TeacherReport;
