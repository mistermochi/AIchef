
import React, { createContext, useContext, useState } from 'react';
import { Recipe } from '../types';
import { useRecipeContext } from './RecipeContext';

/**
 * @interface RecipeSessionContextType
 * @description Defines the shape of the Recipe Session Context, which manages the state of a single recipe being viewed, edited, or cooked.
 */
interface RecipeSessionContextType {
  /** The working copy of the recipe in the current session. */
  recipe: Recipe | null;
  /** Function to update the working recipe copy. */
  setRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  
  /** Whether the recipe is currently in edit mode. */
  isEditing: boolean;
  /** Function to toggle edit mode. */
  setIsEditing: (v: boolean) => void;
  
  /** Whether the recipe is currently in hands-free cooking mode. */
  isHandsFree: boolean;
  /** Function to toggle hands-free mode. */
  setIsHandsFree: (v: boolean) => void;
  
  /** The current scaling factor applied to the recipe's ingredients. */
  scalingFactor: number;
  /** Function to update the scaling factor. */
  setScalingFactor: (v: number) => void;

  /** Saves the current working recipe copy to the cookbook (Firestore). */
  save: () => Promise<void>;
  /** Deletes the recipe from the cookbook. */
  remove: () => Promise<void>;
  /** Indicates if a save or delete operation is in progress. */
  saving: boolean;
  /** Error message if a save or delete operation fails. */
  saveError: string;
}

const RecipeSessionContext = createContext<RecipeSessionContextType | undefined>(undefined);

/**
 * @component RecipeSessionProvider
 * @description Manages the state for a specific recipe session (e.g., inside a Recipe Modal).
 * It handles local modifications before they are committed to the global `RecipeContext`.
 *
 * Interactions:
 * - {@link useRecipeContext}: For persisting changes (add, update, delete) to the global cookbook state.
 */
export const RecipeSessionProvider: React.FC<{ children: React.ReactNode, initialRecipe: Recipe }> = ({ children, initialRecipe }) => {
  const { addRecipe, updateRecipe, deleteRecipe, setActiveRecipe } = useRecipeContext();
  
  // The local working copy
  const [recipe, setRecipe] = useState<Recipe | null>(initialRecipe);
  
  // Session State
  const [isEditing, setIsEditing] = useState(!initialRecipe.id); // Default to edit if new
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [scalingFactor, setScalingFactor] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Save/Update Logic
  const save = async () => {
    if (!recipe) return;
    setSaving(true);
    setSaveError('');
    try {
      if (recipe.id) {
        const { id, ...data } = recipe;
        await updateRecipe(id, data);
      } else {
        const docRef = await addRecipe(recipe);
        setRecipe(prev => prev ? ({ ...prev, id: docRef.id }) : null);
        // Also update the global selection so the modal doesn't close/reset oddly
        setActiveRecipe({ ...recipe, id: docRef.id });
      }
      setIsEditing(false);
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Logic
  const remove = async () => {
    if (!recipe?.id) return;
    setSaving(true); // Reuse saving loading state
    setSaveError('');
    try {
      await deleteRecipe(recipe.id);
      setActiveRecipe(null); // Close the modal
    } catch (e: any) {
      setSaveError(e.message);
      setSaving(false);
    }
  };

  return (
    <RecipeSessionContext.Provider value={{
      recipe, setRecipe,
      isEditing, setIsEditing,
      isHandsFree, setIsHandsFree,
      scalingFactor, setScalingFactor,
      save, remove, saving, saveError
    }}>
      {children}
    </RecipeSessionContext.Provider>
  );
};

/**
 * Hook to consume the RecipeSessionContext.
 * @returns {RecipeSessionContextType} The recipe session context value.
 * @throws {Error} If used outside of a RecipeSessionProvider.
 */
export const useRecipeSessionContext = () => {
  const context = useContext(RecipeSessionContext);
  if (!context) throw new Error('useRecipeSessionContext must be used within RecipeSessionProvider');
  return context;
};
