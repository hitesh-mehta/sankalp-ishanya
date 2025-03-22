
import { useEffect, useState } from 'react';

type HeaderProps = {
  title: string;
  subtitle?: string;
};

const Header = ({ title, subtitle }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  
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
      className={`sticky top-0 w-full bg-ishanya-yellow py-4 px-4 md:px-8 transition-all duration-300 shadow-sm z-10 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-screen-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-balance">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-gray-700 max-w-3xl text-balance">{subtitle}</p>
        )}
      </div>
    </header>
  );
};

export default Header;
