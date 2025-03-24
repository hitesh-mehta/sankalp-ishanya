
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export type Language = 'english' | 'hindi' | 'kannada';

// Create context
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string | undefined;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define translated strings for each language
const translations: Record<Language, Record<string, string>> = {
  english: {
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.administrator': 'Administrator',
    'common.hr': 'HR',
    'common.teacher': 'Teacher',
    'common.parent': 'Parent',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.theme.dark': 'Dark',
    'common.theme.light': 'Light',
    
    'login.title': 'Login to Your Account',
    'login.subtitle': 'Enter your credentials to access your account',
    'login.email': 'Email address',
    'login.password': 'Password',
    'login.role': 'Select Role',
    'login.button': 'Login',
    'login.error': 'Invalid email or password',
    'login.logout_success': 'Logged out successfully',
    
    'accessibility.title': 'Accessibility',
    'accessibility.theme': 'Theme',
    'accessibility.language': 'Language',
    'accessibility.dyslexia': 'Dyslexia Friendly',
    'accessibility.theme_changed': 'Theme changed to',
    'accessibility.language_changed': 'Language changed to',
    'accessibility.dyslexia_enabled': 'Dyslexia-friendly mode enabled',
    'accessibility.dyslexia_disabled': 'Dyslexia-friendly mode disabled',
    
    'dashboard.notifications': 'Notifications',
    
    'chatbot.title': 'Assistant',
    'chatbot.placeholder': 'Type your question...',
    'chatbot.toggle': 'Toggle chatbot',
    'chatbot.close': 'Close',
    'chatbot.welcome': 'Hello! I can help you access information about students, programs, and more. What would you like to know?',
    'chatbot.error': 'Sorry, there was an error processing your request. Please try again.',
    'chatbot.no_results': 'No results found for your query.',
  },
  hindi: {
    'common.back': 'वापस',
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.submit': 'जमा करें',
    'common.administrator': 'प्रशासक',
    'common.hr': 'मानव संसाधन',
    'common.teacher': 'शिक्षक',
    'common.parent': 'अभिभावक',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.theme.dark': 'डार्क',
    'common.theme.light': 'लाइट',
    
    'login.title': 'अपने खाते में लॉगिन करें',
    'login.subtitle': 'अपने खाते तक पहुंचने के लिए अपना प्रमाण पत्र दर्ज करें',
    'login.email': 'ईमेल पता',
    'login.password': 'पासवर्ड',
    'login.role': 'भूमिका चुनें',
    'login.button': 'लॉगिन',
    'login.error': 'अमान्य ईमेल या पासवर्ड',
    'login.logout_success': 'सफलतापूर्वक लॉगआउट किया गया',
    
    'accessibility.title': 'पहुंच',
    'accessibility.theme': 'थीम',
    'accessibility.language': 'भाषा',
    'accessibility.dyslexia': 'डिस्लेक्सिया अनुकूल',
    'accessibility.theme_changed': 'थीम बदलकर हो गई',
    'accessibility.language_changed': 'भाषा बदल गई',
    'accessibility.dyslexia_enabled': 'डिस्लेक्सिया-अनुकूल मोड सक्षम',
    'accessibility.dyslexia_disabled': 'डिस्लेक्सिया-अनुकूल मोड अक्षम',
    
    'dashboard.notifications': 'सूचनाएं',
    
    'chatbot.title': 'सहायक',
    'chatbot.placeholder': 'अपना प्रश्न लिखें...',
    'chatbot.toggle': 'चैटबॉट टॉगल करें',
    'chatbot.close': 'बंद करें',
    'chatbot.welcome': 'नमस्ते! मैं छात्रों, कार्यक्रमों और अधिक के बारे में जानकारी प्राप्त करने में आपकी मदद कर सकता हूं। आप क्या जानना चाहेंगे?',
    'chatbot.error': 'क्षमा करें, आपके अनुरोध को संसाधित करने में एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
    'chatbot.no_results': 'आपकी क्वेरी के लिए कोई परिणाम नहीं मिला।',
  },
  kannada: {
    'common.back': 'ಹಿಂದೆ',
    'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'common.save': 'ಉಳಿಸಿ',
    'common.cancel': 'ರದ್ದುಮಾಡಿ',
    'common.submit': 'ಸಲ್ಲಿಸಿ',
    'common.administrator': 'ನಿರ್ವಾಹಕ',
    'common.hr': 'ಮಾನವ ಸಂಪನ್ಮೂಲ',
    'common.teacher': 'ಶಿಕ್ಷಕ',
    'common.parent': 'ಪೋಷಕ',
    'common.error': 'ದೋಷ',
    'common.success': 'ಯಶಸ್ಸು',
    'common.theme.dark': 'ಡಾರ್ಕ್',
    'common.theme.light': 'ಲೈಟ್',
    
    'login.title': 'ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ',
    'login.subtitle': 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಪ್ರವೇಶಿಸಲು ನಿಮ್ಮ ರುಜುವಾತುಗಳನ್ನು ನಮೂದಿಸಿ',
    'login.email': 'ಇಮೇಲ್ ವಿಳಾಸ',
    'login.password': 'ಪಾಸ್‌ವರ್ಡ್',
    'login.role': 'ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'login.button': 'ಲಾಗಿನ್',
    'login.error': 'ಅಮಾನ್ಯ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್',
    'login.logout_success': 'ಯಶಸ್ವಿಯಾಗಿ ಲಾಗ್ಔಟ್ ಮಾಡಲಾಗಿದೆ',
    
    'accessibility.title': 'ಪ್ರವೇಶಾರ್ಹತೆ',
    'accessibility.theme': 'ಥೀಮ್',
    'accessibility.language': 'ಭಾಷೆ',
    'accessibility.dyslexia': 'ಡಿಸ್ಲೆಕ್ಸಿಯಾ ಸ್ನೇಹಿ',
    'accessibility.theme_changed': 'ಥೀಮ್ ಬದಲಾಯಿಸಲಾಗಿದೆ',
    'accessibility.language_changed': 'ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ',
    'accessibility.dyslexia_enabled': 'ಡಿಸ್ಲೆಕ್ಸಿಯಾ-ಸ್ನೇಹಿ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ',
    'accessibility.dyslexia_disabled': 'ಡಿಸ್ಲೆಕ್ಸಿಯಾ-ಸ್ನೇಹಿ ಮೋಡ್ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ',
    
    'dashboard.notifications': 'ಅಧಿಸೂಚನೆಗಳು',
    
    'chatbot.title': 'ಸಹಾಯಕ',
    'chatbot.placeholder': 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ...',
    'chatbot.toggle': 'ಚಾಟ್‌ಬಾಟ್ ಟಾಗಲ್ ಮಾಡಿ',
    'chatbot.close': 'ಮುಚ್ಚಿ',
    'chatbot.welcome': 'ನಮಸ್ಕಾರ! ನಾನು ವಿದ್ಯಾರ್ಥಿಗಳು, ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಇನ್ನಷ್ಟು ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನೀವು ಏನನ್ನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?',
    'chatbot.error': 'ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸಂಸ್ಕರಿಸುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'chatbot.no_results': 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
  },
};

// Language Provider component
type LanguageProviderProps = {
  children: ReactNode;
  defaultLanguage?: Language;
};

export const LanguageProvider = ({ children, defaultLanguage = 'english' }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || defaultLanguage;
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string | undefined => {
    return translations[language]?.[key];
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Custom hook for using the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
