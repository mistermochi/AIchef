
import React, { createContext, useContext, ReactNode } from 'react';
import { useChefAI } from '../hooks/useChefAI';

type ChefContextType = ReturnType<typeof useChefAI>;

const ChefContext = createContext<ChefContextType | undefined>(undefined);

export const ChefProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const chefState = useChefAI();

  return (
    <ChefContext.Provider value={chefState}>
      {children}
    </ChefContext.Provider>
  );
};

export const useChefContext = () => {
  const context = useContext(ChefContext);
  if (!context) {
    throw new Error('useChefContext must be used within a ChefProvider');
  }
  return context;
};
