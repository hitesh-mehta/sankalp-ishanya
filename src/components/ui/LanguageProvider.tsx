
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type Language = "english" | "hindi" | "kannada";

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const initialState: LanguageProviderState = {
  language: "english",
  setLanguage: () => null,
  t: (key: string) => key,
};

const LanguageProviderContext = createContext<LanguageProviderState>(initialState);

// Translations object with keys for each language
const translations: Record<Language, Record<string, string>> = {
  english: {
    "login.title": "Sign In",
    "login.description": "Enter your credentials to access the dashboard",
    "login.email": "Email",
    "login.password": "Password",
    "login.role": "Role",
    "login.button": "Sign In",
    "login.contact": "Contact administrator if you need access",
    "common.enable": "Enable",
    "common.disable": "Disable",
    "common.dyslexia": "Dyslexia-Friendly Mode",
    "common.theme.light": "Light Mode",
    "common.theme.dark": "Dark Mode",
    "common.language": "Language",
    "common.english": "English",
    "common.hindi": "Hindi",
    "common.kannada": "Kannada",
    // Add more translations as needed
  },
  hindi: {
    "login.title": "साइन इन करें",
    "login.description": "डैशबोर्ड तक पहुंचने के लिए अपने क्रेडेंशियल दर्ज करें",
    "login.email": "ईमेल",
    "login.password": "पासवर्ड",
    "login.role": "भूमिका",
    "login.button": "साइन इन करें",
    "login.contact": "यदि आपको एक्सेस की आवश्यकता है तो व्यवस्थापक से संपर्क करें",
    "common.enable": "सक्षम करें",
    "common.disable": "अक्षम करें",
    "common.dyslexia": "डिस्लेक्सिया-अनुकूल मोड",
    "common.theme.light": "लाइट मोड",
    "common.theme.dark": "डार्क मोड",
    "common.language": "भाषा",
    "common.english": "अंग्रेज़ी",
    "common.hindi": "हिंदी",
    "common.kannada": "कन्नड़",
    // Add more translations as needed
  },
  kannada: {
    "login.title": "ಸೈನ್ ಇನ್",
    "login.description": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸಲು ನಿಮ್ಮ ರುಜುವಾತುಗಳನ್ನು ನಮೂದಿಸಿ",
    "login.email": "ಇಮೇಲ್",
    "login.password": "ಪಾಸ್‌ವರ್ಡ್",
    "login.role": "ಪಾತ್ರ",
    "login.button": "ಸೈನ್ ಇನ್",
    "login.contact": "ನಿಮಗೆ ಪ್ರವೇಶ ಬೇಕಿದ್ದರೆ ನಿರ್ವಾಹಕರನ್ನು ಸಂಪರ್ಕಿಸಿ",
    "common.enable": "ಸಕ್ರಿಯಗೊಳಿಸಿ",
    "common.disable": "ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ",
    "common.dyslexia": "ಡಿಸ್ಲೆಕ್ಸಿಯಾ-ಸ್ನೇಹಿ ಮೋಡ್",
    "common.theme.light": "ಬೆಳಕಿನ ಮೋಡ್",
    "common.theme.dark": "ಡಾರ್ಕ್ ಮೋಡ್",
    "common.language": "ಭಾಷೆ",
    "common.english": "ಇಂಗ್ಲಿಷ್",
    "common.hindi": "ಹಿಂದಿ",
    "common.kannada": "ಕನ್ನಡ",
    // Add more translations as needed
  }
};

export function LanguageProvider({
  children,
  defaultLanguage = "english",
  storageKey = "ui-language",
  ...props
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  );

  // Function to translate a key
  const translate = (key: string): string => {
    if (!translations[language][key]) {
      console.warn(`Translation missing for key: ${key} in ${language}`);
      // Fall back to English if the key doesn't exist in the current language
      return translations.english[key] || key;
    }
    return translations[language][key];
  };

  // Update language in localStorage when it changes
  useEffect(() => {
    localStorage.setItem(storageKey, language);
    toast.success(`Language changed to ${language}`, {
      duration: 2000,
    });
  }, [language, storageKey]);

  const value = {
    language,
    setLanguage: (language: Language) => {
      setLanguage(language);
    },
    t: translate,
  };

  return (
    <LanguageProviderContext.Provider {...props} value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);
  
  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");
  
  return context;
};
