
import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import AnnouncementBoard from '@/components/announcements/AnnouncementBoard';
import DiscussionRoom from '@/components/discussion/DiscussionRoom';

const HRDashboard = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'employees' | 'discussion'>('employees');
  const user = getCurrentUser();
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple fetches
    if (dataFetchedRef.current) return;
    
    const fetchEmployees = async () => {
      if (!user) return;

      try {
        setLoading(true);
        dataFetchedRef.current = true;

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
  }, [user]); // Only depends on user

  return (
    <Layout
      title="HR Dashboard" 
      subtitle={`Welcome back, ${user?.name || 'HR Manager'}`}
    >
      <div className="mb-6">
        <Tabs defaultValue="employees" onValueChange={(value) => setActiveTab(value as 'employees' | 'discussion')}>
          <TabsList className="mb-4">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="discussion">Discussion Room</TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          </TabsContent>
          
          <TabsContent value="discussion">
            <DiscussionRoom />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HRDashboard;
