
import { PropsWithChildren } from 'react';
import Navbar from './Navbar';
import Header from './Header';

type LayoutProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  centerName?: string;
  programName?: string;
  onBack?: () => void;
  showBackButton?: boolean;
}>;

const Layout = ({ 
  children, 
  title, 
  subtitle,
  centerName,
  programName,
  onBack,
  showBackButton = false
}: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar 
        centerName={centerName} 
        programName={programName} 
        onBack={onBack}
        showBackButton={showBackButton}
      />
      <Header title={title} subtitle={subtitle} />
      <main className="flex-1 w-full px-4 md:px-8 py-6 max-w-screen-2xl mx-auto">
        {children}
      </main>
      <footer className="bg-gray-100 py-6 px-4 border-t border-gray-200">
        <div className="max-w-screen-2xl mx-auto text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Ishanya Foundation. All rights reserved.</p>
          <p className="mt-1">Admin Dashboard</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
