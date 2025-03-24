
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type PayrollFormProps = {
  employeeId: number;
  existingData?: {
    id?: string;
    employee_id: number;
    current_salary: number;
    last_paid?: string;
  } | null;
  onSave: () => void;
  onCancel: () => void;
};

const PayrollForm = ({ employeeId, existingData, onSave, onCancel }: PayrollFormProps) => {
  const [salary, setSalary] = useState<number>(existingData?.current_salary || 0);
  const [lastPaidDate, setLastPaidDate] = useState<Date | undefined>(
    existingData?.last_paid ? new Date(existingData.last_paid) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payrollData = {
        employee_id: employeeId,
        current_salary: salary,
        last_paid: lastPaidDate ? lastPaidDate.toISOString().split('T')[0] : null
      };

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('employee_payroll')
          .update(payrollData)
          .eq('employee_id', employeeId);

        if (error) throw error;
        toast.success('Payroll updated successfully');
      } else {
        // Insert new record
        const { error } = await supabase
          .from('employee_payroll')
          .insert(payrollData);

        if (error) throw error;
        toast.success('Payroll information added successfully');
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving payroll data:', error);
      toast.error(error.message || 'Failed to save payroll data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="salary">Salary Amount</Label>
        <Input
          id="salary"
          type="number"
          value={salary}
          onChange={(e) => setSalary(Number(e.target.value))}
          min="0"
          step="1000"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="lastPaidDate">Last Paid Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="lastPaidDate"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !lastPaidDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {lastPaidDate ? format(lastPaidDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={lastPaidDate}
              onSelect={setLastPaidDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default PayrollForm;
