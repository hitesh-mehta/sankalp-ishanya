
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, IndianRupee, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// Define months array with proper typing
type Month = {
  value: number;
  label: string;
};

const months: Month[] = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const PayrollForm = ({ employeeId, existingData, onSave, onCancel }: PayrollFormProps) => {
  const [salary, setSalary] = useState<number>(existingData?.current_salary || 0);
  const [lastPaidDate, setLastPaidDate] = useState<Date | undefined>(
    existingData?.last_paid ? new Date(existingData.last_paid) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fix the calendar month state with explicit Date type
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    new Date(lastPaidDate || new Date())
  );

  // Generate years for the year dropdown (past 15 years to future 15 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 31 }, (_, i) => currentYear - 15 + i);

  // Fix the handleYearChange function with explicit types
  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    const newDate = new Date(calendarMonth);
    newDate.setFullYear(year);
    setCalendarMonth(new Date(newDate));
  };

  // Fix the handleMonthChange function with explicit types
  const handleMonthChange = (monthStr: string) => {
    const month = parseInt(monthStr, 10);
    const newDate = new Date(calendarMonth);
    newDate.setMonth(month);
    setCalendarMonth(new Date(newDate));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCalendarMonth(new Date(newDate));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payrollData = {
        employee_id: employeeId,
        current_salary: salary,
        last_paid: lastPaidDate ? lastPaidDate.toISOString().split('T')[0] : null
      };

      if (existingData?.id) {
        // Update existing record
        const { error } = await supabase
          .from('employee_payroll')
          .update(payrollData)
          .eq('id', existingData.id);

        if (error) throw error;
        toast.success('Payroll updated successfully');
      } else {
        // Insert new record - don't check for existing records, allowing multiple entries
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
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="salary" className="text-base font-medium">Salary Amount</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                min="0"
                placeholder="Enter employee salary"
                className="pl-10 text-lg"
                required
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="lastPaidDate" className="text-base font-medium">Last Paid Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="lastPaidDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-base py-6",
                    !lastPaidDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5" />
                  {lastPaidDate ? (
                    <span className="text-base">{format(lastPaidDate, "PPP")}</span>
                  ) : (
                    <span className="text-base">Select payment date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                <div className="p-3 space-y-3">
                  {/* Improved Month/Year Navigation */}
                  <div className="flex items-center justify-between mb-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => navigateMonth('prev')}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Select
                        value={calendarMonth.getMonth().toString()}
                        onValueChange={handleMonthChange}
                      >
                        <SelectTrigger className="h-8 w-[110px]">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50" position="popper">
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value.toString()}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={calendarMonth.getFullYear().toString()}
                        onValueChange={handleYearChange}
                      >
                        <SelectTrigger className="h-8 w-[80px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50 max-h-[200px]" position="popper">
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => navigateMonth('next')}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Calendar
                    mode="single"
                    selected={lastPaidDate}
                    onSelect={setLastPaidDate}
                    initialFocus
                    month={calendarMonth}
                    onMonthChange={(newMonth) => setCalendarMonth(new Date(newMonth))}
                    className="rounded-md border shadow-lg pointer-events-auto"
                  />
                </div>
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground mt-1">
              This is the date when the employee was last paid their salary
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? 'Saving...' : existingData ? 'Update Payroll' : 'Save Payroll'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PayrollForm;
