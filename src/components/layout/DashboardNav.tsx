
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, LogOut, BookOpen, User } from 'lucide-react';
import { logout, getCurrentUser, getUserRole } from '@/lib/auth';

export function DashboardNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const userRole = getUserRole();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-1">
      {/* Show admin dashboard link only to administrators */}
      {userRole === 'administrator' && (
        <Button variant="ghost" size="icon" asChild className={location.pathname === '/' ? 'bg-gray-100' : ''}>
          <Link to="/">
            <Home className="h-4 w-4" />
          </Link>
        </Button>
      )}
      
      {/* Show HR dashboard link only to administrators and HR */}
      {(userRole === 'hr') && (
        <Button variant="ghost" size="icon" asChild className={location.pathname === '/hr' ? 'bg-gray-100' : ''}>
          <Link to="/hr">
            <Users className="h-4 w-4" />
          </Link>
        </Button>
      )}
      
      {/* Show Teacher dashboard link only to teachers */}
      {userRole === 'teacher' && (
        <Button variant="ghost" size="icon" asChild className={location.pathname === '/teacher' ? 'bg-gray-100' : ''}>
          <Link to="/teacher">
            <BookOpen className="h-4 w-4" />
          </Link>
        </Button>
      )}
      
      {/* Show Parent dashboard link only to parents */}
      {userRole === 'parent' && (
        <Button variant="ghost" size="icon" asChild className={location.pathname === '/parent' ? 'bg-gray-100' : ''}>
          <Link to="/parent">
            <User className="h-4 w-4" />
          </Link>
        </Button>
      )}
      
      <Button variant="ghost" size="icon" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
      </Button>
      
      {user && (
        <span className="ml-2 text-sm text-gray-600 hidden md:inline-block">
          {user.name} ({userRole})
        </span>
      )}
    </div>
  );
}
