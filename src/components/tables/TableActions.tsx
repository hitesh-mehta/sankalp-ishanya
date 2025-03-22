
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, Columns, Trash, Edit, FilePlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { addColumn } from '@/lib/api';
import CsvUpload from './CsvUpload';

type TableActionsProps = {
  tableName: string;
  onInsert: () => void;
  onRefresh: () => void;
};

const TableActions = ({ tableName, onInsert, onRefresh }: TableActionsProps) => {
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('text');
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const handleAddColumn = async () => {
    setIsAddingColumn(true);
    try {
      await addColumn(tableName, newColumnName, newColumnType);
      onRefresh();
      setNewColumnName('');
      setNewColumnType('text');
    } finally {
      setIsAddingColumn(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <Button
        onClick={onInsert}
        className="bg-ishanya-green hover:bg-ishanya-green/90"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Insert Row
      </Button>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-ishanya-green text-ishanya-green hover:bg-ishanya-green/10">
            <Columns className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="column-name">Column Name</Label>
              <Input
                id="column-name"
                placeholder="Enter column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="column-type">Column Type</Label>
              <select
                id="column-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newColumnType}
                onChange={(e) => setNewColumnType(e.target.value)}
              >
                <option value="text">Text</option>
                <option value="integer">Integer</option>
                <option value="float">Float</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
                <option value="timestamp">Timestamp</option>
              </select>
            </div>
            <Button
              onClick={handleAddColumn}
              disabled={!newColumnName || isAddingColumn}
              className="w-full bg-ishanya-green hover:bg-ishanya-green/90"
            >
              {isAddingColumn ? 'Adding...' : 'Add Column'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-ishanya-yellow text-ishanya-yellow hover:bg-ishanya-yellow/10">
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload CSV Data</DialogTitle>
          </DialogHeader>
          <CsvUpload tableName={tableName} onSuccess={onRefresh} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableActions;
