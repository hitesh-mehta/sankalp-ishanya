
import { useEffect, useState } from 'react';
import { TableInfo, fetchTableData, deleteRow, updateRow, insertRow } from '@/lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorDisplay';
import TableActions from './TableActions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Edit, Trash, Save } from 'lucide-react';
import { toast } from 'sonner';

type TableViewProps = {
  table: TableInfo;
};

const TableView = ({ table }: TableViewProps) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newRow, setNewRow] = useState<any>({});
  const [isInsertDialogOpen, setIsInsertDialogOpen] = useState(false);

  const loadTableData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchTableData(table.name);
      if (result) {
        setData(result);
        
        // Extract column names from the first row
        if (result.length > 0) {
          setColumns(Object.keys(result[0]));
        } else {
          // If no data, try to get columns from the API or use default
          setColumns(['id']);
        }
      } else {
        setError('Failed to load table data. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTableData();
  }, [table.id, table.name]);

  // Handle row deletion
  const handleDeleteRow = async (id: number) => {
    if (window.confirm(`Are you sure you want to delete this row?`)) {
      const success = await deleteRow(table.name, id);
      if (success) {
        loadTableData();
      }
    }
  };

  // Handle row editing
  const handleEditClick = (row: any) => {
    setEditingRow({ ...row });
    setIsEditing(true);
  };

  const handleEditChange = (column: string, value: string) => {
    setEditingRow({
      ...editingRow,
      [column]: value,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRow) return;
    
    const success = await updateRow(table.name, editingRow.id, editingRow);
    if (success) {
      setIsEditing(false);
      setEditingRow(null);
      loadTableData();
    }
  };

  // Handle row insertion
  const handleInsertClick = () => {
    // Initialize a new row with null values for all columns
    const initialNewRow = columns.reduce((acc, column) => {
      acc[column] = column === 'id' ? '' : '';
      return acc;
    }, {} as Record<string, string>);
    
    setNewRow(initialNewRow);
    setIsInsertDialogOpen(true);
  };

  const handleInsertChange = (column: string, value: string) => {
    setNewRow({
      ...newRow,
      [column]: value,
    });
  };

  const handleInsertSubmit = async () => {
    // Remove id if it's empty or auto-incremented
    const rowToInsert = { ...newRow };
    if (!rowToInsert.id) {
      delete rowToInsert.id;
    }
    
    const success = await insertRow(table.name, rowToInsert);
    if (success) {
      setIsInsertDialogOpen(false);
      setNewRow({});
      loadTableData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={loadTableData} />;
  }

  return (
    <div className="animate-fade-in">
      <TableActions 
        tableName={table.name} 
        onInsert={handleInsertClick}
        onRefresh={loadTableData}
      />
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
                <th className="w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-8 text-gray-500">
                    No data available in this table
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column) => (
                      <td key={`${row.id}-${column}`}>
                        {isEditing && editingRow?.id === row.id ? (
                          <Input
                            value={editingRow[column] || ''}
                            onChange={(e) => handleEditChange(column, e.target.value)}
                          />
                        ) : (
                          String(row[column] ?? '')
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="flex space-x-2">
                        {isEditing && editingRow?.id === row.id ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSaveEdit}
                            className="h-8 px-2 text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(row)}
                            className="h-8 px-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteRow(row.id)}
                          className="h-8 px-2 text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insert Row Dialog */}
      <Dialog open={isInsertDialogOpen} onOpenChange={setIsInsertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert New Row</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {columns
              .filter(column => column !== 'id') // Fix: Removed the comparison that caused the type error
              .map((column) => (
                <div key={column} className="space-y-2">
                  <Label htmlFor={`insert-${column}`}>{column}</Label>
                  <Input
                    id={`insert-${column}`}
                    placeholder={`Enter ${column}`}
                    value={newRow[column] || ''}
                    onChange={(e) => handleInsertChange(column, e.target.value)}
                    disabled={column === 'id'} // Optional: disable id field if auto-generated
                  />
                </div>
              ))}
            <Button
              onClick={handleInsertSubmit}
              className="w-full bg-ishanya-green hover:bg-ishanya-green/90"
            >
              Insert Row
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableView;
