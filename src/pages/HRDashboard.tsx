import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getCurrentUser } from '@/lib/auth';
import supabase from '@/lib/api';
import AnnouncementBoard from '@/components/announcements/AnnouncementBoard';

const HRDashboard = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch employees from the same center as the HR user
        const { data: centerEmployees, error: employeesError } = await supabase
          .from('employees')
          .select('*')
          .eq('center_id', user.center_id);

        if (employeesError) {
          console.error('Error fetching employees:', employeesError);
          return;
        }

        if (centerEmployees) {
          setEmployees(centerEmployees);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user]);

  return (
    <Layout
      title="HR Dashboard" 
      subtitle={`Welcome back, ${user?.name || 'HR Manager'}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Employees in Your Center</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <LoadingSpinner size="lg" />
                </div>
              ) : employees.length === 0 ? (
                <p className="text-gray-500">No employees found in your center.</p>
              ) : (
                <ul className="list-disc pl-5">
                  {employees.map((employee) => (
                    <li key={employee.id} className="py-1">
                      {employee.name} - {employee.designation}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <AnnouncementBoard />
        </div>
      </div>
    </Layout>
  );
};

export default HRDashboard;
