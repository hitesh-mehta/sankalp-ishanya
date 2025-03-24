
import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import AnnouncementBoard from '@/components/announcements/AnnouncementBoard';
import DiscussionRoom from '@/components/discussion/DiscussionRoom';
import EmployeeSearch from '@/components/hr/EmployeeSearch';
import EmployeeList from '@/components/hr/EmployeeList';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchCenters } from '@/lib/api';

type Center = {
  id: string;
  center_id: number;
  name: string;
};

const HRDashboard = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'employees' | 'discussion'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [centers, setCenters] = useState<Center[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const user = getCurrentUser();
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple fetches
    if (dataFetchedRef.current) return;
    
    const fetchCentersData = async () => {
      const centersData = await fetchCenters();
      if (centersData) {
        setCenters(centersData);
      }
    };

    const fetchEmployees = async () => {
      if (!user) return;

      try {
        setLoading(true);
        dataFetchedRef.current = true;

        // Fetch total employees count from centers
        const { data: centersData, error: centersError } = await supabase
          .from('centers')
          .select('num_of_employees');

        if (centersError) {
          console.error('Error fetching centers:', centersError);
        } else {
          const total = centersData.reduce((sum, center) => sum + (center.num_of_employees || 0), 0);
          setTotalEmployees(total);
        }

        // Fetch all employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*');

        if (employeesError) {
          console.error('Error fetching employees:', employeesError);
          return;
        }

        if (employeesData) {
          setEmployees(employeesData);
          setFilteredEmployees(employeesData);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCentersData();
    fetchEmployees();
  }, [user]); // Only depends on user

  useEffect(() => {
    // Filter employees based on search term and selected center
    if (employees.length === 0) return;
    
    let filtered = [...employees];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by center
    if (selectedCenter !== 'all') {
      const centerId = parseInt(selectedCenter);
      filtered = filtered.filter(emp => emp.center_id === centerId);
    }
    
    setFilteredEmployees(filtered);
  }, [searchTerm, selectedCenter, employees]);

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
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalEmployees}</div>
                    <p className="text-sm text-muted-foreground">Across all centers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Search</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search employees by name..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Filter by Center</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a center" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Centers</SelectItem>
                        {centers.map((center) => (
                          <SelectItem key={center.id} value={center.center_id.toString()}>
                            {center.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <EmployeeList employees={filteredEmployees} />
              )}
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
