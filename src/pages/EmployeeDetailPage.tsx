
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import EmployeeAttendance from '@/components/hr/EmployeeAttendance';
import EmployeePayroll from '@/components/hr/EmployeePayroll';

const EmployeeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'attendance' | 'payroll'>('details');
  
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('employees')
          .select('*')
          .eq('employee_id', parseInt(id))
          .single();
          
        if (fetchError) {
          console.error('Error fetching employee details:', fetchError);
          setError('Could not find employee details');
          return;
        }
        
        setEmployee(data);
      } catch (err) {
        console.error('Error in fetchEmployeeDetails:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeDetails();
  }, [id]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <Layout title="Employee Details" subtitle="Loading..." showBackButton onBack={handleBack}>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }
  
  if (error || !employee) {
    return (
      <Layout title="Employee Details" subtitle="Error" showBackButton onBack={handleBack}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Could not load employee details'}</AlertDescription>
        </Alert>
      </Layout>
    );
  }
  
  return (
    <Layout 
      title={`Employee: ${employee.name}`}
      subtitle={`ID: ${employee.employee_id} | ${employee.designation}`}
      showBackButton
      onBack={handleBack}
    >
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'details' | 'attendance' | 'payroll')}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Basic Information</h3>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{employee.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Employee ID</p>
                            <p className="font-medium">{employee.employee_id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium">{employee.gender}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium">{employee.status}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{employee.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{employee.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Work Location</p>
                            <p className="font-medium">{employee.work_location || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Employment Details</h3>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          <div>
                            <p className="text-sm text-gray-500">Designation</p>
                            <p className="font-medium">{employee.designation}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Department</p>
                            <p className="font-medium">{employee.department}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Employment Type</p>
                            <p className="font-medium">{employee.employment_type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date of Joining</p>
                            <p className="font-medium">
                              {employee.date_of_joining && new Date(employee.date_of_joining).toLocaleDateString()}
                            </p>
                          </div>
                          {employee.date_of_leaving && (
                            <div>
                              <p className="text-sm text-gray-500">Date of Leaving</p>
                              <p className="font-medium">
                                {new Date(employee.date_of_leaving).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{employee.emergency_contact_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Contact</p>
                            <p className="font-medium">{employee.emergency_contact}</p>
                          </div>
                          {employee.blood_group && (
                            <div>
                              <p className="text-sm text-gray-500">Blood Group</p>
                              <p className="font-medium">{employee.blood_group}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <EmployeeAttendance employeeId={parseInt(id)} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="attendance">
          <EmployeeAttendance employeeId={parseInt(id)} />
        </TabsContent>
        
        <TabsContent value="payroll">
          <EmployeePayroll employeeId={parseInt(id)} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default EmployeeDetailPage;
