import { useEffect, useState } from 'react';
import { Center, Program, fetchProgramsByCenter } from '@/lib/api';
import ProgramCard from './ProgramCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorDisplay';

type ProgramListProps = {
  center: Center;
  onSelectProgram: (program: Program) => void;
};

const ProgramList = ({ center, onSelectProgram }: ProgramListProps) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchProgramsByCenter(center.center_id);
      if (data) {
        setPrograms(data);
      } else {
        setError('Failed to load programs. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, [center.center_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={loadPrograms} />;
  }

  if (programs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <h3 className="text-lg font-medium text-gray-800">No programs found</h3>
        <p className="text-gray-600 mt-2">
          There are no programs available for {center.name} at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {programs.map((program) => (
        <ProgramCard key={program.id} program={program} onClick={onSelectProgram} />
      ))}
    </div>
  );
};

export default ProgramList;
