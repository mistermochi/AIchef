
import React, { createContext, useContext, useState } from 'react';
import { Recipe } from './types';
import { useAuthContext } from '../../../entities/user/model/AuthContext';
import { useSearch } from '../../../shared/lib/hooks/useSearch';
import { useRecipeRepository } from '../api/useRecipeRepository';

/**
 * @interface RecipeContextType
 * @description Defines the shape of the Recipe Context, which manages the user's cookbook, including data fetching, selection, search, and CRUD operations.
 */
interface RecipeContextType {
  // Data
  /** Full list of saved recipes for the current home. */
  savedRecipes: Recipe[];
  /** Indicates if recipes are currently being loaded from Firestore. */
  recipesLoading: boolean;
  /** Function to load more recipes for pagination. */
  loadMore: () => void;
  /** Whether more recipes are available to load. */
  hasMore: boolean;
  
  // Selection
  /** The currently selected recipe (e.g., for viewing in a modal). */
  activeRecipe: Recipe | null;
  /** Function to set the active recipe. */
  setActiveRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  
  // Search
  /** The current search term applied to the cookbook. */
  searchTerm: string;
  /** Function to update the search term. */
  setSearchTerm: (term: string) => void;
  /** The list of recipes filtered by the search term. */
  filteredRecipes: Recipe[];

  // CRUD
  /** Adds a new recipe to the cookbook. */
  addRecipe: (r: Recipe) => Promise<any>;
  /** Updates an existing recipe by ID. */
  updateRecipe: (id: string, r: Partial<Recipe>) => Promise<void>;
  /** Deletes a recipe by ID. */
  deleteRecipe: (id: string) => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

/**
 * @component RecipeProvider
 * @description Manages the cookbook data for the current household.
 * It integrates with the `useRecipeRepository` for data persistence and `useSearch` for client-side filtering.
 */
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

/**
 * Hook to consume the RecipeContext.
 * @returns {RecipeContextType} The recipe context value.
 * @throws {Error} If used outside of a RecipeProvider.
 */
export const useRecipeContext = () => {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipeContext must be used within RecipeProvider');
  return context;
};
