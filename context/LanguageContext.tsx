import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCode, TRANSLATIONS, TranslationDictionary } from '@/constants/translations';
import { supabase } from '@/services/supabase';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: keyof TranslationDictionary) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'EN',
  setLanguage: async () => {},
  t: (key) => TRANSLATIONS['EN'][key] || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('EN');

  useEffect(() => {
    (async () => {
      try {
        // 1. Try loading from AsyncStorage
        const storedLang = await AsyncStorage.getItem('APP_LANGUAGE');
        if (storedLang && ['DE', 'FR', 'IT', 'EN', 'PT', 'ES', 'SQ', 'SR'].includes(storedLang.toUpperCase())) {
          setLanguageState(storedLang.toUpperCase() as LanguageCode);
          return;
        }

        // 2. Fallback to user profile in Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('preferred_lang')
            .eq('id', session.user.id)
            .maybeSingle();

          if (prof?.preferred_lang) {
            const code = prof.preferred_lang.toUpperCase() as LanguageCode;
            if (['DE', 'FR', 'IT', 'EN', 'PT', 'ES', 'SQ', 'SR'].includes(code)) {
              setLanguageState(code);
              await AsyncStorage.setItem('APP_LANGUAGE', code);
            }
          }
        }
      } catch (err) {
        console.warn('Language initial load error:', err);
      }
    })();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('APP_LANGUAGE', lang);

      // Sync to Supabase user profile if authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .update({ preferred_lang: lang.toLowerCase() })
          .eq('id', session.user.id);
      }
    } catch (err) {
      console.warn('Error setting language:', err);
    }
  };

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
