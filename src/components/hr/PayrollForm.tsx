import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

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
        last_paid: lastPaidDate ? lastPaidDate.toISOString().split("T")[0] : null,
      };

      if (existingData?.id) {
        const { error } = await supabase.from("employee_payroll").update(payrollData).eq("id", existingData.id);
        if (error) throw error;
        toast.success("Payroll updated successfully");
      } else {
        const { error } = await supabase.from("employee_payroll").insert([payrollData]);
        if (error) throw error;
        toast.success("Payroll information added successfully");
      }

      onSave();
    } catch (error: any) {
      console.error("Error saving payroll data:", error);
      toast.error(error.message || "Failed to save payroll data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="salary" className="text-base font-medium">
              Salary Amount
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value ? Number(e.target.value) : 0)}
                min="0"
                placeholder="Enter employee salary"
                className="pl-10 text-lg"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="lastPaidDate" className="text-base font-medium">
              Last Paid Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="lastPaidDate"
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal text-base py-6", !lastPaidDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-3 h-5 w-5" />
                  {lastPaidDate ? <span className="text-base">{format(lastPaidDate, "PPP")}</span> : <span className="text-base">Select payment date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white shadow-lg rounded-lg"
                side="bottom"
                align="center"
                sideOffset={5}
                avoidCollisions={true}
                style={{
                  maxHeight: "250px", // Limits the height to 250px
                  overflowY: "auto", // Enables vertical scrolling
                }}
              >
                <div className="max-h-[250px] overflow-y-auto">
                  <Calendar mode="single" selected={lastPaidDate} onSelect={(date) => date && setLastPaidDate(date)} initialFocus />
                </div>
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground mt-1">This is the date when the employee was last paid their salary</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-6">
              {isSubmitting ? "Saving..." : existingData ? "Update Payroll" : "Save Payroll"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PayrollForm;
