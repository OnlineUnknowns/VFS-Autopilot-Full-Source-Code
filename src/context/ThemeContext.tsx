import React, { createContext, useContext, useEffect, useState } from 'react';
import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';
import arTranslations from '../locales/ar.json';

export type Theme = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';
export type Language = 'en' | 'fr' | 'ar';

const translationsRecord: Record<Language, any> = {
  en: enTranslations,
  fr: frTranslations,
  ar: arTranslations,
};

interface ThemeContextProps {
  theme: Theme;
  direction: Direction;
  language: Language;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setDirection: (direction: Direction) => void;
  toggleDirection: () => void;
  setLanguage: (language: Language) => void;
  t: (path: string, replacements?: Record<string, string | number>) => string;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Retrieve initial state from LocalStorage or system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app-theme') as Theme;
      if (stored === 'light' || stored === 'dark') return stored;
      
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemPreference ? 'dark' : 'light';
    }
    return 'light';
  });

  const [direction, setDirectionState] = useState<Direction>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app-direction') as Direction;
      if (stored === 'ltr' || stored === 'rtl') return stored;
    }
    return 'ltr';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app-language') as Language;
      if (stored === 'en' || stored === 'fr' || stored === 'ar') return stored;
    }
    return 'en';
  });

  // Apply theme & direction changes to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', direction);
    root.style.direction = direction;
    localStorage.setItem('app-direction', direction);
  }, [direction]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setDirection = (newDirection: Direction) => {
    setDirectionState(newDirection);
  };

  const toggleDirection = () => {
    setDirectionState((prev) => (prev === 'ltr' ? 'rtl' : 'ltr'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setDirection(lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('app-language', lang);
  };

  // Simple key resolver for path strings (e.g. 'welcome.title')
  const t = (path: string, replacements?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let currentObj = translationsRecord[language];
    
    for (const key of keys) {
      if (currentObj && currentObj[key] !== undefined) {
        currentObj = currentObj[key];
      } else {
        return path;
      }
    }

    if (typeof currentObj !== 'string') return path;

    let translatedText = currentObj;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        translatedText = translatedText.replace(`{${k}}`, String(v));
      });
    }
    return translatedText;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        direction,
        language,
        setTheme,
        toggleTheme,
        setDirection,
        toggleDirection,
        setLanguage,
        t,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
