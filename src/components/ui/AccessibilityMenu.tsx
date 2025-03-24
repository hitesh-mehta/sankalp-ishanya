
import { Moon, Sun, Globe, BookOpen } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useLanguage } from "@/components/ui/LanguageProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function AccessibilityMenu() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isDyslexiaMode, setIsDyslexiaMode] = useState(() => {
    const savedMode = localStorage.getItem("dyslexiaMode");
    return savedMode === "true";
  });

  // Apply dyslexia class to body when component mounts and when mode changes
  useEffect(() => {
    const applyDyslexiaMode = () => {
      const root = document.documentElement;
      
      if (isDyslexiaMode) {
        // Add dyslexia-friendly styles
        root.classList.add("dyslexia-mode");
        
        // Add to stylesheet for smooth transitions and better visual experience
        const style = document.createElement('style');
        style.id = 'dyslexia-styles';
        style.innerHTML = `
          body.dyslexia-mode {
            font-family: 'Open Sans', Arial, sans-serif;
            line-height: 1.6;
            letter-spacing: 0.05em;
            word-spacing: 0.15em;
          }
          .dyslexia-mode p, .dyslexia-mode h1, .dyslexia-mode h2, .dyslexia-mode h3, 
          .dyslexia-mode h4, .dyslexia-mode label, .dyslexia-mode span,
          .dyslexia-mode button, .dyslexia-mode a, .dyslexia-mode input, 
          .dyslexia-mode select, .dyslexia-mode textarea {
            font-family: 'Open Sans', Arial, sans-serif !important;
            line-height: 1.6 !important;
            letter-spacing: 0.05em !important;
            word-spacing: 0.15em !important;
            transition: all 0.3s ease-in-out;
          }
          .dyslexia-mode p, .dyslexia-mode label, .dyslexia-mode span {
            max-width: 70ch;
            line-height: 1.8 !important;
          }
        `;
        document.head.appendChild(style);
        
        // Set scroll behavior to smooth for better experience
        document.documentElement.style.scrollBehavior = 'smooth';
      } else {
        // Remove dyslexia-friendly styles
        root.classList.remove("dyslexia-mode");
        const dyslexiaStyles = document.getElementById('dyslexia-styles');
        if (dyslexiaStyles) {
          dyslexiaStyles.remove();
        }
        
        // Reset scroll behavior
        document.documentElement.style.scrollBehavior = 'auto';
      }
    };
    
    // Apply the changes with a slight delay to ensure smooth transition
    const timer = setTimeout(() => {
      applyDyslexiaMode();
    }, 50);
    
    // Save preference to localStorage
    localStorage.setItem("dyslexiaMode", isDyslexiaMode.toString());
    
    return () => clearTimeout(timer);
  }, [isDyslexiaMode]);

  const toggleDyslexiaMode = () => {
    setIsDyslexiaMode(!isDyslexiaMode);
    const message = !isDyslexiaMode 
      ? (t('accessibility.dyslexia_enabled') || 'Dyslexia-friendly mode enabled')
      : (t('accessibility.dyslexia_disabled') || 'Dyslexia-friendly mode disabled');
    
    toast.success(message, { duration: 2000 });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("common.language") || "Language"}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setLanguage("english")}>
          <span className={language === "english" ? "font-bold" : ""}>
            {t("common.english") || "English"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("hindi")}>
          <span className={language === "hindi" ? "font-bold" : ""}>
            {t("common.hindi") || "Hindi"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("kannada")}>
          <span className={language === "kannada" ? "font-bold" : ""}>
            {t("common.kannada") || "Kannada"}
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>{t("common.theme.title") || "Theme"}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          <span className={theme === "light" ? "font-bold" : ""}>
            {t("common.theme.light") || "Light"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          <span className={theme === "dark" ? "font-bold" : ""}>
            {t("common.theme.dark") || "Dark"}
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={toggleDyslexiaMode}>
          <BookOpen className="h-4 w-4 mr-2" />
          {isDyslexiaMode 
            ? (t("common.disable") || "Disable") + " " + (t("common.dyslexia") || "Dyslexia Mode")
            : (t("common.enable") || "Enable") + " " + (t("common.dyslexia") || "Dyslexia Mode")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
