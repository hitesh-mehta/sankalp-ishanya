
import { useEffect, useState } from 'react';
import { TableInfo, fetchTableData, deleteRow, updateRow, insertRow, fetchTableColumns } from '@/lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorDisplay';
import TableActions from './TableActions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Edit, Trash, Save, Search, Filter, X, ChevronRight, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type TableViewProps = {
  table: TableInfo;
};

const TableView = ({ table }: TableViewProps) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [allColumns, setAllColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newRow, setNewRow] = useState<any>({});
  const [isInsertDialogOpen, setIsInsertDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [detailedViewRow, setDetailedViewRow] = useState<any | null>(null);
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);

  const loadTableData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all possible columns for this table first
      const tableColumns = await fetchTableColumns(table.name);
      if (tableColumns) {
        setAllColumns(tableColumns);
      }
      
      const result = await fetchTableData(table.name);
      if (result) {
        setData(result);
        setFilteredData(result);
        
        // Extract display columns from the first row (basic info only)
        if (result.length > 0) {
          // For student tables, show a subset of columns for the initial view
          if (table.name.startsWith('Students')) {
            const basicColumns = ['id', 'name', 'age', 'grade', 'enrollment_date'];
            setColumns(basicColumns.filter(col => Object.keys(result[0]).includes(col)));
          } else {
            // For other tables, show all columns
            setColumns(Object.keys(result[0]));
          }
        } else {
          // If no data, use available columns or defaults
          setColumns(tableColumns || ['id']);
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

  // Apply search and filtering
  useEffect(() => {
    let result = [...data];
    
    // Apply search
    if (searchTerm) {
      result = result.filter(row => 
        columns.some(column => 
          String(row[column])
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply filters
    Object.entries(filterValues).forEach(([column, value]) => {
      if (value) {
        result = result.filter(row => 
          String(row[column])
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      }
    });
    
    setFilteredData(result);
  }, [data, searchTerm, filterValues]);

  // Handle detailed view of a row
  const handleViewDetails = (row: any) => {
    setDetailedViewRow(row);
    setIsDetailedViewOpen(true);
  };

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
    // Initialize a new row with empty values for all available columns
    const initialNewRow = allColumns.reduce((acc, column) => {
      acc[column] = '';
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

  // Clear all filters
  const clearFilters = () => {
    setFilterValues({});
    setSearchTerm('');
  };
  
  // Handle filter change
  const handleFilterChange = (column: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [column]: value
    }));
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

  const isFiltered = searchTerm !== '' || Object.values(filterValues).some(v => v !== '');

  return (
    <div className="animate-fade-in">
      <TableActions 
        tableName={table.name} 
        onInsert={handleInsertClick}
        onRefresh={loadTableData}
      />
      
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search table..."
              className="pl-10 border-ishanya-green/30 focus-visible:ring-ishanya-green"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="absolute right-3 top-3" 
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-700" />
              </button>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={isFilterOpen ? "bg-gray-100 border-ishanya-green/50 text-ishanya-green" : "border-ishanya-green/50 text-ishanya-green"}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          {isFiltered && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              size="sm"
              className="text-ishanya-green hover:text-ishanya-green/90 hover:bg-ishanya-green/10"
            >
              Clear All
            </Button>
          )}
        </div>
        
        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50 border-ishanya-green/20 shadow-inner">
            {columns.map(column => (
              <div key={`filter-${column}`} className="space-y-2">
                <Label htmlFor={`filter-${column}`} className="text-xs font-medium text-ishanya-green">
                  Filter by {column}
                </Label>
                <div className="relative">
                  <Input
                    id={`filter-${column}`}
                    placeholder={`Filter ${column}...`}
                    value={filterValues[column] || ''}
                    onChange={(e) => handleFilterChange(column, e.target.value)}
                    className="border-ishanya-green/30 focus-visible:ring-ishanya-green"
                  />
                  {filterValues[column] && (
                    <button 
                      className="absolute right-3 top-3" 
                      onClick={() => handleFilterChange(column, '')}
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-700" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-ishanya-green/10">
                {columns.map((column) => (
                  <TableHead key={column} className="text-ishanya-green font-medium">
                    {column}
                  </TableHead>
                ))}
                <TableHead className="w-28 text-ishanya-green font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8 text-gray-500">
                    No data matching current filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                    {columns.map((column) => (
                      <TableCell 
                        key={`${row.id}-${column}`}
                        onClick={() => handleViewDetails(row)}
                        className="py-3"
                      >
                        {isEditing && editingRow?.id === row.id ? (
                          <Input
                            value={editingRow[column] || ''}
                            onChange={(e) => handleEditChange(column, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="border-ishanya-green/30 focus-visible:ring-ishanya-green"
                          />
                        ) : (
                          <div className="flex items-center">
                            <span className="truncate max-w-[200px]">{String(row[column] ?? '')}</span>
                            {column === columns[columns.length - 1] && (
                              <ChevronRight className="h-4 w-4 ml-2 text-gray-400" />
                            )}
                          </div>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(row)}
                          className="h-8 px-2 text-ishanya-green border-ishanya-green hover:bg-ishanya-green/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Insert Row Dialog */}
      <Dialog open={isInsertDialogOpen} onOpenChange={setIsInsertDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-ishanya-green">Insert New Row</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {allColumns
              .filter(column => column !== 'id') // Don't show ID field for insertion
              .map((column) => (
                <div key={column} className="space-y-2">
                  <Label htmlFor={`insert-${column}`} className="text-sm text-gray-700">{column}</Label>
                  <Input
                    id={`insert-${column}`}
                    placeholder={`Enter ${column}`}
                    value={newRow[column] || ''}
                    onChange={(e) => handleInsertChange(column, e.target.value)}
                    className="border-ishanya-green/30 focus-visible:ring-ishanya-green"
                  />
                </div>
              ))}
            <div className="col-span-1 md:col-span-2 mt-4">
              <Button
                onClick={handleInsertSubmit}
                className="w-full bg-ishanya-green hover:bg-ishanya-green/90 shadow-md transition-all duration-300 hover:shadow-lg"
              >
                Insert Row
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detailed View Dialog */}
      <Dialog open={isDetailedViewOpen} onOpenChange={setIsDetailedViewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-ishanya-green">
              {detailedViewRow ? `${table.name.replace('_', ' ')}: ${detailedViewRow.name || 'Details'}` : 'Row Details'}
            </DialogTitle>
          </DialogHeader>
          {detailedViewRow && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
              {allColumns.map(column => (
                <div key={column} className="space-y-1 border-b pb-2">
                  <Label className="text-xs text-gray-500">{column}</Label>
                  <div className="font-medium text-gray-800">
                    {detailedViewRow[column] !== undefined ? String(detailedViewRow[column]) : '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                handleEditClick(detailedViewRow);
                setIsDetailedViewOpen(false);
              }}
              className="mr-2 border-ishanya-green text-ishanya-green hover:bg-ishanya-green/10"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteRow(detailedViewRow.id);
                setIsDetailedViewOpen(false);
              }}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableView;
