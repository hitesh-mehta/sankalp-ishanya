
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

export function AccessibilityMenu() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isDyslexiaMode, setIsDyslexiaMode] = useState(() => {
    const savedMode = localStorage.getItem("dyslexiaMode");
    return savedMode === "true";
  });

  // Apply dyslexia class to body when component mounts and when mode changes
  useEffect(() => {
    if (isDyslexiaMode) {
      document.body.classList.add("dyslexia-mode");
    } else {
      document.body.classList.remove("dyslexia-mode");
    }
    
    // Save preference to localStorage
    localStorage.setItem("dyslexiaMode", isDyslexiaMode.toString());
  }, [isDyslexiaMode]);

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
        
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
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
        
        <DropdownMenuItem onClick={() => setIsDyslexiaMode(!isDyslexiaMode)}>
          <BookOpen className="h-4 w-4 mr-2" />
          {isDyslexiaMode 
            ? t("common.disable") + " " + t("common.dyslexia")
            : t("common.enable") + " " + t("common.dyslexia")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
