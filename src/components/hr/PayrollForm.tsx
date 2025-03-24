
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type PayrollFormProps = {
  employeeId: number;
  existingData?: {
    id?: string;
    employee_id: number;
    salary: number;
    last_updated?: string;
  } | null;
  onSave: () => void;
  onCancel: () => void;
};

const PayrollForm = ({ employeeId, existingData, onSave, onCancel }: PayrollFormProps) => {
  const [salary, setSalary] = useState<number>(existingData?.salary || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (existingData?.id) {
        // Update existing record
        const { error } = await supabase
          .from('employee_payroll')
          .update({
            salary,
            last_updated: new Date().toISOString()
          })
          .eq('id', existingData.id);

        if (error) throw error;
        toast.success('Payroll updated successfully');
      } else {
        // Insert new record
        const { error } = await supabase
          .from('employee_payroll')
          .insert({
            employee_id: employeeId,
            salary,
            last_updated: new Date().toISOString()
          });

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
