
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCurrentUser } from '@/lib/auth';

// Mock data for demonstration
const studentData = {
  name: "Alex Johnson",
  grade: "Grade 8",
  attendance: 92,
  subjects: [
    { name: "Mathematics", score: 85, remarks: "Good progress in algebra" },
    { name: "Science", score: 78, remarks: "Needs to focus more on physics concepts" },
    { name: "English", score: 92, remarks: "Excellent comprehension skills" },
    { name: "History", score: 88, remarks: "Very engaged in class discussions" },
    { name: "Computer Science", score: 95, remarks: "Outstanding programming skills" }
  ],
  recentActivities: [
    { date: "2025-03-15", activity: "Submitted science project" },
    { date: "2025-03-10", activity: "Mathematics quiz - 90%" },
    { date: "2025-03-05", activity: "English presentation" },
    { date: "2025-02-28", activity: "Field trip to science museum" }
  ]
};

const ParentDashboard = () => {
  const user = getCurrentUser();
  
  return (
    <Layout
      title="Parent Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Parent'}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-ishanya-green/20 flex items-center justify-center text-xl font-bold text-ishanya-green">
                  {studentData.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-medium">{studentData.name}</h3>
                  <p className="text-gray-500">{studentData.grade}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Attendance</span>
                  <span className="text-sm font-medium">{studentData.attendance}%</span>
                </div>
                <Progress value={studentData.attendance} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {studentData.recentActivities.map((activity, index) => (
                <li key={index} className="border-b border-gray-100 pb-2 last:border-0">
                  <p className="text-sm text-gray-600">{activity.date}</p>
                  <p className="font-medium">{activity.activity}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Academic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="hidden md:table-cell">Performance</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentData.subjects.map((subject, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.score}%</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Progress value={subject.score} className="h-2 w-full max-w-md" />
                    </TableCell>
                    <TableCell>{subject.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="border-t border-gray-100 pt-4">
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
