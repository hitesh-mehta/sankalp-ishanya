
import { AlertCircle } from 'lucide-react';

type ErrorDisplayProps = {
  message: string;
  onRetry?: () => void;
};

const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center animate-fade-in">
      <div className="flex flex-col items-center justify-center gap-2">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
        <p className="text-red-600">{message}</p>
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
