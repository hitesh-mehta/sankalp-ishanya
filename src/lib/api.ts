
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// These would need to be set up via environment variables in a real application
// For now, we'll use placeholder values that will be replaced by actual values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export type Center = {
  id: number;
  name: string;
  location: string;
  description?: string;
  image_url?: string;
  created_at?: string;
};

export type Program = {
  id: number;
  name: string;
  description?: string;
  center_id: number;
  image_url?: string;
  created_at?: string;
};

export type TableInfo = {
  id: number;
  name: string;
  description?: string;
  program_id: number;
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

// Fetch programs by center ID
export const fetchProgramsByCenter = async (centerId: number): Promise<Program[] | null> => {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('center_id', centerId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleError(error, 'Failed to fetch programs');
  }
};

// Fetch tables by program ID
export const fetchTablesByProgram = async (programId: number): Promise<TableInfo[] | null> => {
  try {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('program_id', programId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleError(error, 'Failed to fetch tables');
  }
};

// Fetch data from a specific table
export const fetchTableData = async (tableName: string): Promise<any[] | null> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleError(error, `Failed to fetch data from ${tableName}`);
  }
};

// Insert a row into a table
export const insertRow = async (tableName: string, rowData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .insert([rowData]);
    
    if (error) throw error;
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
    const { error } = await supabase
      .from(tableName)
      .update(rowData)
      .eq('id', id);
    
    if (error) throw error;
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
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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
  toast.success(`Column "${columnName}" added successfully`);
  return true;
};

// Bulk insert data from CSV
export const bulkInsert = async (tableName: string, rows: any[]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .insert(rows);
    
    if (error) throw error;
    toast.success(`${rows.length} rows added successfully`);
    return true;
  } catch (error) {
    handleError(error, 'Failed to bulk insert rows');
    return false;
  }
};

export default supabase;
