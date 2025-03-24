
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';

type AttendanceTrackerProps = {
  students: any[];
};

const AttendanceTracker = ({ students }: AttendanceTrackerProps) => {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendance, setAttendance] = useState<'present' | 'absent'>('present');
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [present, setPresent] = useState<Date[]>([]);
  const [absent, setAbsent] = useState<Date[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedStudent) return;
      
      try {
        setAttendanceLoading(true);
        
        const { data, error } = await supabase
          .from('student_attendance')
          .select('*')
          .eq('student_id', selectedStudent.student_id)
          .order('date', { ascending: false });
          
        if (error) {
          console.error('Error fetching attendance:', error);
          return;
        }
        
        setAttendanceRecords(data || []);
        
        // Separate into present and absent dates
        const presentDates: Date[] = [];
        const absentDates: Date[] = [];
        
        data?.forEach((record: any) => {
          const date = new Date(record.date);
          if (record.attendance === true) {
            presentDates.push(date);
          } else if (record.attendance === false) {
            absentDates.push(date);
          }
        });
        
        setPresent(presentDates);
        setAbsent(absentDates);
      } catch (error) {
        console.error('Error in fetchAttendance:', error);
      } finally {
        setAttendanceLoading(false);
      }
    };
    
    fetchAttendance();
  }, [selectedStudent]);

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedDate) {
      toast({
        title: "Missing information",
        description: "Please select a student and date",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Check if there's already an attendance record for this date
      const { data: existingRecord, error: checkError } = await supabase
        .from('student_attendance')
        .select('*')
        .eq('student_id', selectedStudent.student_id)
        .eq('date', formattedDate);
        
      if (checkError) {
        console.error('Error checking existing record:', checkError);
        toast({
          title: "Error",
          description: "Could not check for existing attendance record",
          variant: "destructive",
        });
        return;
      }
      
      let result;
      
      if (existingRecord && existingRecord.length > 0) {
        // Update existing record
        result = await supabase
          .from('student_attendance')
          .update({
            attendance: attendance === 'present'
          })
          .eq('student_id', selectedStudent.student_id)
          .eq('date', formattedDate);
      } else {
        // Insert new record
        result = await supabase
          .from('student_attendance')
          .insert({
            student_id: selectedStudent.student_id,
            date: formattedDate,
            attendance: attendance === 'present',
            program_id: selectedStudent.program_id
          });
      }
      
      if (result.error) {
        console.error('Error saving attendance:', result.error);
        toast({
          title: "Error",
          description: "Could not save attendance record",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: `Marked ${selectedStudent.first_name} as ${attendance} on ${format(selectedDate, 'PP')}`,
      });
      
      // Refresh attendance records
      const { data: updatedRecords, error: fetchError } = await supabase
        .from('student_attendance')
        .select('*')
        .eq('student_id', selectedStudent.student_id)
        .order('date', { ascending: false });
        
      if (fetchError) {
        console.error('Error fetching updated records:', fetchError);
      } else {
        setAttendanceRecords(updatedRecords || []);
        
        // Update present and absent arrays for calendar
        const presentDates: Date[] = [];
        const absentDates: Date[] = [];
        
        updatedRecords?.forEach((record: any) => {
          const date = new Date(record.date);
          if (record.attendance === true) {
            presentDates.push(date);
          } else if (record.attendance === false) {
            absentDates.push(date);
          }
        });
        
        setPresent(presentDates);
        setAbsent(absentDates);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Select Student
                  </label>
                  <Select 
                    value={selectedStudent?.student_id?.toString()} 
                    onValueChange={(value) => {
                      const student = students.find(s => s.student_id.toString() === value);
                      setSelectedStudent(student);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem 
                          key={student.student_id} 
                          value={student.student_id.toString()}
                        >
                          {student.first_name} {student.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Mark Attendance As
                  </label>
                  <div className="flex">
                    <Button
                      type="button"
                      variant={attendance === 'present' ? 'default' : 'outline'}
                      className="flex items-center rounded-r-none flex-1"
                      onClick={() => setAttendance('present')}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Present
                    </Button>
                    <Button
                      type="button"
                      variant={attendance === 'absent' ? 'default' : 'outline'}
                      className="flex items-center rounded-l-none flex-1"
                      onClick={() => setAttendance('absent')}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Absent
                    </Button>
                  </div>
                </div>
                
                <div className="md:flex-none">
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'Save Attendance'}
                  </Button>
                </div>
              </div>
              
              {selectedStudent && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">
                      {selectedStudent.first_name} {selectedStudent.last_name}'s Attendance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select a date to mark attendance
                    </p>
                  </div>
                  
                  {attendanceLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : (
                    <div>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="mx-auto"
                        modifiers={{
                          present: present,
                          absent: absent,
                        }}
                        modifiersStyles={{
                          present: {
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                          },
                          absent: {
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            textDecoration: 'line-through',
                          },
                        }}
                      />
                      <div className="mt-4 flex justify-center gap-4">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-green-100 mr-1"></div>
                          <span className="text-sm">Present</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-red-100 mr-1"></div>
                          <span className="text-sm">Absent</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
            {attendanceLoading ? (
              <LoadingSpinner />
            ) : attendanceRecords.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No attendance records found
              </p>
            ) : (
              <div className="space-y-3">
                {attendanceRecords.slice(0, 10).map((record) => (
                  <div 
                    key={`${record.student_id}-${record.date}`}
                    className={`p-3 rounded-md flex items-center justify-between ${
                      record.attendance === true ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center">
                      {record.attendance === true ? (
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-600 mr-2" />
                      )}
                      <span>
                        {format(new Date(record.date), 'PP')}
                      </span>
                    </div>
                    <span className={record.attendance === true ? 'text-green-600' : 'text-red-600'}>
                      {record.attendance === true ? 'Present' : 'Absent'}
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

export default AttendanceTracker;
