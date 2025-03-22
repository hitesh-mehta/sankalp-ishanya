
import { ReactNode } from 'react';
import Header from './Header';
import { DashboardNav } from './DashboardNav';

type LayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const Layout = ({ title, subtitle, children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
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
