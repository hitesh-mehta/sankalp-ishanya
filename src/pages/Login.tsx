
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Mail, Users } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(4, { message: "Password must be at least 4 characters" }),
  role: z.string({ required_error: "Please select a role" })
    .refine(val => ['administrator', 'hr', 'teacher', 'parent'].includes(val), {
      message: "Invalid role selected"
    })
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: ''
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const result = await authenticateUser(data.email, data.password, data.role);
      
      if (result.success) {
        toast.success("Login successful");
        
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Redirect based on role
        switch(result.user.role) {
          case 'administrator':
            navigate('/');
            break;
          case 'hr':
            navigate('/hr');
            break;
          case 'teacher':
            navigate('/teacher');
            break;
          case 'parent':
            navigate('/parent');
            break;
          default:
            navigate('/');
        }
      } else {
        toast.error(result.message || "Invalid credentials");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img 
            src="/lovable-uploads/17953c8a-6715-4e58-af68-a3918c44fd33.png" 
            alt="Ishanya Foundation" 
            className="h-16 mx-auto"
          />
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Ishanya Foundation</h2>
          <p className="text-gray-500 mt-1">Journey to Inclusion</p>
        </div>
        
        <Card className="w-full shadow-lg border-t-4 border-ishanya-green">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center font-bold text-gray-800">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input placeholder="email@example.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input type="password" placeholder="******" showPasswordToggle className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="administrator">Administrator</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-ishanya-green hover:bg-ishanya-green/90 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Contact administrator if you need access
            </p>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2025 Ishanya Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
