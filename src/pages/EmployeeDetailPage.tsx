
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import EmployeeAttendance from '@/components/hr/EmployeeAttendance';
import EmployeePayroll from '@/components/hr/EmployeePayroll';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const EmployeeDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'attendance' | 'payroll'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!employeeId) {
        setError('Employee ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching employee with ID:', employeeId);
        
        const { data, error: fetchError } = await supabase
          .from('employees')
          .select('*')
          .eq('employee_id', parseInt(employeeId))
          .single();
          
        if (fetchError) {
          console.error('Error fetching employee details:', fetchError);
          setError('Could not find employee details');
          return;
        }
        
        console.log('Employee data received:', data);
        setEmployee(data);
        setFormData(data);
      } catch (err) {
        console.error('Error in fetchEmployeeDetails:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeDetails();
  }, [employeeId]);
  
  const handleBack = () => {
    navigate(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = async () => {
    if (!formData || !employeeId) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('employees')
        .update(formData)
        .eq('employee_id', parseInt(employeeId));
        
      if (error) {
        console.error('Error updating employee details:', error);
        toast.error('Failed to update employee details');
        return;
      }
      
      setEmployee(formData);
      setIsEditing(false);
      toast.success('Employee details updated successfully');
    } catch (err) {
      console.error('Error in handleSave:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Employee Information</CardTitle>
                <Button 
                  variant={isEditing ? "outline" : "default"} 
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      setFormData(employee);
                    }
                    setIsEditing(!isEditing);
                  }}
                >
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
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-3">Basic Information</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label htmlFor="name">Full Name</Label>
                              <Input 
                                id="name" 
                                name="name" 
                                value={formData.name || ''} 
                                onChange={handleInputChange} 
                              />
                            </div>
                            <div>
                              <Label htmlFor="employee_id">Employee ID</Label>
                              <Input 
                                id="employee_id" 
                                name="employee_id"
                                value={formData.employee_id || ''} 
                                disabled 
                              />
                            </div>
                            <div>
                              <Label htmlFor="gender">Gender</Label>
                              <Select
                                value={formData.gender || ''}
                                onValueChange={(value) => handleSelectChange('gender', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select
                                value={formData.status || ''}
                                onValueChange={(value) => handleSelectChange('status', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Active">Active</SelectItem>
                                  <SelectItem value="Inactive">Inactive</SelectItem>
                                  <SelectItem value="On Leave">On Leave</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input 
                                id="email" 
                                name="email" 
                                value={formData.email || ''} 
                                onChange={handleInputChange} 
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input 
                                id="phone" 
                                name="phone" 
                                value={formData.phone || ''} 
                                onChange={handleInputChange} 
                              />
                            </div>
                            <div>
                              <Label htmlFor="work_location">Work Location</Label>
                              <Input 
                                id="work_location" 
                                name="work_location" 
                                value={formData.work_location || ''} 
                                onChange={handleInputChange} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-3">Employment Details</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label htmlFor="designation">Designation</Label>
                              <Input 
                                id="designation" 
                                name="designation" 
                                value={formData.designation || ''} 
                                onChange={handleInputChange} 
                              />
                            </div>
                            <div>
                              <Label htmlFor="department">Department</Label>
                              <Input 
                                id="department" 
                                name="department" 
                                value={formData.department || ''} 
                                onChange={handleInputChange} 
                              />
                            </div>
                            <div>
                              <Label htmlFor="employment_type">Employment Type</Label>
                              <Select
                                value={formData.employment_type || ''}
                                onValueChange={(value) => handleSelectChange('employment_type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Full-time">Full-time</SelectItem>
                                  <SelectItem value="Part-time">Part-time</SelectItem>
                                  <SelectItem value="Contract">Contract</SelectItem>
                                  <SelectItem value="Intern">Intern</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="date_of_joining">Date of Joining</Label>
                              <Input 
                                id="date_of_joining" 
                                name="date_of_joining" 
                                type="date"
                                value={formData.date_of_joining || ''} 
                                onChange={handleInputChange} 
                              />
                            </div>
                            <div>
                              <Label htmlFor="date_of_leaving">Date of Leaving</Label>
                              <Input 
                                id="date_of_leaving" 
                                name="date_of_leaving" 
                                type="date"
                                value={formData.date_of_leaving || ''} 
                                onChange={handleInputChange} 
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-3">Emergency Contact</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label htmlFor="emergency_contact_name">Name</Label>
                              <Input 
                                id="emergency_contact_name" 
                                name="emergency_contact_name" 
                                value={formData.emergency_contact_name || ''} 
                                onChange={handleInputChange} 
                              />
                            </div>
                            <div>
                              <Label htmlFor="emergency_contact">Contact</Label>
                              <Input 
                                id="emergency_contact" 
                                name="emergency_contact" 
                                value={formData.emergency_contact || ''} 
                                onChange={handleInputChange} 
                              />
                            </div>
                            <div>
                              <Label htmlFor="blood_group">Blood Group</Label>
                              <Input 
                                id="blood_group" 
                                name="blood_group" 
                                value={formData.blood_group || ''} 
                                onChange={handleInputChange} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="attendance">
          {employeeId && <EmployeeAttendance employeeId={parseInt(employeeId)} />}
        </TabsContent>
        
        <TabsContent value="payroll">
          {employeeId && <EmployeePayroll employeeId={parseInt(employeeId)} />}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default EmployeeDetailPage;
