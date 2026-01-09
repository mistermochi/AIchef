
import React, { createContext, useContext, useState } from 'react';
import { Recipe } from '../types';
import { useAuthContext } from './AuthContext';
import { useSearch } from '../hooks/useSearch';
import { useRecipeRepository } from '../hooks/data/useRecipeRepository';

interface RecipeContextType {
  // Data
  savedRecipes: Recipe[];
  recipesLoading: boolean;
  loadMore: () => void;
  hasMore: boolean;
  
  // Selection
  activeRecipe: Recipe | null;
  setActiveRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  
  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredRecipes: Recipe[];

  // CRUD
  addRecipe: (r: Recipe) => Promise<any>;
  updateRecipe: (id: string, r: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentHomeId } = useAuthContext();
  
  // Data Repository now linked to Home
  const { 
    recipes: savedRecipes, 
    loading: recipesLoading, 
    addRecipe, 
    updateRecipe, 
    deleteRecipe,
    loadMore,
    hasMore
  } = useRecipeRepository(currentHomeId);

  // UI State: Selection
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  // Search Logic
  const { searchTerm, setSearchTerm, filteredItems: filteredRecipes } = useSearch(
    savedRecipes, 
    (r: Recipe, term: string) => {
      const searchData = `${r.title} ${r.ingredients?.map(i => i.name).join(' ') || ''}`.toLowerCase();
      return searchData.includes(term);
    }
  );

  return (
    <RecipeContext.Provider value={{
      savedRecipes, recipesLoading, loadMore, hasMore,
      activeRecipe, setActiveRecipe,
      searchTerm, setSearchTerm, filteredRecipes,
      addRecipe, updateRecipe, deleteRecipe
    }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipeContext = () => {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipeContext must be used within RecipeProvider');
  return context;
};
