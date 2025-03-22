
import { AlertCircle } from 'lucide-react';

type ErrorDisplayProps = {
  message: string;
  onRetry?: () => void;
};

const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  // Check if the error is related to Supabase configuration
  const isConfigError = message.includes('configuration') || 
                        message.includes('Failed to fetch') ||
                        message.includes('connection');
  
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center animate-fade-in">
      <div className="flex flex-col items-center justify-center gap-2">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
        <p className="text-red-600">{message}</p>
        
        {isConfigError && (
          <div className="mt-2 text-sm text-gray-700 bg-gray-100 p-4 rounded-md text-left">
            <p className="font-semibold">Possible Fix:</p>
            <p>You need to set up your Supabase credentials. Please update them by:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Creating a <code>.env</code> file in the project root</li>
              <li>Adding these variables with your actual values:
                <pre className="bg-gray-200 p-2 mt-1 rounded text-xs overflow-x-auto">
                  VITE_SUPABASE_URL=your_supabase_url_here
                  VITE_SUPABASE_KEY=your_supabase_anon_key_here
                </pre>
              </li>
              <li>Restart your development server</li>
            </ol>
          </div>
        )}
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
