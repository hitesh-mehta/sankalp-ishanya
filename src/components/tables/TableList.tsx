
import { useEffect, useState } from 'react';
import { Program, TableInfo, fetchTablesByProgram } from '@/lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorDisplay';
import { Database, Table as TableIcon } from 'lucide-react';

type TableListProps = {
  program: Program;
  onSelectTable: (table: TableInfo) => void;
  selectedTable?: TableInfo;
};

const TableList = ({ program, onSelectTable, selectedTable }: TableListProps) => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTables = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchTablesByProgram(program.id);
      if (data) {
        setTables(data);
        
        // Auto-select the first table if none is selected
        if (data.length > 0 && !selectedTable) {
          onSelectTable(data[0]);
        }
      } else {
        setError('Failed to load tables. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [program.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={loadTables} />;
  }

  if (tables.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
        <h3 className="text-md font-medium text-gray-800">No tables found</h3>
        <p className="text-gray-600 mt-1 text-sm">
          There are no tables available for this program.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-4">
        <Database className="h-5 w-5 text-ishanya-green mr-2" />
        <h3 className="font-semibold">Available Tables</h3>
      </div>
      
      <div className="space-y-1">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${
              selectedTable?.id === table.id
                ? 'bg-ishanya-green text-white'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onSelectTable(table)}
          >
            <TableIcon className={`h-4 w-4 mr-2 ${
              selectedTable?.id === table.id ? 'text-white' : 'text-ishanya-green'
            }`} />
            <span>{table.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableList;
