
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableInfo, fetchTablesByProgram } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import FilteredTableView from './FilteredTableView';

type TableListWrapperProps = {
  program: any;
  onSelectTable: (table: TableInfo) => void;
  selectedTable: TableInfo | null;
};

const TableListWrapper = ({ program, onSelectTable, selectedTable }: TableListWrapperProps) => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tablesData = await fetchTablesByProgram(program.program_id);
        if (!tablesData) {
          setError('Failed to fetch tables');
          return;
        }
        
        setTables(tablesData);
      } catch (err) {
        console.error('Error in fetchTables:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTables();
  }, [program]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (selectedTable) {
    return <FilteredTableView table={selectedTable} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tables.map((table) => (
        <Card 
          key={table.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelectTable(table)}
        >
          <CardHeader className="pb-2">
            <CardTitle>{table.display_name || table.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{table.description || `Manage ${table.name}`}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TableListWrapper;
