
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
    "login.logout_success": "Logged out successfully",
    "common.enable": "Enable",
    "common.disable": "Disable",
    "common.dyslexia": "Dyslexia-Friendly Mode",
    "common.theme.title": "Theme",
    "common.theme.light": "Light Mode",
    "common.theme.dark": "Dark Mode",
    "common.language": "Language",
    "common.english": "English",
    "common.hindi": "Hindi",
    "common.kannada": "Kannada",
    "common.dashboard": "Dashboard",
    "common.students": "Students",
    "common.employees": "Employees",
    "common.reports": "Reports",
    "common.settings": "Settings",
    "common.profile": "Profile",
    "common.logout": "Logout",
    "common.back": "Back",
    "accessibility.dyslexia_enabled": "Dyslexia-friendly mode enabled",
    "accessibility.dyslexia_disabled": "Dyslexia-friendly mode disabled",
    "accessibility.theme_changed": "Theme changed to",
    "accessibility.language_changed": "Language changed to",
    "dashboard.welcome": "Welcome to your dashboard",
    "dashboard.notifications": "Notifications",
    "dashboard.recent_activity": "Recent Activity",
    "dashboard.students": "Students",
    "dashboard.announcements": "Announcements",
    "dashboard.no_data": "No data available",
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
    "login.logout_success": "आप सफलतापूर्वक लॉग आउट हो गए हैं",
    "common.enable": "सक्षम करें",
    "common.disable": "अक्षम करें",
    "common.dyslexia": "डिस्लेक्सिया-अनुकूल मोड",
    "common.theme.title": "थीम",
    "common.theme.light": "लाइट मोड",
    "common.theme.dark": "डार्क मोड",
    "common.language": "भाषा",
    "common.english": "अंग्रेज़ी",
    "common.hindi": "हिंदी",
    "common.kannada": "कन्नड़",
    "common.dashboard": "डैशबोर्ड",
    "common.students": "छात्र",
    "common.employees": "कर्मचारी",
    "common.reports": "रिपोर्ट",
    "common.settings": "सेटिंग्स",
    "common.profile": "प्रोफ़ाइल",
    "common.logout": "लॉग आउट",
    "common.back": "वापस",
    "accessibility.dyslexia_enabled": "डिस्लेक्सिया-अनुकूल मोड सक्षम",
    "accessibility.dyslexia_disabled": "डिस्लेक्सिया-अनुकूल मोड अक्षम",
    "accessibility.theme_changed": "थीम बदलकर कर दी गई है",
    "accessibility.language_changed": "भाषा बदलकर कर दी गई है",
    "dashboard.welcome": "अपने डैशबोर्ड पर आपका स्वागत है",
    "dashboard.notifications": "सूचनाएं",
    "dashboard.recent_activity": "हाल की गतिविधि",
    "dashboard.students": "छात्र",
    "dashboard.announcements": "घोषणाएँ",
    "dashboard.no_data": "कोई डेटा उपलब्ध नहीं है",
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
    "login.logout_success": "ನೀವು ಯಶಸ್ವಿಯಾಗಿ ಲಾಗ್ ಔಟ್ ಆಗಿದ್ದೀರಿ",
    "common.enable": "ಸಕ್ರಿಯಗೊಳಿಸಿ",
    "common.disable": "ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ",
    "common.dyslexia": "ಡಿಸ್ಲೆಕ್ಸಿಯಾ-ಸ್ನೇಹಿ ಮೋಡ್",
    "common.theme.title": "ಥೀಮ್",
    "common.theme.light": "ಬೆಳಕಿನ ಮೋಡ್",
    "common.theme.dark": "ಡಾರ್ಕ್ ಮೋಡ್",
    "common.language": "ಭಾಷೆ",
    "common.english": "ಇಂಗ್ಲಿಷ್",
    "common.hindi": "ಹಿಂದಿ",
    "common.kannada": "ಕನ್ನಡ",
    "common.dashboard": "ಡ್ಯಾಶ್ಬೋರ್ಡ್",
    "common.students": "ವಿದ್ಯಾರ್ಥಿಗಳು",
    "common.employees": "ನೌಕರರು",
    "common.reports": "ವರದಿಗಳು",
    "common.settings": "ಸೆಟ್ಟಿಂಗ್ಗಳು",
    "common.profile": "ಪ್ರೊಫೈಲ್",
    "common.logout": "ಲಾಗ್ ಔಟ್",
    "common.back": "ಹಿಂದೆ",
    "accessibility.dyslexia_enabled": "ಡಿಸ್ಲೆಕ್ಸಿಯಾ-ಸ್ನೇಹಿ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ",
    "accessibility.dyslexia_disabled": "ಡಿಸ್ಲೆಕ್ಸಿಯಾ-ಸ್ನೇಹಿ ಮೋಡ್ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ",
    "accessibility.theme_changed": "ಥೀಮ್ ಬದಲಾಯಿಸಲಾಗಿದೆ",
    "accessibility.language_changed": "ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ",
    "dashboard.welcome": "ನಿಮ್ಮ ಡ್ಯಾಶ್ಬೋರ್ಡ್‌ಗೆ ಸುಸ್ವಾಗತ",
    "dashboard.notifications": "ಅಧಿಸೂಚನೆಗಳು",
    "dashboard.recent_activity": "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
    "dashboard.students": "ವಿದ್ಯಾರ್ಥಿಗಳು",
    "dashboard.announcements": "ಪ್ರಕಟಣೆಗಳು",
    "dashboard.no_data": "ಯಾವುದೇ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ",
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
      // Fall back to English if the key doesn't exist in the current language
      return translations.english[key] || key;
    }
    return translations[language][key];
  };

  // Update language in localStorage when it changes
  useEffect(() => {
    localStorage.setItem(storageKey, language);
    
    // Add a small delay before showing the toast to prevent it from being missed
    const timer = setTimeout(() => {
      toast.success(
        `${translate('accessibility.language_changed')} ${translate(`common.${language}`)}`,
        { duration: 2000 }
      );
    }, 100);
    
    return () => clearTimeout(timer);
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
