
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type EmployeeFormProps = {
  employee: any;
  onSave: (updatedEmployee: any) => void;
  onCancel: () => void;
};

const EmployeeForm = ({ employee, onSave, onCancel }: EmployeeFormProps) => {
  const [formData, setFormData] = useState({ ...employee });
  const [centers, setCenters] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCentersAndPrograms = async () => {
      setLoading(true);
      try {
        // Fetch centers
        const { data: centersData, error: centersError } = await supabase
          .from('centers')
          .select('center_id, name')
          .order('name');
        
        if (centersError) {
          console.error('Error fetching centers:', centersError);
        } else if (centersData) {
          setCenters(centersData);
        }
        
        // Fetch programs
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('program_id, name')
          .order('name');
        
        if (programsError) {
          console.error('Error fetching programs:', programsError);
        } else if (programsData) {
          setPrograms(programsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCentersAndPrograms();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData({ ...formData, [name]: formattedDate });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const formFields = [
    // Personal Information
    { name: 'name', label: 'Full Name', type: 'input' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
    { name: 'blood_group', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    
    // Contact Information
    { name: 'email', label: 'Email', type: 'input' },
    { name: 'phone', label: 'Phone', type: 'input' },
    { name: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'input' },
    { name: 'emergency_contact', label: 'Emergency Contact', type: 'input' },
    
    // Employment Information
    { name: 'designation', label: 'Designation', type: 'input' },
    { name: 'department', label: 'Department', type: 'input' },
    { name: 'employment_type', label: 'Employment Type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Temporary'] },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'On Leave'] },
    { name: 'work_location', label: 'Work Location', type: 'input' },
    { name: 'date_of_joining', label: 'Date of Joining', type: 'date' },
    { name: 'date_of_leaving', label: 'Date of Leaving', type: 'date' },
    
    // Program Information
    { name: 'center_id', label: 'Center', type: 'center' },
    { name: 'program_id', label: 'Program', type: 'program' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            
            {field.type === 'input' && (
              <Input
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
              />
            )}
            
            {field.type === 'select' && (
              <Select 
                value={formData[field.name] || ''} 
                onValueChange={(value) => handleSelectChange(field.name, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {field.type === 'date' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData[field.name] && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData[field.name] ? format(new Date(formData[field.name]), 'PPP') : `Select ${field.label}`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData[field.name] ? new Date(formData[field.name]) : undefined}
                    onSelect={(date) => handleDateChange(field.name, date)}
                    className="pointer-events-auto"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            
            {field.type === 'center' && (
              <Select 
                value={formData[field.name]?.toString() || ''} 
                onValueChange={(value) => handleSelectChange(field.name, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Center" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center) => (
                    <SelectItem key={center.center_id} value={center.center_id.toString()}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {field.type === 'program' && (
              <Select 
                value={formData[field.name]?.toString() || ''} 
                onValueChange={(value) => handleSelectChange(field.name, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.program_id} value={program.program_id.toString()}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
