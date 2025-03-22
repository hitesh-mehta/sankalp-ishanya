
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, LogOut, BookOpen, User, Bell } from 'lucide-react';
import { logout, getCurrentUser, getUserRole } from '@/lib/auth';
import { useState, useEffect } from 'react';
import supabase from '@/lib/api';
import { toast } from 'sonner';

export function DashboardNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const userRole = getUserRole();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Only fetch notifications for parents and teachers
    if (user && ['parent', 'teacher'].includes(user.role)) {
      const fetchNotifications = async () => {
        try {
          const { data, error } = await supabase
            .from('announcements')
            .select('count')
            .order('created_at', { ascending: false })
            .limit(5);

          if (error) {
            console.error('Error fetching notifications:', error);
            return;
          }

          if (data) {
            // For this demo, just show a count of recent announcements
            setNotificationCount(data.length);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };

      fetchNotifications();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const getButtonClassName = (path: string) => {
    return location.pathname === path 
      ? 'bg-ishanya-green/10 text-ishanya-green hover:bg-ishanya-green/20' 
      : 'hover:bg-gray-100';
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-2">
      {/* Notification icon for all roles */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => toast.info('Notifications feature coming soon')}
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </Button>
      
      {/* Show admin dashboard link only to administrators */}
      {userRole === 'administrator' && (
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className={getButtonClassName('/')}
        >
          <Link to="/">
            <Home className="h-5 w-5" />
          </Link>
        </Button>
      )}
      
      {/* Show HR dashboard link only to HR */}
      {userRole === 'hr' && (
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className={getButtonClassName('/hr')}
        >
          <Link to="/hr">
            <Users className="h-5 w-5" />
          </Link>
        </Button>
      )}
      
      {/* Show Teacher dashboard link only to teachers */}
      {userRole === 'teacher' && (
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className={getButtonClassName('/teacher')}
        >
          <Link to="/teacher">
            <BookOpen className="h-5 w-5" />
          </Link>
        </Button>
      )}
      
      {/* Show Parent dashboard link only to parents */}
      {userRole === 'parent' && (
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className={getButtonClassName('/parent')}
        >
          <Link to="/parent">
            <User className="h-5 w-5" />
          </Link>
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleLogout}
        className="hover:bg-red-50 hover:text-red-500"
      >
        <LogOut className="h-5 w-5" />
      </Button>
      
      {user && (
        <span className="ml-2 text-sm font-medium text-gray-600 hidden md:inline-block">
          {user.name} ({userRole})
        </span>
      )}
    </div>
  );
}
