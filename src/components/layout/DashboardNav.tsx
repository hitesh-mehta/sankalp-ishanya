
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, LogOut } from 'lucide-react';
import { logout, getCurrentUser, isAdmin } from '@/lib/auth';

export function DashboardNav() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userIsAdmin = isAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center space-x-1">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/">
          <Home className="h-4 w-4" />
        </Link>
      </Button>
      
      {userIsAdmin && (
        <Button variant="ghost" size="icon" asChild>
          <Link to="/hr">
            <Users className="h-4 w-4" />
          </Link>
        </Button>
      )}
      
      <Button variant="ghost" size="icon" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
      </Button>
      
      {user && (
        <span className="ml-2 text-sm text-gray-600 hidden md:inline-block">
          {user.name}
        </span>
      )}
    </div>
  );
}
