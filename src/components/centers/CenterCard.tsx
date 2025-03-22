
import { Building2 } from 'lucide-react';
import { Center } from '@/lib/api';
import { useState } from 'react';

type CenterCardProps = {
  center: Center;
  onClick: (center: Center) => void;
};

const CenterCard = ({ center, onClick }: CenterCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = () => {
    setIsLoading(true);
    // Call onClick immediately, no need for timeout that could potentially cause issues
    onClick(center);
    // Reset loading state after a brief period, giving visual feedback
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
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
          <div className="w-12 h-12 bg-ishanya-green/10 rounded-full flex items-center justify-center">
            <Building2 className="h-6 w-6 text-ishanya-green" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold">{center.name}</h3>
            <p className="text-sm text-gray-500">{center.location}</p>
          </div>
        </div>
        {isLoading && (
          <div className="w-5 h-5 border-2 border-ishanya-green border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      
      {center.description && (
        <p className="text-gray-600 mt-2 text-sm line-clamp-2">{center.description}</p>
      )}
      
      <div className="mt-4 flex justify-end">
        <span className="text-xs px-2 py-1 bg-ishanya-green/10 text-ishanya-green rounded-full">
          View Programs
        </span>
      </div>
    </div>
  );
};

export default CenterCard;
