
import { Building2 } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type NavbarProps = {
  centerName?: string;
  programName?: string;
  onBack?: () => void;
  showBackButton?: boolean;
};

const Navbar = ({ centerName, programName, onBack, showBackButton = false }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <nav className="w-full bg-ishanya-green text-white shadow-md z-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 cursor-pointer flex items-center"
              onClick={handleLogoClick}
            >
              <Building2 className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">Ishanya Foundation</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button 
                onClick={onBack}
                className="rounded-full bg-white/20 hover:bg-white/30 px-4 py-1 text-white transition-colors duration-200"
              >
                Back
              </button>
            )}
            
            {centerName && (
              <div className="hidden md:block">
                <div className="text-sm opacity-70">Center</div>
                <div className="font-medium">{centerName}</div>
              </div>
            )}
            
            {programName && (
              <div className="hidden md:block">
                <div className="text-sm opacity-70">Program</div>
                <div className="font-medium">{programName}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
