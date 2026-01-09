
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Recipe } from '../types';
import { useRecipeContext } from './RecipeContext';

interface RecipeSessionContextType {
  recipe: Recipe | null;
  setRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  
  isHandsFree: boolean;
  setIsHandsFree: (v: boolean) => void;
  
  scalingFactor: number;
  setScalingFactor: (v: number) => void;

  save: () => Promise<void>;
  remove: () => Promise<void>;
  saving: boolean;
  saveError: string;
}

const RecipeSessionContext = createContext<RecipeSessionContextType | undefined>(undefined);

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

export const useRecipeSessionContext = () => {
  const context = useContext(RecipeSessionContext);
  if (!context) throw new Error('useRecipeSessionContext must be used within RecipeSessionProvider');
  return context;
};
