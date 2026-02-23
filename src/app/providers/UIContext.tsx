
import React, { createContext, useContext, useState, useEffect } from 'react';
import { View } from '../../shared/model/types';
import { useLocalStorage } from '../../shared/lib/hooks/useLocalStorage';

/**
 * @interface UIContextType
 * @description Defines the shape of the UI Context, which manages global UI state like the current view and dark mode.
 */
interface UIContextType {
  /** The currently active view/page in the application. */
  view: View;
  /** Function to switch the active view. */
  setView: (v: View) => void;
  /** Whether the application is in dark mode. */
  darkMode: boolean;
  /** Function to toggle dark mode. */
  setDarkMode: (v: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

/**
 * @component UIProvider
 * @description Provides global UI state management, including view navigation and dark mode persistence.
 * It also handles applying the `dark` class to the document root for Tailwind CSS dark mode support.
 */
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

/**
 * Hook to consume the UIContext.
 * @returns {UIContextType} The UI context value.
 * @throws {Error} If used outside of a UIProvider.
 */
export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUIContext must be used within UIProvider');
  return context;
};
