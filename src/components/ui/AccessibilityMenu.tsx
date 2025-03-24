
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
      if (isDyslexiaMode) {
        document.body.classList.add("dyslexia-mode");
        document.documentElement.style.scrollBehavior = 'smooth';
      } else {
        document.body.classList.remove("dyslexia-mode");
        document.documentElement.style.scrollBehavior = 'auto';
      }
    };
    
    // Apply with a slight delay to ensure smooth transition
    const timer = setTimeout(() => {
      applyDyslexiaMode();
    }, 50);
    
    // Save preference to localStorage
    localStorage.setItem("dyslexiaMode", isDyslexiaMode.toString());
    
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("common.language")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setLanguage("english")}>
          <span className={language === "english" ? "font-bold" : ""}>
            {t("common.english")}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("hindi")}>
          <span className={language === "hindi" ? "font-bold" : ""}>
            {t("common.hindi")}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("kannada")}>
          <span className={language === "kannada" ? "font-bold" : ""}>
            {t("common.kannada")}
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>{t("common.theme.title") || "Theme"}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          <span className={theme === "light" ? "font-bold" : ""}>
            {t("common.theme.light")}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          <span className={theme === "dark" ? "font-bold" : ""}>
            {t("common.theme.dark")}
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={toggleDyslexiaMode}>
          <BookOpen className="h-4 w-4 mr-2" />
          {isDyslexiaMode 
            ? t("common.disable") + " " + t("common.dyslexia")
            : t("common.enable") + " " + t("common.dyslexia")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
