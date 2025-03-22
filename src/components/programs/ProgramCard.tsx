
import { BookOpen } from 'lucide-react';
import { Program } from '@/lib/api';
import { useState } from 'react';

type ProgramCardProps = {
  program: Program;
  onClick: (program: Program) => void;
};

const ProgramCard = ({ program, onClick }: ProgramCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      onClick(program);
      setIsLoading(false);
    }, 300); // Small delay to show loading state
  };

  return (
    <div
      className={`glass-card glass-card-hover p-6 cursor-pointer transition-all duration-300 animate-scale-up ${
        isLoading ? 'opacity-70 pointer-events-none' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-ishanya-yellow/10 rounded-full flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-ishanya-yellow" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold">{program.name}</h3>
            <p className="text-sm text-gray-500">Program ID: {program.id}</p>
          </div>
        </div>
        {isLoading && (
          <div className="w-5 h-5 border-2 border-ishanya-yellow border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      
      {program.description && (
        <p className="text-gray-600 mt-2 text-sm line-clamp-2">{program.description}</p>
      )}
      
      <div className="mt-4 flex justify-end">
        <span className="text-xs px-2 py-1 bg-ishanya-yellow/10 text-ishanya-yellow rounded-full">
          View Tables
        </span>
      </div>
    </div>
  );
};

export default ProgramCard;
