import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Using the provided Supabase credentials
const supabaseUrl = 'https://nizvcdssajfpjtncbojx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5penZjZHNzYWpmcGp0bmNib2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTU0ODksImV4cCI6MjA1ODE5MTQ4OX0.5b2Yzfzzzz-C8S6iqhG3SinKszlgjdd4NUxogWIxCLc';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export type Center = {
  id: string;  // UUID format
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
  id: string;  // UUID format
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

// Generic function to handle API errors with improved logging
const handleError = (error: any, customMessage?: string) => {
  console.error('API Error:', error);
  console.error('Error details:', JSON.stringify(error, null, 2));
  toast.error(customMessage || 'An error occurred. Please try again.');
  return null;
};

// Fetch all centers
export const fetchCenters = async (): Promise<Center[] | null> => {
  try {
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
    console.log(`Fetching tables for program_id: ${programId}`);
    
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

// Fetch all available columns for a table with improved error handling
export const fetchTableColumns = async (tableName: string): Promise<string[] | null> => {
  try {
    console.log(`Fetching columns for table ${tableName}`);
    
    // First try to fetch a row to get columns
    const { data, error } = await supabase
      .from(tableName.toLowerCase())
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching table schema:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    // If we have data, extract columns
    if (data && data.length > 0) {
      console.log(`Columns found for ${tableName}:`, Object.keys(data[0]));
      return Object.keys(data[0]);
    }
    
    // If table exists but is empty, provide default columns based on table name
    console.log('Table exists but is empty, using predefined columns');
    
    if (tableName.toLowerCase() === 'students') {
      return [
        'id', 'first_name', 'last_name', 'photo', 'gender', 'dob', 'primary_diagnosis', 
        'comorbidity', 'udid', 'student_id', 'enrollment_year', 'status', 'student_email', 
        'program_id', 'program_2_id', 'number_of_sessions', 'timings', 'days_of_week', 
        'educator_employee_id', 'secondary_educator_employee_id', 'session_type', 
        'fathers_name', 'mothers_name', 'blood_group', 'allergies', 'contact_number', 
        'alt_contact_number', 'parents_email', 'address', 'transport', 'strengths', 
        'weakness', 'comments', 'created_at', 'center_id'
      ];
    } else if (tableName.toLowerCase() === 'educators') {
      return [
        'id', 'center_id', 'employee_id', 'name', 'photo', 'designation', 'email', 
        'phone', 'date_of_birth', 'date_of_joining', 'work_location', 'created_at'
      ];
    } else if (tableName.toLowerCase() === 'employees') {
      return [
        'id', 'employee_id', 'name', 'gender', 'designation', 'department', 'employment_type',
        'program_id', 'email', 'phone', 'date_of_birth', 'date_of_joining', 'date_of_leaving',
        'status', 'work_location', 'emergency_contact_name', 'emergency_contact', 'blood_group',
        'created_at', 'center_id', 'LOR'
      ];
    } else if (tableName.toLowerCase() === 'courses') {
      return [
        'id', 'name', 'duration_weeks', 'max_students', 'description', 'start_date',
        'end_date', 'schedule', 'classroom', 'credits', 'prerequisites', 'syllabus',
        'materials', 'assessment_method', 'center_id', 'program_id'
      ];
    }
    
    // Default minimal columns
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

// Fetch data from a specific table with proper logging and improved error handling
export const fetchTableData = async (tableName: string, center_id?: number): Promise<any[] | null> => {
  try {
    console.log(`Fetching data from ${tableName} ${center_id ? `for center_id: ${center_id}` : ''}`);
    
    // Query the actual table
    let query = supabase.from(tableName.toLowerCase()).select('*');
    
    // Filter by center_id if provided
    if (center_id) {
      query = query.eq('center_id', center_id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} records from ${tableName}`);
    return data || [];
  } catch (error) {
    return handleError(error, `Failed to fetch data from ${tableName}`);
  }
};

// Insert a row into a table with improved error handling and validation
export const insertRow = async (tableName: string, rowData: any): Promise<{ success: boolean; errors?: Record<string, string>; data?: any }> => {
  try {
    console.log(`Inserting row into ${tableName} with data:`, rowData);
    
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
      console.error(`Insert error in ${tableName}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
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
    
    console.log(`Successfully inserted row into ${tableName}:`, data);
    toast.success('Record added successfully');
    return { success: true, data };
  } catch (error: any) {
    handleError(error, 'Failed to add row');
    return { success: false, errors: { general: error.message } };
  }
};

// Update a row in a table with improved error handling and validation
export const updateRow = async (tableName: string, id: number, rowData: any): Promise<{ success: boolean; errors?: Record<string, string>; data?: any }> => {
  try {
    console.log(`Updating row in ${tableName} with id ${id}:`, rowData);
    
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
      console.error(`Update error in ${tableName}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error(error.message);
      return { success: false, errors: { general: error.message } };
    }
    
    console.log(`Successfully updated row in ${tableName}:`, data);
    toast.success('Record updated successfully');
    return { success: true, data };
  } catch (error: any) {
    handleError(error, 'Failed to update row');
    return { success: false, errors: { general: error.message } };
  }
};

// Delete a row from a table with improved error handling
export const deleteRow = async (tableName: string, id: number): Promise<boolean> => {
  try {
    console.log(`Deleting row with id ${id} from table ${tableName}`);
    
    // Delete from the actual table
    const { error } = await supabase
      .from(tableName.toLowerCase())
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Delete error in ${tableName}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error(error.message);
      return false;
    }
    
    console.log(`Successfully deleted row with id ${id} from ${tableName}`);
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
      console.error('Error details:', JSON.stringify(error, null, 2));
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
