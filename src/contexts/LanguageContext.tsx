import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'bn' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  languages: { code: Language; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'bn' as Language, name: 'বাংলা' },
    { code: 'hi' as Language, name: 'हिंदी' }
  ];
  
  const [language, setLanguageState] = useState<Language>(() => {
    // Check if language is stored in localStorage
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage && languages.some(lang => lang.code === storedLanguage)) {
      return storedLanguage;
    }
    // Default to English
    return 'en';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = newLanguage;
  };

  useEffect(() => {
    // Initialize language
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [i18n, language]);

  const value = { language, setLanguage, languages };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
