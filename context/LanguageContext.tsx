import React, { createContext, useContext, useState } from 'react';
import { LanguageCode, TRANSLATIONS, TranslationDictionary } from '@/constants/translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof TranslationDictionary) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'EN',
  setLanguage: () => {},
  t: (key) => TRANSLATIONS['EN'][key] || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>('EN');

  const t = (key: keyof TranslationDictionary): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['EN'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
