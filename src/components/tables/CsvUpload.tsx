
import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { bulkInsert } from '@/lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';

type CsvUploadProps = {
  tableName: string;
  onSuccess: () => void;
};

const CsvUpload = ({ tableName, onSuccess }: CsvUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }
    
    setFile(selectedFile);
    
    // Parse CSV for preview
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      preview: 3, // Show only first 3 rows
      complete: (results) => {
        setPreviewData(results.data as any[]);
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
      }
    });
  };

  const handleUpload = () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          if (results.data.length === 0) {
            setError('The CSV file is empty');
            setUploading(false);
            return;
          }
          
          const success = await bulkInsert(tableName, results.data as any[]);
          
          if (success) {
            setFile(null);
            setPreviewData(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            onSuccess();
          }
        } catch (err) {
          console.error('Upload error:', err);
          setError('Failed to upload data. Please try again.');
        } finally {
          setUploading(false);
        }
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
        setUploading(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="csv-file"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">CSV files only</p>
          </div>
          <input
            id="csv-file"
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
      
      {error && (
        <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
      
      {previewData && previewData.length > 0 && (
        <div className="rounded-md border overflow-x-auto max-h-40">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                {Object.keys(previewData[0]).map((header) => (
                  <th key={header} className="px-4 py-2 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index} className="border-t">
                  {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2">
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-ishanya-green hover:bg-ishanya-green/90"
        >
          {uploading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Upload Data
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CsvUpload;
