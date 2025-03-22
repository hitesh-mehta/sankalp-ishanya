
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
  role: 'administrator' | 'hr' | 'teacher' | 'parent';
}

// Authenticate a user with email, password and role
export const authenticateUser = async (
  email: string, 
  password: string, 
  role: string
): Promise<{ 
  success: boolean; 
  user?: User; 
  message?: string; 
}> => {
  try {
    console.log('Authenticating user with email:', email, 'and role:', role);
    
    // For administrator, HR, and teacher roles, check the employees table
    if (['administrator', 'hr', 'teacher'].includes(role)) {
      // Get the employee record with the matching email and password
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
      
      // Check if the employee's role matches the selected role
      const isAdmin = employee.department?.toLowerCase() === 'admin' || 
                     employee.designation?.toLowerCase().includes('admin');
      
      const isHr = employee.department?.toLowerCase() === 'hr' || 
                   employee.designation?.toLowerCase().includes('hr');
      
      const isTeacher = employee.designation?.toLowerCase().includes('educator') || 
                       employee.designation?.toLowerCase().includes('teacher');
      
      let userRole: 'administrator' | 'hr' | 'teacher' | null = null;
      
      if (role === 'administrator' && isAdmin) {
        userRole = 'administrator';
      } else if (role === 'hr' && isHr) {
        userRole = 'hr';
      } else if (role === 'teacher' && isTeacher) {
        userRole = 'teacher';
      }
      
      if (!userRole) {
        return {
          success: false,
          message: 'You do not have permission to access the system with the selected role'
        };
      }
      
      // Create user object
      const user: User = {
        id: employee.id,
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        isAdmin: isAdmin,
        center_id: employee.center_id,
        department: employee.department,
        designation: employee.designation,
        role: userRole
      };
      
      console.log('User authenticated:', user);
      return { 
        success: true, 
        user 
      };
    } 
    // For parent role, we would check a different table (parents table)
    else if (role === 'parent') {
      // For demo purposes, let's just return a mock parent user
      // In a real application, this would check against a parents table in the database
      if (email === 'parent@example.com' && password === 'parent') {
        const parentUser: User = {
          id: 'parent-123',
          employee_id: 0, // Not applicable for parents
          name: 'Demo Parent',
          email: email,
          isAdmin: false,
          center_id: 91, // Assign to a default center
          role: 'parent'
        };
        
        console.log('Parent user authenticated:', parentUser);
        return {
          success: true,
          user: parentUser
        };
      }
      
      return {
        success: false,
        message: 'Invalid parent credentials'
      };
    }
    
    return {
      success: false,
      message: 'Invalid role selected'
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

// Check user role
export const getUserRole = (): string | null => {
  const user = getCurrentUser();
  return user ? user.role : null;
};
