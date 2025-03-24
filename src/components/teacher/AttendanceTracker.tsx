
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';

type Student = {
  id: number;
  student_id: number;
  first_name: string;
  last_name: string;
  program_id: number;
  center_id: number;
};

type AttendanceRecord = {
  id: number;
  student_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
};

type AttendanceTrackerProps = {
  students: Student[];
};

const AttendanceTracker = ({ students }: AttendanceTrackerProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, AttendanceRecord>>({});
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [view, setView] = useState<'daily' | 'monthly'>('daily');
  const [month, setMonth] = useState<Date>(new Date());
  const [monthlyAttendance, setMonthlyAttendance] = useState<Record<string, Record<number, string>>>({});
  const user = getCurrentUser();
  const { toast } = useToast();

  const statusOptions = [
    { label: 'Present', value: 'present', color: 'bg-green-100 text-green-800' },
    { label: 'Absent', value: 'absent', color: 'bg-red-100 text-red-800' },
    { label: 'Late', value: 'late', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Excused', value: 'excused', color: 'bg-blue-100 text-blue-800' },
  ];

  // Fetch daily attendance for selected date
  useEffect(() => {
    if (students.length === 0 || !user) return;
    
    const fetchAttendance = async () => {
      setLoading(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('date', formattedDate);
          
        if (error) {
          console.error('Error fetching attendance:', error);
          toast({
            title: "Error",
            description: "Failed to load attendance records",
            variant: "destructive",
          });
          return;
        }
        
        const records: Record<number, AttendanceRecord> = {};
        
        // Process fetched attendance records
        data?.forEach(record => {
          records[record.student_id] = record;
        });
        
        setAttendanceRecords(records);
        setAttendance(data || []);
      } catch (error) {
        console.error('Error in fetchAttendance:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, [date, students, user, toast]);

  // Fetch monthly attendance when the month changes or the view is set to monthly
  useEffect(() => {
    if (view !== 'monthly' || students.length === 0 || !user) return;
    
    const fetchMonthlyAttendance = async () => {
      setLoading(true);
      const year = month.getFullYear();
      const monthNumber = month.getMonth() + 1;
      
      try {
        // Get start and end dates for the selected month
        const startDate = `${year}-${monthNumber.toString().padStart(2, '0')}-01`;
        const lastDay = new Date(year, monthNumber, 0).getDate();
        const endDate = `${year}-${monthNumber.toString().padStart(2, '0')}-${lastDay}`;
        
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate);
          
        if (error) {
          console.error('Error fetching monthly attendance:', error);
          toast({
            title: "Error",
            description: "Failed to load monthly attendance records",
            variant: "destructive",
          });
          return;
        }
        
        // Process the monthly attendance data
        const monthData: Record<string, Record<number, string>> = {};
        
        data?.forEach(record => {
          if (!monthData[record.date]) {
            monthData[record.date] = {};
          }
          monthData[record.date][record.student_id] = record.status;
        });
        
        setMonthlyAttendance(monthData);
      } catch (error) {
        console.error('Error in fetchMonthlyAttendance:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMonthlyAttendance();
  }, [month, view, students, user, toast]);

  const handleUpdateAttendance = async (studentId: number, status: 'present' | 'absent' | 'late' | 'excused') => {
    if (!user) return;
    
    setLoading(true);
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    try {
      const existingRecord = attendanceRecords[studentId];
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({
            status,
            updated_by: user.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRecord.id);
          
        if (error) {
          console.error('Error updating attendance:', error);
          toast({
            title: "Error",
            description: "Failed to update attendance record",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('attendance')
          .insert({
            student_id: studentId,
            date: formattedDate,
            status,
            created_by: user.email,
            updated_by: user.email,
          });
          
        if (error) {
          console.error('Error creating attendance record:', error);
          toast({
            title: "Error",
            description: "Failed to create attendance record",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Refresh attendance records
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', formattedDate);
        
      if (error) {
        console.error('Error refreshing attendance:', error);
        return;
      }
      
      const records: Record<number, AttendanceRecord> = {};
      data?.forEach(record => {
        records[record.student_id] = record;
      });
      
      setAttendanceRecords(records);
      setAttendance(data || []);
      
      toast({
        title: "Success",
        description: "Attendance record updated",
        variant: "default",
      });
    } catch (error) {
      console.error('Error in handleUpdateAttendance:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getAttendanceStatus = (studentId: number) => {
    return attendanceRecords[studentId]?.status || '';
  };
  
  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateDaysArray = () => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const daysInMonth = getDaysInMonth(year, monthIndex);
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <CardTitle>Attendance Tracker</CardTitle>
          <div className="flex gap-2">
            <Tabs 
              value={view} 
              onValueChange={(v) => setView(v as 'daily' | 'monthly')} 
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Students Found</AlertTitle>
            <AlertDescription>
              You don't have any students assigned to you yet.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {view === 'daily' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="bg-white rounded-md shadow-sm border p-4">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => newDate && setDate(newDate)}
                      className="bg-white rounded-md"
                    />
                    <div className="mt-4 text-center">
                      <h3 className="font-medium text-gray-900">Selected Date</h3>
                      <p className="text-gray-500">{format(date, 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>{student.student_id}</TableCell>
                              <TableCell>{student.first_name} {student.last_name}</TableCell>
                              <TableCell>
                                {getAttendanceStatus(student.student_id) ? (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getAttendanceStatus(student.student_id))}`}>
                                    {getAttendanceStatus(student.student_id).charAt(0).toUpperCase() + getAttendanceStatus(student.student_id).slice(1)}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Not Recorded
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-2">
                                  {statusOptions.map((option) => (
                                    <Button
                                      key={option.value}
                                      variant="outline"
                                      size="sm"
                                      className={`${getAttendanceStatus(student.student_id) === option.value ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                                      onClick={() => handleUpdateAttendance(student.student_id, option.value as 'present' | 'absent' | 'late' | 'excused')}
                                    >
                                      {option.label}
                                    </Button>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                    <Select
                      value={month.getMonth().toString()}
                      onValueChange={(value) => {
                        const newDate = new Date(month);
                        newDate.setMonth(parseInt(value));
                        setMonth(newDate);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">January</SelectItem>
                        <SelectItem value="1">February</SelectItem>
                        <SelectItem value="2">March</SelectItem>
                        <SelectItem value="3">April</SelectItem>
                        <SelectItem value="4">May</SelectItem>
                        <SelectItem value="5">June</SelectItem>
                        <SelectItem value="6">July</SelectItem>
                        <SelectItem value="7">August</SelectItem>
                        <SelectItem value="8">September</SelectItem>
                        <SelectItem value="9">October</SelectItem>
                        <SelectItem value="10">November</SelectItem>
                        <SelectItem value="11">December</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={month.getFullYear().toString()}
                      onValueChange={(value) => {
                        const newDate = new Date(month);
                        newDate.setFullYear(parseInt(value));
                        setMonth(newDate);
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                          (year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="overflow-x-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead sticky>Student</TableHead>
                          {generateDaysArray().map((day) => (
                            <TableHead key={day}>{parseInt(day.split('-')[2])}</TableHead>
                          ))}
                          <TableHead sticky>Summary</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => {
                          const days = generateDaysArray();
                          const summary = {
                            present: 0,
                            absent: 0,
                            late: 0,
                            excused: 0,
                            total: days.length,
                          };
                          
                          days.forEach(day => {
                            const status = monthlyAttendance[day]?.[student.student_id];
                            if (status) {
                              summary[status as keyof typeof summary]++;
                            }
                          });
                          
                          const attendanceRate = summary.total > 0 
                            ? ((summary.present + summary.excused) / summary.total * 100).toFixed(1) 
                            : '0.0';
                          
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">
                                {student.first_name} {student.last_name}
                              </TableCell>
                              {days.map((day) => {
                                const status = monthlyAttendance[day]?.[student.student_id];
                                let icon = null;
                                
                                if (status === 'present') {
                                  icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
                                } else if (status === 'absent') {
                                  icon = <XCircle className="h-5 w-5 text-red-500" />;
                                } else if (status === 'late') {
                                  icon = <AlertCircle className="h-5 w-5 text-yellow-500" />;
                                } else if (status === 'excused') {
                                  icon = <AlertCircle className="h-5 w-5 text-blue-500" />;
                                }
                                
                                return (
                                  <TableCell key={day} className="text-center">
                                    {icon || (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </TableCell>
                                );
                              })}
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{attendanceRate}%</span>
                                  <span className="text-xs text-gray-500">
                                    P: {summary.present}, A: {summary.absent}, L: {summary.late}, E: {summary.excused}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceTracker;
