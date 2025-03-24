
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/ui/LanguageProvider';

type HeaderProps = {
  title: string;
  subtitle?: string;
};

const Header = ({ title, subtitle }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 w-full bg-ishanya-yellow dark:bg-ishanya-yellow/80 py-4 px-4 md:px-8 transition-all duration-300 z-10 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-screen-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-balance dark:text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-gray-700 dark:text-gray-800 max-w-3xl text-balance">{subtitle}</p>
        )}
      </div>
    </header>
  );
};

export default Header;
