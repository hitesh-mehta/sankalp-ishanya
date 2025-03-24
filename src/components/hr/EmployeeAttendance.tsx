
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, X, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

type AttendanceRecord = {
  employee_id: number;
  date: string;
  attendance: boolean;
};

type EmployeeAttendanceProps = {
  employeeId: number;
};

const EmployeeAttendance = ({ employeeId }: EmployeeAttendanceProps) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendance, setAttendance] = useState<boolean>(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [presentDates, setPresentDates] = useState<Date[]>([]);
  const [absentDates, setAbsentDates] = useState<Date[]>([]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [employeeId]);

  const fetchAttendanceRecords = async () => {
    if (!employeeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching attendance for employee ID:', employeeId);
      
      const { data, error: fetchError } = await supabase
        .from('employee_attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .order('date', { ascending: false });
        
      if (fetchError) {
        console.error('Error fetching attendance:', fetchError);
        setError('Could not load attendance records');
        return;
      }
      
      console.log('Attendance data received:', data);
      setAttendanceRecords(data || []);
      
      // Process dates for calendar display
      const present: Date[] = [];
      const absent: Date[] = [];
      
      data?.forEach((record: AttendanceRecord) => {
        const recordDate = new Date(record.date);
        if (record.attendance) {
          present.push(recordDate);
        } else {
          absent.push(recordDate);
        }
      });
      
      setPresentDates(present);
      setAbsentDates(absent);
      
    } catch (err) {
      console.error('Error in fetchAttendanceRecords:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveAttendance = async () => {
    if (!employeeId || !selectedDate) return;
    
    try {
      setSavingAttendance(true);
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Check if a record already exists for this date
      const { data: existingData, error: checkError } = await supabase
        .from('employee_attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', formattedDate);
        
      if (checkError) {
        console.error('Error checking existing record:', checkError);
        toast.error('Failed to check existing attendance record');
        return;
      }
      
      let error;
      
      if (existingData && existingData.length > 0) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('employee_attendance')
          .update({ attendance })
          .eq('employee_id', employeeId)
          .eq('date', formattedDate);
          
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('employee_attendance')
          .insert({
            employee_id: employeeId,
            date: formattedDate,
            attendance
          });
          
        error = insertError;
      }
      
      if (error) {
        console.error('Error saving attendance:', error);
        toast.error('Failed to save attendance record');
        return;
      }
      
      toast.success(`Attendance marked as ${attendance ? 'Present' : 'Absent'} for ${format(selectedDate, 'PP')}`);
      fetchAttendanceRecords(); // Refresh data
      
    } catch (err) {
      console.error('Error in handleSaveAttendance:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setSavingAttendance(false);
    }
  };

  // Custom day renderer for the calendar
  const customDayRenderer = (props: any, date: Date) => {
    // Check if the date is in presentDates or absentDates
    const isPresent = presentDates.some(
      d => d.getDate() === date.getDate() && 
          d.getMonth() === date.getMonth() && 
          d.getFullYear() === date.getFullYear()
    );
    
    const isAbsent = absentDates.some(
      d => d.getDate() === date.getDate() && 
          d.getMonth() === date.getMonth() && 
          d.getFullYear() === date.getFullYear()
    );
    
    return (
      <div 
        {...props}
        className={cn(
          props.className,
          isPresent && 'bg-green-100 text-green-800 font-semibold hover:bg-green-200',
          isAbsent && 'bg-red-100 text-red-800 font-semibold hover:bg-red-200'
        )}
      >
        {date.getDate()}
      </div>
    );
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex flex-col space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Mark Attendance</h3>
                    <div className="flex space-x-2 mb-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 justify-start text-left"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            components={{
                              Day: ({ date, ...props }) => customDayRenderer(props, date)
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex space-x-2 mb-4">
                      <Button
                        variant={attendance ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setAttendance(true)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Present
                      </Button>
                      <Button
                        variant={!attendance ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setAttendance(false)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Absent
                      </Button>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleSaveAttendance}
                      disabled={savingAttendance}
                    >
                      {savingAttendance ? <LoadingSpinner size="sm" /> : 'Save Attendance'}
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Legend</h3>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-100 rounded-full mr-2"></div>
                        <span className="text-sm">Present</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-100 rounded-full mr-2"></div>
                        <span className="text-sm">Absent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  components={{
                    Day: ({ date, ...props }) => customDayRenderer(props, date)
                  }}
                  className="rounded-md border"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceRecords.length === 0 ? (
              <p className="text-center text-muted-foreground">No attendance records found</p>
            ) : (
              <div className="space-y-3">
                {attendanceRecords.slice(0, 10).map((record, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-3 rounded-md flex items-center justify-between",
                      record.attendance ? "bg-green-50" : "bg-red-50"
                    )}
                  >
                    <div className="flex items-center">
                      {record.attendance ? (
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-600 mr-2" />
                      )}
                      <span>{format(new Date(record.date), 'PP')}</span>
                    </div>
                    <span className={cn(
                      record.attendance ? "text-green-600" : "text-red-600"
                    )}>
                      {record.attendance ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
