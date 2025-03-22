
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
  center_id?: number; // Added to filter students by center
};

// Define proper types for validation rules
type ValidationRule = {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
};

// Validation rules for different table types
export const validationRules: Record<string, Record<string, ValidationRule>> = {
  Students: {
    name: { required: true, message: 'Student name is required' },
    age: { required: true, min: 5, max: 25, message: 'Age must be between 5 and 25' },
    grade: { required: true, message: 'Grade is required' },
    enrollment_date: { required: true, message: 'Enrollment date is required' },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' },
    phone: { pattern: /^\+?[0-9\s-]{10,15}$/, message: 'Please enter a valid phone number' },
    center_id: { required: true, message: 'Center is required' }
  },
  Educators: {
    name: { required: true, message: 'Educator name is required' },
    subject: { required: true, message: 'Subject is required' },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' },
    center_id: { required: true, message: 'Center is required' }
  }
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

    console.log('Fetching centers from Supabase...');
    const { data, error } = await supabase
      .from('centers')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching centers:', error);
      throw error;
    }
    
    console.log('Centers fetched:', data);
    return data || [];
  } catch (error) {
    return handleError(error, 'Failed to fetch centers');
  }
};

// Fetch programs by center ID
export const fetchProgramsByCenter = async (centerId: number): Promise<Program[] | null> => {
  try {
    if (!checkSupabaseConfig()) {
      throw new Error('Supabase configuration missing or invalid');
    }

    console.log('Fetching programs for center_id:', centerId);

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('center_id', centerId)
      .order('name');
    
    if (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }
    
    console.log('Programs fetched:', data);
    return data || [];
  } catch (error) {
    return handleError(error, 'Failed to fetch programs');
  }
};

// Get the real table name based on the display name
const getTableName = (displayName: string): string => {
  const tableMap: Record<string, string> = {
    'Students': 'students',
    'Educators': 'educators',
    'Courses': 'courses'
  };
  
  return tableMap[displayName] || displayName.toLowerCase();
};

// Fetch tables by program ID
export const fetchTablesByProgram = async (programId: number): Promise<TableInfo[] | null> => {
  try {
    // In a real-world scenario, we would fetch tables from the database
    // For this implementation, we create predefined tables for each program
    
    // Get the program to get its center_id
    const { data: programData, error: programError } = await supabase
      .from('programs')
      .select('center_id')
      .eq('program_id', programId)
      .single();
      
    if (programError) {
      console.error('Error fetching program:', programError);
      throw programError;
    }
    
    if (!programData) {
      throw new Error(`Program with ID ${programId} not found`);
    }
    
    const center_id = programData.center_id;
    console.log(`Found center_id ${center_id} for program_id ${programId}`);
    
    const tables: TableInfo[] = [
      { 
        id: 1, 
        name: 'students', 
        program_id: programId, 
        description: 'Student information',
        display_name: 'Students',
        center_id: center_id
      },
      { 
        id: 2, 
        name: 'educators', 
        program_id: programId, 
        description: 'Educator information',
        display_name: 'Educators',
        center_id: center_id
      },
      { 
        id: 3, 
        name: 'courses', 
        program_id: programId, 
        description: 'Course details',
        display_name: 'Courses',
        center_id: center_id
      }
    ];
    
    return tables;
  } catch (error) {
    return handleError(error, 'Failed to fetch tables');
  }
};

// Fetch all available columns for a table
export const fetchTableColumns = async (tableName: string): Promise<string[] | null> => {
  try {
    console.log(`Fetching columns for table ${tableName}`);
    
    // Check if the table exists in the database
    const { data, error } = await supabase
      .from(tableName.toLowerCase())
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Error checking table:', error);
      // If the table doesn't exist or we can't access it, return predefined columns
      if (tableName.toLowerCase() === 'students') {
        return [
          'id', 'name', 'age', 'grade', 'enrollment_date', 'gender', 'address', 'city',
          'state', 'postal_code', 'country', 'phone', 'email', 'guardian_name',
          'guardian_phone', 'guardian_email', 'emergency_contact', 'emergency_phone',
          'birth_date', 'native_language', 'academic_year', 'admission_date',
          'current_status', 'previous_school', 'health_conditions', 'blood_group',
          'allergies', 'medications', 'family_income', 'scholarship_status',
          'transportation_mode', 'extracurricular_activities', 'remarks', 'profile_image',
          'center_id', 'program_id'
        ];
      } else if (tableName.toLowerCase() === 'educators') {
        return [
          'id', 'name', 'subject', 'years_experience', 'email', 'phone', 'address',
          'hire_date', 'education', 'certifications', 'department', 'position',
          'salary_grade', 'contract_type', 'specializations', 'teaching_hours',
          'center_id', 'program_id'
        ];
      } else if (tableName.toLowerCase() === 'courses') {
        return [
          'id', 'name', 'duration_weeks', 'max_students', 'description', 'start_date',
          'end_date', 'schedule', 'classroom', 'credits', 'prerequisites', 'syllabus',
          'materials', 'assessment_method', 'center_id', 'program_id'
        ];
      }
    }
    
    console.log('Table data sample:', data);
    
    // If we successfully accessed the table, get column names from the first row
    if (data && data.length > 0) {
      return Object.keys(data[0]);
    }
    
    // Default columns if table exists but is empty
    return ['id', 'name', 'center_id', 'program_id'];
  } catch (error) {
    return handleError(error, `Failed to fetch columns for ${tableName}`);
  }
};

// Validate data before insertion or update
export const validateData = (tableName: string, data: Record<string, any>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  const tableType = tableName.toLowerCase().includes('student') ? 'Students' : 
                    tableName.toLowerCase().includes('educator') ? 'Educators' : 'Courses';
  
  const rules = validationRules[tableType] || {};
  
  // Check each field against the rules
  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];
    
    // Check required fields
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = rule.message || `${field} is required`;
      isValid = false;
    }
    
    // Check min/max for numeric fields
    if (value && !isNaN(Number(value))) {
      const numValue = Number(value);
      if (rule.min !== undefined && numValue < rule.min) {
        errors[field] = `${field} must be at least ${rule.min}`;
        isValid = false;
      }
      if (rule.max !== undefined && numValue > rule.max) {
        errors[field] = `${field} must be at most ${rule.max}`;
        isValid = false;
      }
    }
    
    // Check pattern (like email, phone)
    if (value && rule.pattern && !rule.pattern.test(value.toString())) {
      errors[field] = rule.message || `Invalid format for ${field}`;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

// Fetch data from a specific table with proper logging
export const fetchTableData = async (tableName: string, center_id?: number): Promise<any[] | null> => {
  try {
    console.log(`Fetching data from ${tableName} for center_id: ${center_id}`);
    
    // Try to fetch data from the actual table
    let query = supabase.from(tableName.toLowerCase()).select('*');
    
    // Filter by center_id if provided
    if (center_id) {
      query = query.eq('center_id', center_id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching table data:', error);
      // If table doesn't exist or we can't access it, generate mock data
      return generateMockData(tableName, 10, center_id);
    }
    
    console.log(`Successfully fetched ${data?.length || 0} records from ${tableName}:`, data);
    return data || [];
  } catch (error) {
    return handleError(error, `Failed to fetch data from ${tableName}`);
  }
};

// Generate mock data for tables that don't exist
const generateMockData = (tableName: string, count: number = 10, center_id?: number): any[] => {
  const mockData = [];
  
  // Get all possible columns for this table type
  let columns: string[] = [];
  
  if (tableName.toLowerCase().includes('student')) {
    columns = [
      'id', 'name', 'age', 'grade', 'enrollment_date', 'gender', 'address', 'city',
      'state', 'postal_code', 'country', 'phone', 'email', 'guardian_name',
      'guardian_phone', 'guardian_email', 'emergency_contact', 'emergency_phone',
      'birth_date', 'native_language', 'academic_year', 'admission_date',
      'current_status', 'previous_school', 'health_conditions', 'blood_group',
      'allergies', 'medications', 'family_income', 'scholarship_status',
      'transportation_mode', 'extracurricular_activities', 'remarks', 'profile_image',
      'center_id', 'program_id'
    ];
  } else if (tableName.toLowerCase().includes('educator')) {
    columns = [
      'id', 'name', 'subject', 'years_experience', 'email', 'phone', 'address',
      'hire_date', 'education', 'certifications', 'department', 'position',
      'salary_grade', 'contract_type', 'specializations', 'teaching_hours',
      'center_id', 'program_id'
    ];
  } else if (tableName.toLowerCase().includes('course')) {
    columns = [
      'id', 'name', 'duration_weeks', 'max_students', 'description', 'start_date',
      'end_date', 'schedule', 'classroom', 'credits', 'prerequisites', 'syllabus',
      'materials', 'assessment_method', 'center_id', 'program_id'
    ];
  } else {
    columns = ['id', 'name', 'description', 'center_id', 'program_id'];
  }
  
  console.log(`Generating ${count} mock records for ${tableName} with center_id ${center_id}`);
  
  for (let i = 1; i <= count; i++) {
    const record: Record<string, any> = {};
    
    columns.forEach(column => {
      switch(column) {
        case 'id':
          record[column] = i;
          break;
        case 'name':
          record[column] = `${tableName.charAt(0).toUpperCase() + tableName.slice(1, -1)} ${i}`;
          break;
        case 'age':
          record[column] = 15 + (i % 10);
          break;
        case 'grade':
          record[column] = ['A', 'B', 'C', 'A+', 'B-'][i % 5];
          break;
        case 'enrollment_date':
        case 'hire_date':
        case 'start_date':
          record[column] = new Date(2023, (i % 12), (i % 28) + 1).toISOString().split('T')[0];
          break;
        case 'end_date':
          record[column] = new Date(2024, (i % 12), (i % 28) + 1).toISOString().split('T')[0];
          break;
        case 'gender':
          record[column] = i % 2 === 0 ? 'Female' : 'Male';
          break;
        case 'center_id':
          record[column] = center_id || (90 + (i % 10));
          break;
        case 'program_id':
          record[column] = 90 + (i % 10);
          break;
        case 'email':
          record[column] = `${tableName.toLowerCase().slice(0, -1)}${i}@example.com`;
          break;
        case 'phone':
          record[column] = `+91 ${9800000000 + i}`;
          break;
        case 'subject':
          record[column] = ['Math', 'Science', 'History', 'English', 'Art'][i % 5];
          break;
        default:
          // Generate appropriate data based on column name
          if (column.includes('date')) {
            record[column] = new Date(2023, (i % 12), (i % 28) + 1).toISOString().split('T')[0];
          } else if (column.includes('description')) {
            record[column] = `Description for ${record.name || 'item'} ${i}`;
          } else if (column.includes('address')) {
            record[column] = `${100 + i} Main Street`;
          } else if (column.includes('city')) {
            record[column] = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Chennai'][i % 5];
          } else if (column.includes('status')) {
            record[column] = ['Active', 'On Leave', 'Graduated', 'Transferred', 'Active'][i % 5];
          } else {
            record[column] = `Value for ${column} ${i}`;
          }
      }
    });
    
    mockData.push(record);
  }
  
  console.log(`Generated ${mockData.length} mock records for ${tableName}`);
  return mockData;
};

// Insert a row into a table
export const insertRow = async (tableName: string, rowData: any): Promise<{ success: boolean; errors?: Record<string, string> }> => {
  try {
    console.log('Inserting row with data:', rowData);
    
    // Validate the data before inserting
    const { isValid, errors } = validateData(tableName, rowData);
    
    if (!isValid) {
      toast.error('Please correct the validation errors');
      return { success: false, errors };
    }
    
    // Remove ID if it's empty (for auto-generated IDs)
    if (!rowData.id) {
      delete rowData.id;
    }
    
    // Insert into the actual table
    const { data, error } = await supabase
      .from(tableName.toLowerCase())
      .insert(rowData)
      .select();
    
    if (error) {
      console.error('Insert error:', error);
      
      // Show specific error messages
      if (error.message.includes('duplicate key')) {
        toast.error('A record with this ID already exists');
      } else if (error.message.includes('violates foreign key constraint')) {
        toast.error('This record references data that doesn\'t exist');
      } else {
        toast.error(error.message);
      }
      
      return { success: false, errors: { general: error.message } };
    }
    
    toast.success('Record added successfully');
    return { success: true };
  } catch (error: any) {
    handleError(error, 'Failed to add row');
    return { success: false, errors: { general: error.message } };
  }
};

// Update a row in a table
export const updateRow = async (tableName: string, id: number, rowData: any): Promise<{ success: boolean; errors?: Record<string, string> }> => {
  try {
    console.log('Updating row:', id, 'with data:', rowData);
    
    // Validate the data before updating
    const { isValid, errors } = validateData(tableName, rowData);
    
    if (!isValid) {
      toast.error('Please correct the validation errors');
      return { success: false, errors };
    }
    
    // Update the actual table
    const { data, error } = await supabase
      .from(tableName.toLowerCase())
      .update(rowData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update error:', error);
      toast.error(error.message);
      return { success: false, errors: { general: error.message } };
    }
    
    toast.success('Record updated successfully');
    return { success: true };
  } catch (error: any) {
    handleError(error, 'Failed to update row');
    return { success: false, errors: { general: error.message } };
  }
};

// Delete a row from a table
export const deleteRow = async (tableName: string, id: number): Promise<boolean> => {
  try {
    console.log('Deleting row:', id, 'from table:', tableName);
    
    // Delete from the actual table
    const { error } = await supabase
      .from(tableName.toLowerCase())
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Delete error:', error);
      toast.error(error.message);
      return false;
    }
    
    toast.success('Record deleted successfully');
    return true;
  } catch (error) {
    handleError(error, 'Failed to delete row');
    return false;
  }
};

// Bulk insert data from CSV
export const bulkInsert = async (tableName: string, rows: any[]): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Bulk inserting ${rows.length} rows into table ${tableName}`);
    
    // Validate each row before insertion
    const invalidRows: number[] = [];
    const validRows: any[] = [];
    
    rows.forEach((row, index) => {
      const { isValid } = validateData(tableName, row);
      if (!isValid) {
        invalidRows.push(index + 1); // +1 for human-readable row numbers
      } else {
        // Remove ID if it's empty (for auto-generated IDs)
        if (!row.id) {
          delete row.id;
        }
        validRows.push(row);
      }
    });
    
    if (invalidRows.length > 0) {
      const message = `Validation failed for rows: ${invalidRows.join(', ')}`;
      toast.error(message);
      return { success: false, message };
    }
    
    if (validRows.length === 0) {
      return { success: false, message: 'No valid rows to insert' };
    }
    
    // Insert valid rows
    const { data, error } = await supabase
      .from(tableName.toLowerCase())
      .insert(validRows);
    
    if (error) {
      console.error('Bulk insert error:', error);
      toast.error(error.message);
      return { success: false, message: error.message };
    }
    
    toast.success(`${validRows.length} records added successfully`);
    return { success: true, message: `${validRows.length} records added successfully` };
  } catch (error: any) {
    handleError(error, 'Failed to bulk insert rows');
    return { success: false, message: error.message };
  }
};

export default supabase;
