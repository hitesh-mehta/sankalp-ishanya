
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Using the provided Supabase credentials
const supabaseUrl = 'https://nizvcdssajfpjtncbojx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5penZjZHNzYWpmcGp0bmNib2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTU0ODksImV4cCI6MjA1ODE5MTQ4OX0.5b2Yzfzzzz-C8S6iqhG3SinKszlgjdd4NUxogWIxCLc';

// Function to check if Supabase credentials are configured
const checkSupabaseConfig = () => {
  // Since we're using hardcoded credentials now, this always returns true
  return true;
};

const supabase = createClient(supabaseUrl, supabaseKey);

export type Center = {
  id: string;  // Updated from number to string to match UUID format
  center_id: number;  // Added this field based on the actual data structure
  name: string;
  location: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  num_of_student?: number;
  num_of_educator?: number;
  num_of_employees?: number;
};

export type Program = {
  id: string;  // Updated to string for UUID format
  program_id: number; // Numeric ID
  name: string;
  description?: string;
  center_id: number;
  image_url?: string;
  created_at?: string;
  num_of_student?: number;
  num_of_educator?: number;
};

export type TableInfo = {
  id: number;
  name: string;
  description?: string;
  program_id: number;
  display_name?: string; // More user-friendly name
};

// Generic function to handle API errors
const handleError = (error: any, customMessage?: string) => {
  console.error('API Error:', error);
  toast.error(customMessage || 'An error occurred. Please try again.');
  return null;
};

// Fetch all centers
export const fetchCenters = async (): Promise<Center[] | null> => {
  try {
    if (!checkSupabaseConfig()) {
      throw new Error('Supabase configuration missing or invalid');
    }

    const { data, error } = await supabase
      .from('centers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleError(error, 'Failed to fetch centers');
  }
};

// Fetch programs by center ID - Updated to use center_id instead of id
export const fetchProgramsByCenter = async (centerId: number): Promise<Program[] | null> => {
  try {
    if (!checkSupabaseConfig()) {
      throw new Error('Supabase configuration missing or invalid');
    }

    console.log('Fetching programs for center_id:', centerId);

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('center_id', centerId)  // Using center_id which is an integer
      .order('name');
    
    if (error) throw error;
    console.log('Programs fetched:', data);
    return data || [];
  } catch (error) {
    return handleError(error, 'Failed to fetch programs');
  }
};

// Fetch tables by program ID
export const fetchTablesByProgram = async (programId: number): Promise<TableInfo[] | null> => {
  try {
    // Since "tables" table does not exist in the database, 
    // let's create some mock tables based on program_id
    // In a real application, this would fetch from the database
    
    const mockTables: TableInfo[] = [
      { 
        id: programId * 100 + 1, 
        name: `Students_${programId}`, 
        program_id: programId, 
        description: 'Student information',
        display_name: 'Students'
      },
      { 
        id: programId * 100 + 2, 
        name: `Educators_${programId}`, 
        program_id: programId, 
        description: 'Educator information',
        display_name: 'Educators'
      },
      { 
        id: programId * 100 + 3, 
        name: `Courses_${programId}`, 
        program_id: programId, 
        description: 'Course details',
        display_name: 'Courses'
      }
    ];
    
    return mockTables;
  } catch (error) {
    return handleError(error, 'Failed to fetch tables');
  }
};

// Fetch all available columns for a table
export const fetchTableColumns = async (tableName: string): Promise<string[] | null> => {
  try {
    // In a real app, this would fetch schema information from the database
    // For mock implementation, we'll return predefined columns based on table name
    
    if (tableName.startsWith('Students')) {
      // Simulating a student table with 34 columns
      return [
        'id', 'name', 'age', 'grade', 'enrollment_date', 'gender', 'address', 'city',
        'state', 'postal_code', 'country', 'phone', 'email', 'guardian_name',
        'guardian_phone', 'guardian_email', 'emergency_contact', 'emergency_phone',
        'birth_date', 'native_language', 'academic_year', 'admission_date',
        'current_status', 'previous_school', 'health_conditions', 'blood_group',
        'allergies', 'medications', 'family_income', 'scholarship_status',
        'transportation_mode', 'extracurricular_activities', 'remarks', 'profile_image'
      ];
    } else if (tableName.startsWith('Educators')) {
      return [
        'id', 'name', 'subject', 'years_experience', 'email', 'phone', 'address',
        'hire_date', 'education', 'certifications', 'department', 'position',
        'salary_grade', 'contract_type', 'specializations', 'teaching_hours'
      ];
    } else if (tableName.startsWith('Courses')) {
      return [
        'id', 'name', 'duration_weeks', 'max_students', 'description', 'start_date',
        'end_date', 'schedule', 'classroom', 'credits', 'prerequisites', 'syllabus',
        'materials', 'assessment_method'
      ];
    }
    
    // Default columns if table type not recognized
    return ['id', 'name', 'description'];
  } catch (error) {
    return handleError(error, `Failed to fetch columns for ${tableName}`);
  }
};

// Fetch data from a specific table
export const fetchTableData = async (tableName: string): Promise<any[] | null> => {
  try {
    // Since we're using mock tables, let's also create mock data
    // In a real application, this would fetch from the actual table
    const mockData = [];
    
    // Get all possible columns for this table type
    const columns = await fetchTableColumns(tableName) || ['id', 'name'];
    
    for (let i = 1; i <= 15; i++) {
      if (tableName.startsWith('Students')) {
        // Create a student record with all 34 columns
        const studentRecord: Record<string, any> = {};
        
        // Fill in all student columns with mock data
        columns.forEach(column => {
          switch(column) {
            case 'id':
              studentRecord[column] = i;
              break;
            case 'name':
              studentRecord[column] = `Student ${i}`;
              break;
            case 'age':
              studentRecord[column] = 15 + (i % 10);
              break;
            case 'grade':
              studentRecord[column] = ['A', 'B', 'C', 'A+', 'B-'][i % 5];
              break;
            case 'enrollment_date':
              studentRecord[column] = new Date(2023, (i % 12), (i % 28) + 1).toISOString().split('T')[0];
              break;
            case 'gender':
              studentRecord[column] = i % 2 === 0 ? 'Female' : 'Male';
              break;
            case 'address':
              studentRecord[column] = `${100 + i} Main Street`;
              break;
            case 'city':
              studentRecord[column] = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Chennai'][i % 5];
              break;
            case 'state':
              studentRecord[column] = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh'][i % 5];
              break;
            case 'postal_code':
              studentRecord[column] = `4000${(i % 10) + 1}`;
              break;
            case 'country':
              studentRecord[column] = 'India';
              break;
            case 'phone':
              studentRecord[column] = `+91 98765 ${10000 + i}`;
              break;
            case 'email':
              studentRecord[column] = `student${i}@example.com`;
              break;
            case 'guardian_name':
              studentRecord[column] = `Parent ${i}`;
              break;
            case 'guardian_phone':
              studentRecord[column] = `+91 87654 ${20000 + i}`;
              break;
            case 'guardian_email':
              studentRecord[column] = `parent${i}@example.com`;
              break;
            case 'emergency_contact':
              studentRecord[column] = `Emergency Contact ${i}`;
              break;
            case 'emergency_phone':
              studentRecord[column] = `+91 76543 ${30000 + i}`;
              break;
            case 'birth_date':
              studentRecord[column] = new Date(2005, (i % 12), (i % 28) + 1).toISOString().split('T')[0];
              break;
            case 'native_language':
              studentRecord[column] = ['Hindi', 'Marathi', 'Tamil', 'English', 'Kannada'][i % 5];
              break;
            case 'academic_year':
              studentRecord[column] = `202${i % 4}`;
              break;
            case 'admission_date':
              studentRecord[column] = new Date(2022, (i % 12), (i % 28) + 1).toISOString().split('T')[0];
              break;
            case 'current_status':
              studentRecord[column] = ['Active', 'On Leave', 'Graduated', 'Transferred', 'Active'][i % 5];
              break;
            case 'previous_school':
              studentRecord[column] = `Previous School ${i}`;
              break;
            case 'health_conditions':
              studentRecord[column] = i % 5 === 0 ? 'Asthma' : (i % 7 === 0 ? 'Allergies' : 'None');
              break;
            case 'blood_group':
              studentRecord[column] = ['A+', 'B+', 'O+', 'AB+', 'A-'][i % 5];
              break;
            case 'allergies':
              studentRecord[column] = i % 3 === 0 ? 'Peanuts' : (i % 4 === 0 ? 'Dust' : 'None');
              break;
            case 'medications':
              studentRecord[column] = i % 6 === 0 ? 'Inhaler' : 'None';
              break;
            case 'family_income':
              studentRecord[column] = `${(200000 + i * 50000).toLocaleString('en-IN')} INR`;
              break;
            case 'scholarship_status':
              studentRecord[column] = i % 3 === 0 ? 'Full' : (i % 5 === 0 ? 'Partial' : 'None');
              break;
            case 'transportation_mode':
              studentRecord[column] = ['School Bus', 'Public Transport', 'Private Vehicle', 'Walking', 'Carpool'][i % 5];
              break;
            case 'extracurricular_activities':
              studentRecord[column] = i % 2 === 0 ? 'Sports, Music' : (i % 3 === 0 ? 'Dance, Drama' : 'Art, Debate');
              break;
            case 'remarks':
              studentRecord[column] = i % 4 === 0 ? 'Excellent student' : (i % 5 === 0 ? 'Needs improvement' : '');
              break;
            case 'profile_image':
              studentRecord[column] = `https://example.com/profiles/student${i}.jpg`;
              break;
            default:
              studentRecord[column] = `Value for ${column}`;
          }
        });
        
        mockData.push(studentRecord);
      } else if (tableName.startsWith('Educators')) {
        mockData.push({
          id: i,
          name: `Educator ${i}`,
          subject: ['Math', 'Science', 'History', 'English', 'Art'][i % 5],
          years_experience: 3 + i,
          email: `educator${i}@example.com`,
          phone: `+91 98765 ${40000 + i}`,
          address: `${200 + i} Educator Avenue`,
          hire_date: new Date(2020, (i % 12), (i % 28) + 1).toISOString().split('T')[0],
          education: ['PhD', 'Masters', 'Bachelors', 'Masters', 'PhD'][i % 5],
          certifications: i % 2 === 0 ? 'Teaching Certification, Subject Specialization' : 'Teaching Certification',
          department: ['Science', 'Humanities', 'Languages', 'Mathematics', 'Arts'][i % 5],
          position: ['Senior Teacher', 'Junior Teacher', 'Department Head', 'Assistant Teacher', 'Coordinator'][i % 5],
          salary_grade: ['A', 'B', 'C', 'B', 'A'][i % 5],
          contract_type: i % 2 === 0 ? 'Permanent' : 'Contract',
          specializations: i % 3 === 0 ? 'Special Education, Advanced Curriculum' : 'Standard Curriculum',
          teaching_hours: 20 + (i % 10)
        });
      } else if (tableName.startsWith('Courses')) {
        mockData.push({
          id: i,
          name: `Course ${i}`,
          duration_weeks: 8 + i,
          max_students: 20 + i,
          description: `Detailed description for Course ${i}`,
          start_date: new Date(2023, (i % 12), (i % 28) + 1).toISOString().split('T')[0],
          end_date: new Date(2023, ((i+2) % 12), (i % 28) + 1).toISOString().split('T')[0],
          schedule: i % 2 === 0 ? 'MWF 10:00-11:30' : 'TTh 2:00-3:30',
          classroom: `Room ${100 + i}`,
          credits: 3 + (i % 3),
          prerequisites: i % 3 === 0 ? `Course ${i-1}, Course ${i-2}` : 'None',
          syllabus: `https://example.com/syllabus/course${i}.pdf`,
          materials: `Textbook, Workbook, Online Resources`,
          assessment_method: ['Exam', 'Project', 'Continuous Assessment', 'Mixed', 'Portfolio'][i % 5]
        });
      }
    }
    
    return mockData;
  } catch (error) {
    return handleError(error, `Failed to fetch data from ${tableName}`);
  }
};

// Insert a row into a table
export const insertRow = async (tableName: string, rowData: any): Promise<boolean> => {
  try {
    // In a real app, this would insert into the database
    // For this mock implementation, we'll simulate success
    console.log('Inserting row with data:', rowData);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Validate the data before "inserting"
    const requiredColumns = await fetchTableColumns(tableName) || [];
    const missingFields = requiredColumns.filter(col => 
      col !== 'id' && // ID is typically auto-generated
      !rowData[col] && 
      !['profile_image', 'remarks', 'allergies', 'medications'].includes(col) // These are optional
    );
    
    if (missingFields.length > 0) {
      // In a real app, you might want to reject the insert, but for demo we'll just warn
      toast.warning(`Some fields are missing: ${missingFields.join(', ')}`, {
        description: "In a production system, validation would be more strict."
      });
    }
    
    toast.success('Row added successfully');
    return true;
  } catch (error) {
    handleError(error, 'Failed to add row');
    return false;
  }
};

// Update a row in a table
export const updateRow = async (tableName: string, id: number, rowData: any): Promise<boolean> => {
  try {
    // This would actually update the database in a real app
    console.log('Updating row:', id, 'with data:', rowData);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success('Row updated successfully');
    return true;
  } catch (error) {
    handleError(error, 'Failed to update row');
    return false;
  }
};

// Delete a row from a table
export const deleteRow = async (tableName: string, id: number): Promise<boolean> => {
  try {
    // This would actually delete from the database in a real app
    console.log('Deleting row:', id, 'from table:', tableName);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success('Row deleted successfully');
    return true;
  } catch (error) {
    handleError(error, 'Failed to delete row');
    return false;
  }
};

// Add a new column to a table - this is a simplified version
// In a real app, you'd need to alter the table schema via SQL or RPC
export const addColumn = async (tableName: string, columnName: string, columnType: string): Promise<boolean> => {
  // In a real implementation, you'd run SQL via RPC
  // For this example, we'll just simulate success
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  toast.success(`Column "${columnName}" added successfully`);
  return true;
};

// Bulk insert data from CSV
export const bulkInsert = async (tableName: string, rows: any[]): Promise<boolean> => {
  try {
    // In a real app, this would insert into the database
    console.log(`Bulk inserting ${rows.length} rows into table ${tableName}`);
    
    // Simulate delay based on number of rows
    await new Promise(resolve => setTimeout(resolve, 800 + rows.length * 50));
    
    toast.success(`${rows.length} rows added successfully to ${tableName}`);
    return true;
  } catch (error) {
    handleError(error, 'Failed to bulk insert rows');
    return false;
  }
};

export default supabase;
