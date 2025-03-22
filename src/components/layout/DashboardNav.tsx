
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Users } from 'lucide-react';

const DashboardNav = () => {
  const location = useLocation();
  const isHRPage = location.pathname === '/hr';

  return (
    <div className="py-2 px-4 bg-white border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex space-x-4">
          <Button 
            variant={!isHRPage ? "default" : "outline"} 
            size="sm" 
            asChild
            className={!isHRPage ? "bg-ishanya-green hover:bg-ishanya-green/90" : "border-ishanya-green text-ishanya-green hover:bg-ishanya-green/10"}
          >
            <Link to="/">
              <Building2 className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Link>
          </Button>
          <Button 
            variant={isHRPage ? "default" : "outline"} 
            size="sm" 
            asChild
            className={isHRPage ? "bg-ishanya-green hover:bg-ishanya-green/90" : "border-ishanya-green text-ishanya-green hover:bg-ishanya-green/10"}
          >
            <Link to="/hr">
              <Users className="h-4 w-4 mr-2" />
              HR Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNav;
