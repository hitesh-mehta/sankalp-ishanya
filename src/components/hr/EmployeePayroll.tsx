import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Edit, Save, X, CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

type EmployeePayrollProps = {
  employeeId: number;
};

type PayrollData = {
  employee_id: number;
  current_salary: number;
  last_paid: string | null;
};

const EmployeePayroll = ({ employeeId }: EmployeePayrollProps) => {
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PayrollData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPayrollData = async () => {
      if (!employeeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: payrollError } = await supabase
          .from('employee_payroll')
          .select('*')
          .eq('employee_id', employeeId)
          .single();
          
        if (payrollError) {
          if (payrollError.code === 'PGRST116') {
            setPayrollData({
              employee_id: employeeId,
              current_salary: 0,
              last_paid: null
            });
            setFormData({
              employee_id: employeeId,
              current_salary: 0,
              last_paid: null
            });
          } else {
            console.error('Error fetching payroll data:', payrollError);
            setError('Could not load payroll information');
          }
          return;
        }
        
        setPayrollData(data as PayrollData);
        setFormData(data as PayrollData);
      } catch (error) {
        console.error('Error in fetchPayrollData:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayrollData();
  }, [employeeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'current_salary' ? parseFloat(value) : value
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!formData || !date) return;
    
    setFormData({
      ...formData,
      last_paid: format(date, 'yyyy-MM-dd')
    });
  };

  const handleSave = async () => {
    if (!formData) return;
    
    try {
      setLoading(true);
      
      const { data: existingData, error: checkError } = await supabase
        .from('employee_payroll')
        .select('*')
        .eq('employee_id', employeeId);
        
      if (checkError) {
        console.error('Error checking payroll record:', checkError);
        toast({
          title: "Error",
          description: "Failed to update payroll information",
          variant: "destructive",
        });
        return;
      }
      
      let error;
      
      if (existingData && existingData.length > 0) {
        const { error: updateError } = await supabase
          .from('employee_payroll')
          .update({
            current_salary: formData.current_salary,
            last_paid: formData.last_paid
          })
          .eq('employee_id', employeeId);
          
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('employee_payroll')
          .insert({
            employee_id: employeeId,
            current_salary: formData.current_salary,
            last_paid: formData.last_paid
          });
          
        error = insertError;
      }
      
      if (error) {
        console.error('Error saving payroll data:', error);
        toast({
          title: "Error",
          description: "Failed to save payroll information",
          variant: "destructive",
        });
        return;
      }
      
      setPayrollData(formData);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Payroll information updated successfully",
      });
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
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

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle>Payroll Information</CardTitle>
          <Button 
            variant={isEditing ? "outline" : "default"} 
            size="sm"
            onClick={() => {
              if (isEditing) {
                setFormData(payrollData);
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
        </div>
      </CardHeader>
      <CardContent>
        {isEditing && formData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_salary">Current Salary (INR)</Label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                  <Input
                    id="current_salary"
                    name="current_salary"
                    type="number"
                    className="pl-8"
                    value={formData.current_salary || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="last_paid">Last Paid Date</Label>
                <div className="mt-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.last_paid && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.last_paid 
                          ? format(new Date(formData.last_paid), 'PPP') 
                          : "Select date"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.last_paid ? new Date(formData.last_paid) : undefined}
                        onSelect={handleDateChange}
                        className="pointer-events-auto"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Salary</h3>
              <p className="text-2xl font-semibold">₹ {payrollData?.current_salary?.toLocaleString() || '0'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Paid Date</h3>
              <p className="text-2xl font-semibold">
                {payrollData?.last_paid 
                  ? format(new Date(payrollData.last_paid), 'PP') 
                  : 'Not recorded'
                }
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeePayroll;
