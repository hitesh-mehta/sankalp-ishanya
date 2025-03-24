
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format, getDaysInMonth, getMonth, getYear, isValid, parse, startOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

type EmployeeAttendanceProps = {
  employeeId: number;
};

type AttendanceRecord = {
  date: string;
  attendance: boolean;
  employee_id: number;
};

const EmployeeAttendance = ({ employeeId }: EmployeeAttendanceProps) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presentDates, setPresentDates] = useState<Date[]>([]);
  const [absentDates, setAbsentDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Get current year
  const currentYear = new Date().getFullYear();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchAttendance = async () => {
    if (!employeeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching attendance for employee ID:', employeeId);
      
      // Fetch attendance for the current year
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;
      
      const { data, error: attendanceError } = await supabase
        .from('employee_attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
        
      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
        setError('Could not load attendance records');
        return;
      }
      
      console.log('Attendance data received:', data);
      
      setAttendanceRecords(data as AttendanceRecord[] || []);
      
      // Create arrays of dates where employee was present or absent
      const presentDatesArray = (data as AttendanceRecord[])
        .filter(record => record.attendance === true)
        .map(record => {
          const parsedDate = parse(record.date, 'yyyy-MM-dd', new Date());
          return isValid(parsedDate) ? parsedDate : null;
        })
        .filter((date): date is Date => date !== null);
      
      const absentDatesArray = (data as AttendanceRecord[])
        .filter(record => record.attendance === false)
        .map(record => {
          const parsedDate = parse(record.date, 'yyyy-MM-dd', new Date());
          return isValid(parsedDate) ? parsedDate : null;
        })
        .filter((date): date is Date => date !== null);
      
      setPresentDates(presentDatesArray);
      setAbsentDates(absentDatesArray);
    } catch (error) {
      console.error('Error in fetchAttendance:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [employeeId]);

  // Group attendance records by month
  const groupedByMonth: { [key: string]: AttendanceRecord[] } = {};
  
  attendanceRecords.forEach(record => {
    const date = new Date(record.date);
    const monthKey = format(date, 'MMMM');
    
    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = [];
    }
    
    groupedByMonth[monthKey].push(record);
  });

  // Calculate attendance percentage for each month
  const calculateAttendancePercentage = (monthRecords: AttendanceRecord[], monthName: string) => {
    const monthIndex = months.findIndex(m => m === monthName);
    const daysInMonth = getDaysInMonth(new Date(currentYear, monthIndex));
    const presentDays = monthRecords.filter(record => record.attendance).length;
    
    return (presentDays / daysInMonth) * 100;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (isEditing && date) {
      toggleAttendance(date);
    }
  };

  const toggleAttendance = async (date: Date) => {
    if (!employeeId) return;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    const existingRecord = attendanceRecords.find(record => record.date === formattedDate);
    
    try {
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('employee_attendance')
          .update({ attendance: !existingRecord.attendance })
          .eq('employee_id', employeeId)
          .eq('date', formattedDate);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('employee_attendance')
          .insert({
            employee_id: employeeId,
            date: formattedDate,
            attendance: true
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Attendance updated",
        description: "The attendance record has been updated successfully."
      });
      
      // Refetch to get updated data
      fetchAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance record.",
        variant: "destructive"
      });
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setSelectedDate(undefined);
  };

  const isDatePresentOrAbsent = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const record = attendanceRecords.find(rec => rec.date === formattedDate);
    if (!record) return null;
    return record.attendance ? 'present' : 'absent';
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attendance Calendar ({currentYear})</CardTitle>
          <Button 
            variant={isEditing ? "default" : "outline"} 
            onClick={toggleEditMode}
          >
            {isEditing ? "Save" : "Edit Attendance"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              {isEditing ? (
                <div className="mb-2 text-sm text-muted-foreground">
                  Click on a date to toggle attendance status
                </div>
              ) : null}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
                disabled={(date) => 
                  getYear(date) !== currentYear || 
                  date > new Date()
                }
                modifiers={{
                  present: presentDates,
                  absent: absentDates
                }}
                modifiersStyles={{
                  present: {
                    color: 'green',
                    fontWeight: 'bold'
                  },
                  absent: {
                    color: 'red',
                    textDecoration: 'line-through'
                  }
                }}
                components={{
                  DayContent: (props) => {
                    const status = isDatePresentOrAbsent(props.date);
                    return (
                      <div className="relative flex h-8 w-8 items-center justify-center">
                        {props.children}
                        {status === 'present' && (
                          <div className="absolute bottom-1 h-1 w-1 rounded-full bg-green-500"></div>
                        )}
                        {status === 'absent' && (
                          <div className="absolute bottom-1 h-1 w-1 rounded-full bg-red-500"></div>
                        )}
                      </div>
                    );
                  }
                }}
              />
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center gap-1">
                  <X className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Absent</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-4">Monthly Attendance</h3>
              
              {Object.keys(groupedByMonth).length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {months.map((month) => {
                    const records = groupedByMonth[month] || [];
                    const attendancePercentage = records.length > 0 
                      ? calculateAttendancePercentage(records, month) 
                      : 0;
                    
                    return (
                      <AccordionItem key={month} value={month}>
                        <AccordionTrigger className="hover:bg-muted/50 px-4 py-2 rounded-md">
                          <div className="flex justify-between items-center w-full pr-2">
                            <span>{month}</span>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden"
                                title={`${attendancePercentage.toFixed(0)}% attendance`}
                              >
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${attendancePercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {attendancePercentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-4 mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                            {records.length > 0 ? (
                              records.map((record) => (
                                <div 
                                  key={record.date} 
                                  className={`text-sm p-2 rounded-md flex items-center gap-1.5 ${
                                    record.attendance === true ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                  }`}
                                >
                                  {record.attendance === true ? 
                                    <Check className="h-3 w-3" /> : 
                                    <X className="h-3 w-3" />
                                  }
                                  {format(new Date(record.date), 'd MMM')}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No attendance records for {month}</p>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">No attendance records available for {currentYear}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAttendance;
