
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Save, X, Calendar as CalendarIcon, User, Briefcase, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle } from 'lucide-react';
import EmployeeForm from '@/components/hr/EmployeeForm';
import EmployeeAttendance from '@/components/hr/EmployeeAttendance';
import EmployeePayroll from '@/components/hr/EmployeePayroll';
import { useToast } from '@/components/ui/use-toast';

const EmployeeDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'attendance' | 'payroll'>('details');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch employee details
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('employee_id', employeeId)
          .single();
          
        if (employeeError) {
          console.error('Error fetching employee:', employeeError);
          setError('Could not find employee details');
          return;
        }
        
        if (!employeeData) {
          setError('Employee not found');
          return;
        }
        
        setEmployee(employeeData);
      } catch (error) {
        console.error('Error in fetchEmployeeData:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, [employeeId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEmployeeUpdate = async (updatedEmployee: any) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update(updatedEmployee)
        .eq('employee_id', employeeId);
        
      if (error) {
        console.error('Error updating employee:', error);
        toast({
          title: "Error",
          description: "Failed to update employee details",
          variant: "destructive",
        });
        return;
      }
      
      setEmployee(updatedEmployee);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Employee details updated successfully",
      });
    } catch (error) {
      console.error('Error in handleEmployeeUpdate:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout title="Employee Details" subtitle="Loading employee information...">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !employee) {
    return (
      <Layout title="Employee Details" subtitle="Error">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Could not load employee details'}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate('/hr')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Layout>
    );
  }

  return (
    <Layout
      title="Employee Details"
      subtitle={`${employee.name} - ID: ${employee.employee_id}`}
    >
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate('/hr')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'details' | 'attendance' | 'payroll')}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{employee.name}</CardTitle>
                  <CardDescription>{employee.designation} - {employee.department}</CardDescription>
                </div>
                <Button variant={isEditing ? "destructive" : "outline"} onClick={handleEditToggle}>
                  {isEditing ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <EmployeeForm 
                  employee={employee} 
                  onSave={handleEmployeeUpdate} 
                  onCancel={() => setIsEditing(false)} 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-1.5 mb-3">
                      <User className="h-4 w-4" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{employee.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium">{employee.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">
                          {employee.date_of_birth || 'Not recorded'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Blood Group</p>
                        <p className="font-medium">{employee.blood_group || 'Not recorded'}</p>
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 flex items-center gap-1.5 mb-3 mt-6">
                      <Mail className="h-4 w-4" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{employee.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{employee.phone || 'Not recorded'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Emergency Contact Name</p>
                        <p className="font-medium">{employee.emergency_contact_name || 'Not recorded'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Emergency Contact</p>
                        <p className="font-medium">{employee.emergency_contact || 'Not recorded'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-1.5 mb-3">
                      <Briefcase className="h-4 w-4" />
                      Employment Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Employee ID</p>
                        <p className="font-medium">{employee.employee_id}</p>
                      </div>
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
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium">{employee.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Work Location</p>
                        <p className="font-medium">{employee.work_location || 'Not recorded'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Joining</p>
                        <p className="font-medium">{employee.date_of_joining}</p>
                      </div>
                      {employee.date_of_leaving && (
                        <div>
                          <p className="text-sm text-gray-500">Date of Leaving</p>
                          <p className="font-medium">{employee.date_of_leaving}</p>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-medium text-gray-900 flex items-center gap-1.5 mb-3 mt-6">
                      <CalendarIcon className="h-4 w-4" />
                      Program Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Center ID</p>
                        <p className="font-medium">{employee.center_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Program ID</p>
                        <p className="font-medium">{employee.program_id || 'Not assigned'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <EmployeeAttendance employeeId={parseInt(employeeId!)} />
        </TabsContent>
        
        <TabsContent value="payroll">
          <EmployeePayroll employeeId={parseInt(employeeId!)} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default EmployeeDetailPage;
