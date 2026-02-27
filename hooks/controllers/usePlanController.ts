
import { useState, useCallback } from 'react';
import { useMealPlanRepository } from '../data/useMealPlanRepository';
import { useAuthContext } from '../../context/AuthContext';
import { useRecipeContext } from '../../context/RecipeContext';
import { useCartContext } from '../../context/CartContext';
import { MealPlanEntry, MealSlot, Recipe } from '../../types';
import { generateMealPlan } from '../../shared/api/ai';

/**
 * @hook usePlanController
 * @description Controller for the Meal Planner view.
 * Coordinates between UI state, MealPlanRepository, and AI services.
 */
export function usePlanController() {
  const { recipes } = useRecipeContext();
  const { addToCart } = useCartContext();
  const { getProfileContext, isAIEnabled, reportError } = useAuthContext();
  const {
    mealPlan,
    loading: repoLoading,
    addEntry,
    updateEntry,
    deleteEntry,
    clearWeek
  } = useMealPlanRepository();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generates a 7-day meal plan using AI.
   * Matches AI suggestions with existing recipes in the cookbook.
   */
  const handleAutoGenerate = useCallback(async () => {
    if (!isAIEnabled || recipes.length < 3) return;

    setIsGenerating(true);
    setError(null);

    try {
      const prefs = getProfileContext();
      const rawPlan = await generateMealPlan(recipes, prefs);

      // Map AI response to database entries
      const entries: Omit<MealPlanEntry, 'id'>[] = rawPlan.map((item: any) => {
        const recipe = recipes.find(r => r.title.toLowerCase().includes(item.recipeName.toLowerCase()));
        return {
          date: new Date(Date.now() + item.dayOffset * 86400000).toISOString().split('T')[0],
          slot: item.slot as MealSlot,
          recipeId: recipe?.id,
          customTitle: recipe ? undefined : item.recipeName,
          emoji: item.emoji || (recipe?.emoji) || '🍽️',
          servings: 2,
          isCooked: false
        };
      });

      // Clear existing and add new
      // Note: In production, we'd batch this.
      await clearWeek();
      for (const entry of entries) {
        await addEntry(entry);
      }
    } catch (err: any) {
      setError(err.message);
      reportError('unhealthy', err.message);
    } finally {
      setIsGenerating(false);
    }
  }, [recipes, getProfileContext, isAIEnabled, addEntry, clearWeek, reportError]);

  /**
   * Scales a planned meal and adds its ingredients to the shopping cart.
   */
  const handleAddToShoppingList = useCallback(async (entry: MealPlanEntry) => {
    let recipe: Recipe | undefined;

    if (entry.recipeId) {
      recipe = recipes.find(r => r.id === entry.recipeId);
    }

    if (recipe) {
      addToCart(recipe, entry.servings / 2); // Assuming base servings is 2
      // Mark as "In Cart" or similar if we had that state
    }
  }, [recipes, addToCart]);

  return {
    mealPlan,
    loading: repoLoading || isGenerating,
    isGenerating,
    error,
    autoGenerate: handleAutoGenerate,
    addEntry,
    updateEntry,
    deleteEntry,
    clearWeek,
    addToShoppingList: handleAddToShoppingList
  };
}
