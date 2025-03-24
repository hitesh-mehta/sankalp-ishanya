
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, DollarSign, CalendarClock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PayrollForm from './PayrollForm';
import { format } from 'date-fns';

type EmployeePayrollProps = {
  employeeId: number;
};

type PayrollData = {
  employee_id: number;
  current_salary: number;
  last_paid?: string;
};

const EmployeePayroll = ({ employeeId }: EmployeePayrollProps) => {
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employee_payroll')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching payroll data:', error);
      }

      setPayrollData(data);
    } catch (error) {
      console.error('Error in fetchPayrollData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchPayrollData();
    }
  }, [employeeId]);

  const handleEditPayroll = () => {
    setShowEditDialog(true);
  };

  const handleDialogClose = () => {
    setShowEditDialog(false);
  };

  const handlePayrollSaved = () => {
    fetchPayrollData();
    setShowEditDialog(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not recorded';
    return format(new Date(dateString), 'PPP');
  };

  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
        <CardTitle className="text-lg font-medium flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-primary" />
          Payroll Information
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleEditPayroll} className="hover:bg-slate-200">
          <Edit className="h-4 w-4 mr-2" />
          {payrollData ? 'Edit' : 'Add'}
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : payrollData ? (
          <div className="space-y-8">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Salary</p>
                <p className="text-2xl font-bold">{formatCurrency(payrollData.current_salary)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <CalendarClock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Paid Date</p>
                <p className="text-lg font-medium">{formatDate(payrollData.last_paid)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex justify-center items-center p-4 bg-primary/10 rounded-full mb-4">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No payroll information</h3>
            <p className="text-muted-foreground mb-4">
              No payroll records have been added for this employee yet.
            </p>
            <Button 
              onClick={handleEditPayroll} 
              className="mt-2"
              size="lg"
            >
              Add Payroll Details
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {payrollData ? 'Edit Payroll Information' : 'Add Payroll Information'}
            </DialogTitle>
          </DialogHeader>
          <PayrollForm
            employeeId={employeeId}
            existingData={payrollData}
            onSave={handlePayrollSaved}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmployeePayroll;
