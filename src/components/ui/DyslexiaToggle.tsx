
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { toast } from 'sonner';

export const DyslexiaToggle = () => {
  const { t } = useLanguage();
  const [isDyslexiaMode, setIsDyslexiaMode] = useState(() => {
    // Check if there's a saved preference in localStorage
    const savedMode = localStorage.getItem('dyslexiaMode');
    return savedMode === 'true';
  });

  // Apply dyslexia class to body when component mounts and when mode changes
  useEffect(() => {
    const applyDyslexiaMode = () => {
      if (isDyslexiaMode) {
        document.body.classList.add('dyslexia-mode');
        document.documentElement.style.scrollBehavior = 'smooth';
      } else {
        document.body.classList.remove('dyslexia-mode');
        document.documentElement.style.scrollBehavior = 'auto';
      }
    };
    
    // Apply with a slight delay to ensure smooth transition
    const timer = setTimeout(() => {
      applyDyslexiaMode();
    }, 50);
    
    // Save preference to localStorage
    localStorage.setItem('dyslexiaMode', isDyslexiaMode.toString());
    
    return () => clearTimeout(timer);
  }, [isDyslexiaMode]);

  const toggleDyslexiaMode = () => {
    setIsDyslexiaMode(!isDyslexiaMode);
    toast.success(
      !isDyslexiaMode 
        ? t('accessibility.dyslexia_enabled') || 'Dyslexia-friendly mode enabled' 
        : t('accessibility.dyslexia_disabled') || 'Dyslexia-friendly mode disabled',
      { duration: 2000 }
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline"
            size="icon"
            onClick={toggleDyslexiaMode}
            className={`rounded-full transition-all duration-300 ${
              isDyslexiaMode 
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-800 dark:text-amber-100' 
                : ''
            }`}
            aria-label={isDyslexiaMode ? t('common.disable') : t('common.enable') + ' ' + t('common.dyslexia')}
          >
            {isDyslexiaMode ? <BookOpen className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isDyslexiaMode ? t('common.disable') : t('common.enable')} {t('common.dyslexia')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DyslexiaToggle;
