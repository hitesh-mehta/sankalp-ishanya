import { useEffect, useState } from 'react';
import { Center, fetchCenters } from '@/lib/api';
import CenterCard from './CenterCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorDisplay';

type CenterListProps = {
  onSelectCenter: (center: Center) => void;
  centers?: Center[];  // Make centers optional
};

const CenterList = ({ onSelectCenter, centers: propCenters }: CenterListProps) => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCenters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchCenters();
      if (data) {
        setCenters(data);
      } else {
        setError('Failed to load centers. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If centers are provided as props, use them
    if (propCenters && propCenters.length > 0) {
      setCenters(propCenters);
      setLoading(false);
    } else {
      // Otherwise fetch them
      loadCenters();
    }
  }, [propCenters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={loadCenters} />;
  }

  if (centers.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <h3 className="text-lg font-medium text-gray-800">No centers found</h3>
        <p className="text-gray-600 mt-2">There are no centers available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {centers.map((center) => (
        <CenterCard key={center.id} center={center} onClick={onSelectCenter} />
      ))}
    </div>
  );
};

export default CenterList;
