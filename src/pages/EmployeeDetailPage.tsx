import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, User, Briefcase, Mail, Phone, Calendar, MapPin, Badge as BadgeIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import EmployeeAttendance from '@/components/hr/EmployeeAttendance';
import { supabase } from '@/integrations/supabase/client';

type Employee = {
  id: string;
  employee_id: number;
  name: string;
  gender: string;
  designation: string;
  department: string;
  status: string;
  center_id: number;
  email: string;
  phone: string;
  date_of_birth: string;
  date_of_joining: string;
  work_location: string;
  blood_group: string;
  emergency_contact_name: string;
  emergency_contact: string;
};

// Fix the handling of employee_id by parsing it to a number
const EmployeeDetailPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!employeeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Convert employeeId string to number
        const numericEmployeeId = parseInt(employeeId, 10);
        
        if (isNaN(numericEmployeeId)) {
          throw new Error('Invalid employee ID');
        }
        
        const { data, error: fetchError } = await supabase
          .from('employees')
          .select('*')
          .eq('employee_id', numericEmployeeId)
          .single();
          
        if (fetchError) {
          console.error('Error fetching employee:', fetchError);
          setError('Could not load employee details');
          return;
        }
        
        setEmployee(data as Employee);
      } catch (error) {
        console.error('Error in fetchEmployeeDetails:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeDetails();
  }, [employeeId]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "on leave":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const handleGoBack = () => {
    navigate('/hr');
  };

  const handleEditEmployee = () => {
    if (employee) {
      // Convert employeeId string to number before passing it
      const numericEmployeeId = parseInt(employeeId || '0', 10);
      
      if (!isNaN(numericEmployeeId)) {
        // Use the numeric employee ID in your logic
        navigate(`/hr/employees/edit/${numericEmployeeId}`);
      }
    }
  };

  const handleDeleteEmployee = async () => {
    if (employee && employee.id) {
      const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
      if (confirmDelete) {
        try {
          setLoading(true);
          setError(null);

          const { error: deleteError } = await supabase
            .from('employees')
            .delete()
            .eq('id', employee.id);

          if (deleteError) {
            console.error("Error deleting employee:", deleteError);
            setError("Failed to delete employee.");
            return;
          }

          alert("Employee deleted successfully.");
          navigate('/hr');
        } catch (error) {
          console.error("Error deleting employee:", error);
          setError("An unexpected error occurred while deleting the employee.");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!employee) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Employee not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto mt-8">
      <div className="mb-4 flex justify-between items-center">
        <Button variant="outline" onClick={handleGoBack}>
          ← Back to Employees
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditEmployee}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteEmployee} className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{employee.name}</CardTitle>
          </div>
          <Badge className={getStatusColor(employee.status)}>
            {employee.status || "Unknown"}
          </Badge>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <BadgeIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Employee ID:</span>
                    <span>{employee.employee_id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Designation:</span>
                    <span>{employee.designation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Department:</span>
                    <span>{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{employee.phone}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Gender:</span>
                    <span>{employee.gender}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span>{employee.date_of_birth}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Joining Date:</span>
                    <span>{employee.date_of_joining}</span>
                  </div>
                   <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Work Location:</span>
                    <span>{employee.work_location || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BadgeIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Blood Group:</span>
                    <span>{employee.blood_group || "N/A"}</span>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Emergency Contact</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Name:</span>
                    <span>{employee.emergency_contact_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{employee.emergency_contact}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="attendance" className="space-y-2">
              <EmployeeAttendance employeeId={parseInt(employeeId || '0', 10)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDetailPage;
