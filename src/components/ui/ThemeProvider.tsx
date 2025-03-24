
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "./LanguageProvider";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const { t } = useLanguage();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply transition classes for smoother theme changes
    root.classList.add('transition-colors', 'duration-300');
    
    // Remove the class that's not currently active
    root.classList.remove("light", "dark");
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Store the theme preference
    localStorage.setItem(storageKey, theme);
    
    // Show a toast notification when theme changes
    toast.success(
      `${t('accessibility.theme_changed')} ${t(`common.theme.${theme}`)}`,
      { duration: 2000 }
    );
  }, [theme, storageKey, t]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return context;
};
