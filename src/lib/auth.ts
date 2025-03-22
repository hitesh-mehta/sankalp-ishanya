
import supabase from './api';
import { toast } from 'sonner';

// Define user types
export type User = {
  id: string;
  employee_id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  center_id: number;
  department?: string;
  designation?: string;
}

// Authenticate a user with email and password
export const authenticateUser = async (email: string, password: string): Promise<{ 
  success: boolean; 
  user?: User; 
  message?: string; 
}> => {
  try {
    console.log('Authenticating user with email:', email);
    
    // Get the employee record with the matching email
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .eq('password', password) // In a real app, this should use hashed passwords with bcrypt
      .limit(1);
    
    if (error) {
      console.error('Authentication error:', error);
      return { 
        success: false, 
        message: 'An error occurred during authentication' 
      };
    }
    
    if (!employees || employees.length === 0) {
      return { 
        success: false, 
        message: 'Invalid email or password' 
      };
    }
    
    const employee = employees[0];
    const isAdmin = employee.department?.toLowerCase() === 'admin' || 
                   employee.designation?.toLowerCase().includes('admin');
    
    // Create user object
    const user: User = {
      id: employee.id,
      employee_id: employee.employee_id,
      name: employee.name,
      email: employee.email,
      isAdmin: isAdmin,
      center_id: employee.center_id,
      department: employee.department,
      designation: employee.designation
    };
    
    console.log('User authenticated:', user);
    return { 
      success: true, 
      user 
    };
    
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      success: false, 
      message: 'An error occurred during authentication' 
    };
  }
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  const user = localStorage.getItem('user');
  return !!user;
};

// Get current user
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (e) {
    console.error('Error parsing user data from localStorage:', e);
    return null;
  }
};

// Log out user
export const logout = (): void => {
  localStorage.removeItem('user');
  toast.success('You have been logged out');
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user ? user.isAdmin : false;
};
