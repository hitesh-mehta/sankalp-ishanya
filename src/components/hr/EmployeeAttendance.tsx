
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format, getDaysInMonth, getMonth, getYear, isValid, parse, startOfMonth } from 'date-fns';

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

  // Get current year
  const currentYear = new Date().getFullYear();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!employeeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
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
        
        setAttendanceRecords(data as AttendanceRecord[] || []);
        
        // Create array of dates where employee was present
        const presentDatesArray = (data as AttendanceRecord[])
          .filter(record => record.attendance === true)
          .map(record => {
            const parsedDate = parse(record.date, 'yyyy-MM-dd', new Date());
            return isValid(parsedDate) ? parsedDate : null;
          })
          .filter((date): date is Date => date !== null);
        
        setPresentDates(presentDatesArray);
      } catch (error) {
        console.error('Error in fetchAttendance:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, [employeeId, currentYear]);

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
        <CardHeader>
          <CardTitle>Attendance Calendar ({currentYear})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <Calendar
                mode="multiple"
                selected={presentDates}
                className="rounded-md border"
                disabled={(date) => 
                  getYear(date) !== currentYear || 
                  date > new Date()
                }
                readOnly
              />
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                  <span className="text-sm">Present</span>
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
                                    record.attendance ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                  }`}
                                >
                                  {record.attendance && <Check className="h-3 w-3" />}
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
