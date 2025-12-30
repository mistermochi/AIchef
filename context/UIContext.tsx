
import React, { createContext, useContext, useState, useEffect } from 'react';
import { View } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface UIContextType {
  view: View;
  setView: (v: View) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<View>('cookbook');
  const [darkMode, setDarkMode] = useLocalStorage('chefai_theme', false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <UIContext.Provider value={{ view, setView, darkMode, setDarkMode }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUIContext must be used within UIProvider');
  return context;
};
