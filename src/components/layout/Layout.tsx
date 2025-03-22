
import { ReactNode } from 'react';
import Header from './Header';
import { DashboardNav } from './DashboardNav';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
};

const Layout = ({ title, subtitle, children, showBackButton = false, onBack }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2" 
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          <DashboardNav />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
