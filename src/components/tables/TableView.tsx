import { useEffect, useState } from 'react';
import { TableInfo, fetchTableData, deleteRow, updateRow, insertRow, fetchTableColumns, validateData } from '@/lib/api';
import supabase from '@/lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorDisplay';
import TableActions from './TableActions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash, Save, Search, Filter, X, ChevronRight, Eye, AlertCircle } from 'lucide-react';
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const loadTableData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all possible columns for this table first
      console.log(`Fetching columns for table ${table.name}`);
      const tableColumns = await fetchTableColumns(table.name);
      if (tableColumns) {
        console.log(`Columns for ${table.name}:`, tableColumns);
        setAllColumns(tableColumns); // Keep all columns for data operations
        setColumns(tableColumns); // Use filtered columns for display
      } else {
        console.error(`No columns returned for ${table.name}`);
      }
      
      // Fetch data with center_id filter if available
      console.log(`Fetching data from ${table.name} with center_id: ${table.center_id}`);
      const result = await fetchTableData(table.name, table.center_id);
      if (result) {
        console.log(`Loaded ${result.length} records from ${table.name}:`, result);
        setData(result);
        setFilteredData(result);
      } else {
        console.error(`Failed to load data from ${table.name}`);
        setError('Failed to load table data. Please try again.');
      }
    } catch (err) {
      console.error('Error in loadTableData:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!table.name) return;
    
    console.log(`Setting up real-time subscription for ${table.name}`);
    
    // Subscribe to changes in the table
    const channel = supabase
      .channel(`${table.name}-changes`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: table.name.toLowerCase() 
      }, (payload) => {
        console.log('Change received:', payload);
        
        // Reload data after any change
        loadTableData();
      })
      .subscribe();
    
    // Clean up subscription when component unmounts or table changes
    return () => {
      console.log(`Cleaning up subscription for ${table.name}`);
      supabase.removeChannel(channel);
    };
  }, [table.id, table.name]);
  
  useEffect(() => {
    loadTableData();
  }, [table.id, table.name, table.center_id]);

  useEffect(() => {
    let result = [...data];
    
    // Apply search
    if (searchTerm) {
      result = result.filter(row => 
        Object.entries(row).some(([key, value]) => 
          key !== 'id' && // Exclude UUID from search
          value !== null && 
          String(value)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply filters
    Object.entries(filterValues).forEach(([column, value]) => {
      if (value) {
        result = result.filter(row => 
          row[column] !== undefined && 
          row[column] !== null &&
          String(row[column])
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      }
    });
    
    setFilteredData(result);
  }, [data, searchTerm, filterValues]);

  const handleViewDetails = (row: any) => {
    setDetailedViewRow({...row});
    setIsDetailedViewOpen(true);
  };

  const handleSaveDetailedView = async () => {
    if (!detailedViewRow) return;
    
    try {
      console.log(`Saving changes to row in ${table.name}:`, detailedViewRow);
      
      // Ensure created_at is present and valid
      if (!detailedViewRow.created_at || detailedViewRow.created_at === '') {
        detailedViewRow.created_at = new Date().toISOString();
      }
      
      const result = await updateRow(table.name, detailedViewRow.id, detailedViewRow);
      
      if (result.success) {
        toast.success('Record updated successfully');
        setIsDetailedViewOpen(false);
      } else if (result.errors) {
        console.error('Update errors:', result.errors);
        setValidationErrors(result.errors);
        toast.error('Please correct the validation errors');
      }
    } catch (err) {
      console.error('Error in handleSaveDetailedView:', err);
      toast.error('An error occurred while updating the record');
    }
  };

  const handleDeleteRow = async (id: number) => {
    if (window.confirm(`Are you sure you want to delete this record?`)) {
      try {
        console.log(`Deleting row with id ${id} from ${table.name}`);
        const success = await deleteRow(table.name, id);
        if (success) {
          toast.success('Record deleted successfully');
          setIsDetailedViewOpen(false);
        } else {
          toast.error('Failed to delete record');
        }
      } catch (err) {
        console.error('Error in handleDeleteRow:', err);
        toast.error('An error occurred while deleting the record');
      }
    }
  };

  const handleEditClick = (row: any) => {
    console.log('Editing row:', row);
    setEditingRow({ ...row });
    setIsEditing(true);
    setValidationErrors({});
  };

  const handleEditChange = (column: string, value: string) => {
    setEditingRow({
      ...editingRow,
      [column]: value,
    });
    
    if (validationErrors[column]) {
      const newErrors = { ...validationErrors };
      delete newErrors[column];
      setValidationErrors(newErrors);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRow) return;
    
    try {
      // Ensure created_at is present and valid
      if (!editingRow.created_at || editingRow.created_at === '') {
        editingRow.created_at = new Date().toISOString();
      }
      
      console.log(`Updating row in ${table.name}:`, editingRow);
      
      const result = await updateRow(table.name, editingRow.id, editingRow);
      if (result.success) {
        toast.success('Record updated successfully');
        setIsEditing(false);
        setEditingRow(null);
        setValidationErrors({});
      } else if (result.errors) {
        console.error('Update errors:', result.errors);
        setValidationErrors(result.errors);
      }
    } catch (err) {
      console.error('Error in handleSaveEdit:', err);
      toast.error('An error occurred while updating the record');
    }
  };

  const handleInsertClick = () => {
    const initialNewRow: Record<string, any> = {};
    
    allColumns.forEach(column => {
      if (column === 'center_id' && table.center_id) {
        initialNewRow[column] = table.center_id;
      } else if (column === 'program_id' && table.program_id) {
        initialNewRow[column] = table.program_id;
      } else if (column === 'created_at') {
        initialNewRow[column] = new Date().toISOString();
      } else {
        initialNewRow[column] = '';
      }
    });
    
    console.log('New row template:', initialNewRow);
    setNewRow(initialNewRow);
    setIsInsertDialogOpen(true);
    setValidationErrors({});
  };

  const handleInsertChange = (column: string, value: string) => {
    setNewRow({
      ...newRow,
      [column]: value,
    });
    
    if (validationErrors[column]) {
      const newErrors = { ...validationErrors };
      delete newErrors[column];
      setValidationErrors(newErrors);
    }
  };

  const handleInsertSubmit = async () => {
    try {
      if (!newRow.created_at || newRow.created_at === '') {
        newRow.created_at = new Date().toISOString();
      }
      
      console.log(`Inserting row into ${table.name}:`, newRow);
      
      const result = await insertRow(table.name, newRow);
      if (result.success) {
        toast.success('Record added successfully');
        setIsInsertDialogOpen(false);
        setNewRow({});
        setValidationErrors({});
      } else if (result.errors) {
        console.error('Insert errors:', result.errors);
        setValidationErrors(result.errors);
      }
    } catch (err) {
      console.error('Error in handleInsertSubmit:', err);
      toast.error('An error occurred while adding the record');
    }
  };

  const clearFilters = () => {
    setFilterValues({});
    setSearchTerm('');
  };

  const handleFilterChange = (column: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const shouldUseTextarea = (column: string): boolean => {
    return column === 'description' || 
           column === 'comments' || 
           column === 'strengths' || 
           column === 'weakness' || 
           column === 'address';
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
      
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search all columns..."
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50 border-ishanya-green/20 shadow-inner">
          {columns
            .filter(column => column !== 'created_at')
            .map(column => (
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
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-ishanya-green/10">
                {columns
                  .filter(column => column !== 'created_at')
                  .map((column) => (
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
                    {columns
                      .filter(column => column !== 'created_at')
                      .map((column) => (
                        <TableCell 
                          key={`${row.id}-${column}`}
                          onClick={() => handleViewDetails(row)}
                          className="py-3"
                        >
                          {isEditing && editingRow?.id === row.id ? (
                            <div>
                              {shouldUseTextarea(column) ? (
                                <Textarea
                                  value={row[column] !== null && row[column] !== undefined ? String(row[column] || '') : ''}
                                  onChange={(e) => handleEditChange(column, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`min-h-[100px] border-ishanya-green/30 focus-visible:ring-ishanya-green ${
                                    validationErrors[column] ? 'border-red-500' : ''
                                  }`}
                                />
                              ) : (
                                <Input
                                  value={row[column] !== null && row[column] !== undefined ? String(row[column] || '') : ''}
                                  onChange={(e) => handleEditChange(column, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`border-ishanya-green/30 focus-visible:ring-ishanya-green ${
                                    validationErrors[column] ? 'border-red-500' : ''
                                  }`}
                                />
                              )}
                              {validationErrors[column] && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors[column]}</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="truncate max-w-[200px]">
                                {row[column] !== null && row[column] !== undefined ? String(row[column]) : ''}
                              </span>
                              {column === columns.filter(c => c !== 'created_at')[columns.filter(c => c !== 'created_at').length - 1] && (
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

      <Dialog open={isInsertDialogOpen} onOpenChange={setIsInsertDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-ishanya-green">Insert New Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {allColumns
              .filter(column => column !== 'id' && column !== 'created_at')
              .map((column) => {
                const isRequired = (
                  column === 'center_id' || 
                  column === 'program_id' || 
                  column === 'name' || 
                  column === 'first_name' || 
                  column === 'last_name' || 
                  column === 'email'
                );
                
                return (
                  <div key={column} className="space-y-2">
                    <Label htmlFor={`insert-${column}`} className="text-sm text-gray-700 flex items-center">
                      {column}
                      {isRequired && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {shouldUseTextarea(column) ? (
                      <Textarea
                        id={`insert-${column}`}
                        placeholder={`Enter ${column}`}
                        value={newRow[column] || ''}
                        onChange={(e) => handleInsertChange(column, e.target.value)}
                        className={`min-h-[100px] border-ishanya-green/30 focus-visible:ring-ishanya-green ${
                          validationErrors[column] ? 'border-red-500' : ''
                        }`}
                      />
                    ) : (
                      <Input
                        id={`insert-${column}`}
                        placeholder={`Enter ${column}`}
                        value={newRow[column] || ''}
                        onChange={(e) => handleInsertChange(column, e.target.value)}
                        className={`border-ishanya-green/30 focus-visible:ring-ishanya-green ${
                          validationErrors[column] ? 'border-red-500' : ''
                        }`}
                      />
                    )}
                    {validationErrors[column] && (
                      <p className="text-red-500 text-xs">{validationErrors[column]}</p>
                    )}
                  </div>
                );
              })}
            
            {validationErrors.general && (
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
                  <AlertCircle className="h-5 w-5" />
                  <span>{validationErrors.general}</span>
                </div>
              </div>
            )}
            
            <div className="col-span-1 md:col-span-2 mt-4">
              <Button
                onClick={handleInsertSubmit}
                className="w-full bg-ishanya-green hover:bg-ishanya-green/90 shadow-md transition-all duration-300 hover:shadow-lg"
              >
                Insert Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailedViewOpen} onOpenChange={setIsDetailedViewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-ishanya-green">
              {detailedViewRow ? `${table.display_name || table.name}: ${detailedViewRow.name || detailedViewRow.first_name || 'Details'}` : 'Record Details'}
            </DialogTitle>
          </DialogHeader>
          {detailedViewRow && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
              {allColumns
                .filter(column => column !== 'id')
                .map(column => (
                <div key={column} className="space-y-1 border-b pb-2">
                  <Label className="text-xs text-gray-500">{column}</Label>
                  <div className="font-medium text-gray-800">
                    {shouldUseTextarea(column) ? (
                      <Textarea
                        value={detailedViewRow[column] !== undefined && detailedViewRow[column] !== null 
                          ? String(detailedViewRow[column]) 
                          : ''}
                        onChange={(e) => {
                          setDetailedViewRow({
                            ...detailedViewRow,
                            [column]: e.target.value
                          });
                        }}
                        className="min-h-[100px] border-ishanya-green/30 focus-visible:ring-ishanya-green"
                      />
                    ) : (
                      <Input
                        value={detailedViewRow[column] !== undefined && detailedViewRow[column] !== null 
                          ? String(detailedViewRow[column]) 
                          : ''}
                        onChange={(e) => {
                          setDetailedViewRow({
                            ...detailedViewRow,
                            [column]: e.target.value
                          });
                        }}
                        className="border-ishanya-green/30 focus-visible:ring-ishanya-green"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button
              variant="default"
              onClick={handleSaveDetailedView}
              className="mr-2 bg-ishanya-green hover:bg-ishanya-green/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailedViewOpen(false);
              }}
              className="mr-2 border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (detailedViewRow) {
                  handleDeleteRow(detailedViewRow.id);
                  setIsDetailedViewOpen(false);
                }
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
