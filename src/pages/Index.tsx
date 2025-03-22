
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import CenterList from '@/components/centers/CenterList';
import ProgramList from '@/components/programs/ProgramList';
import TableList from '@/components/tables/TableList';
import TableView from '@/components/tables/TableView';
import { Center, Program, TableInfo } from '@/lib/api';

const Index = () => {
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);

  // Handle center selection
  const handleSelectCenter = (center: Center) => {
    setSelectedCenter(center);
    setSelectedProgram(null);
    setSelectedTable(null);
  };

  // Handle program selection
  const handleSelectProgram = (program: Program) => {
    setSelectedProgram(program);
    setSelectedTable(null);
  };

  // Handle table selection
  const handleSelectTable = (table: TableInfo) => {
    setSelectedTable(table);
  };

  // Handle back button click
  const handleBack = () => {
    if (selectedTable) {
      setSelectedTable(null);
    } else if (selectedProgram) {
      setSelectedProgram(null);
    } else if (selectedCenter) {
      setSelectedCenter(null);
    }
  };

  // Get title and subtitle for the current view
  const getViewDetails = () => {
    if (selectedCenter && selectedProgram && selectedTable) {
      return {
        title: `${selectedTable.name} Table`,
        subtitle: `Manage data for the ${selectedTable.name} table.`,
        showBackButton: true,
      };
    } else if (selectedCenter && selectedProgram) {
      return {
        title: `Tables for ${selectedProgram.name}`,
        subtitle: `Select a table to view and manage its data.`,
        showBackButton: true,
      };
    } else if (selectedCenter) {
      return {
        title: `Programs at ${selectedCenter.name}`,
        subtitle: `Select a program to view its tables and data.`,
        showBackButton: true,
      };
    } else {
      return {
        title: 'Ishanya Foundation Admin Dashboard',
        subtitle: 'Select a center to get started.',
        showBackButton: false,
      };
    }
  };

  const { title, subtitle, showBackButton } = getViewDetails();

  return (
    <Layout
      title={title}
      subtitle={subtitle}
      centerName={selectedCenter?.name}
      programName={selectedProgram?.name}
      onBack={handleBack}
      showBackButton={showBackButton}
    >
      {!selectedCenter && (
        <CenterList onSelectCenter={handleSelectCenter} />
      )}

      {selectedCenter && !selectedProgram && (
        <ProgramList center={selectedCenter} onSelectProgram={handleSelectProgram} />
      )}

      {selectedCenter && selectedProgram && (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4 lg:w-1/5">
            <div className="bg-white p-4 rounded-lg shadow">
              <TableList
                program={selectedProgram}
                onSelectTable={handleSelectTable}
                selectedTable={selectedTable || undefined}
              />
            </div>
          </div>
          
          <div className="md:w-3/4 lg:w-4/5">
            {selectedTable ? (
              <TableView table={selectedTable} />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <h3 className="text-xl font-semibold text-gray-800">Select a Table</h3>
                <p className="mt-2 text-gray-600">
                  Choose a table from the sidebar to view and manage its data.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Index;
