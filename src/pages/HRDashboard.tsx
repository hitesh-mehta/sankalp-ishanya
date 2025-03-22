
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import TableView from '@/components/tables/TableView';
import { TableInfo } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, UserCheck, FileSpreadsheet } from 'lucide-react';

const HRDashboard = () => {
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);

  // Predefined employee table configuration
  const employeeTable: TableInfo = {
    id: 1,
    name: 'employees',
    display_name: 'Employees',
    center_id: null, // HR dashboard can view all employees across centers
    program_id: null, // Not restricted to specific programs
  };

  // Handle selecting employee management
  const handleSelectEmployees = () => {
    setSelectedTable(employeeTable);
  };

  // Handle back button click
  const handleBack = () => {
    if (selectedTable) {
      setSelectedTable(null);
    }
  };

  return (
    <Layout
      title="HR Dashboard"
      subtitle="Manage employee data across all centers"
      showBackButton={!!selectedTable}
      onBack={handleBack}
    >
      {!selectedTable ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleSelectEmployees}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-ishanya-green/10 p-3 rounded-full">
                  <Users className="h-8 w-8 text-ishanya-green" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-ishanya-green">Employee Management</h3>
                  <p className="text-gray-500">View and manage all employee records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-ishanya-green/10 p-3 rounded-full">
                  <UserPlus className="h-8 w-8 text-ishanya-green" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-ishanya-green">Onboarding</h3>
                  <p className="text-gray-500">Manage employee onboarding process</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-ishanya-green/10 p-3 rounded-full">
                  <UserCheck className="h-8 w-8 text-ishanya-green" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-ishanya-green">Attendance</h3>
                  <p className="text-gray-500">Track employee attendance records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-ishanya-green/10 p-3 rounded-full">
                  <FileSpreadsheet className="h-8 w-8 text-ishanya-green" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-ishanya-green">Reports</h3>
                  <p className="text-gray-500">View HR reports and statistics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <TableView table={selectedTable} />
        </div>
      )}
    </Layout>
  );
};

export default HRDashboard;
