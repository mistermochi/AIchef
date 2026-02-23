
import { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '../../../entities/user/model/AuthContext';
import { useRecipeContext } from '../../../entities/recipe/model/RecipeContext';
import { useCartContext } from '../../shopping-cart/model/CartContext';
import { useMealPlanRepository } from '../../../entities/planner/api/useMealPlanRepository';
import { MealPlanEntry, MealSlot } from '../../../shared/model/types';
import { Recipe } from '../../../entities/recipe/model/types';
import { generateMealPlan } from '../../../shared/api/geminiService';

/**
 * @hook usePlanController
 * @description The controller for the Meal Planner view.
 * It manages the navigation of weeks, fetching meal plans from the repository,
 * and performing actions like adding/removing meals, generating AI plans, and syncing to the cart.
 *
 * Interactions:
 * - {@link useAuthContext}: For home ID, profile context, and AI status.
 * - {@link useRecipeContext}: For accessing the cookbook.
 * - {@link useCartContext}: For adding recipes to the shopping cart.
 * - {@link useMealPlanRepository}: For Firestore CRUD operations on meal plans.
 * - {@link generateMealPlan}: Service call for AI-assisted planning.
 *
 * @returns {Object} { state, actions }
 */
export function usePlan() {
  const { currentHomeId, getProfileContext, isAIEnabled } = useAuthContext();
  const { savedRecipes } = useRecipeContext();
  const { addToCart } = useCartContext();
  const repo = useMealPlanRepository(currentHomeId);

  // State: Week Cursor (Start Date of the week - Monday)
  // Default to current week's Monday
  const [startOfWeek, setStartOfWeek] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const mon = new Date(d.setDate(diff));
    mon.setHours(0,0,0,0);
    return mon;
  });

  const [weekPlans, setWeekPlans] = useState<MealPlanEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Helper: Format YYYY-MM-DD
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  // Subscription
  useEffect(() => {
    const end = new Date(startOfWeek);
    end.setDate(end.getDate() + 6);
    
    const unsub = repo.subscribeToWeek(fmt(startOfWeek), fmt(end), (data) => {
      setWeekPlans(data);
    });
    return () => unsub();
  }, [startOfWeek, currentHomeId]);

  // Actions
  const nextWeek = () => {
    const next = new Date(startOfWeek);
    next.setDate(next.getDate() + 7);
    setStartOfWeek(next);
  };

  const prevWeek = () => {
    const prev = new Date(startOfWeek);
    prev.setDate(prev.getDate() - 7);
    setStartOfWeek(prev);
  };

  const addMeal = async (date: string, slot: MealSlot, recipe: Recipe, servings: number = 2) => {
    const entry: MealPlanEntry = {
      date,
      slot,
      customTitle: recipe.title,
      emoji: recipe.emoji,
      servings,
      isCooked: false
    };
    // Ensure undefined is not passed to Firestore
    if (recipe.id) {
        entry.recipeId = recipe.id;
    }
    await repo.addEntry(entry);
  };

  const removeMeal = async (id: string) => {
    await repo.removeEntry(id);
  };
  
  const updateEntry = async (id: string, updates: Partial<MealPlanEntry>) => {
      await repo.updateEntry(id, updates);
  };

  const generateWeek = async () => {
      if (!isAIEnabled) return;
      setIsGenerating(true);
      try {
          const pref = getProfileContext();
          const aiPlans = await generateMealPlan(savedRecipes.slice(0, 50), pref); // Limit context size
          
          const batch: MealPlanEntry[] = [];
          
          // Map AI results to actual entries
          aiPlans.forEach((p: any) => {
              const d = new Date(startOfWeek);
              d.setDate(d.getDate() + (p.dayOffset || 0));
              
              // Attempt to match with existing recipe
              const matched = savedRecipes.find(r => r.title.toLowerCase() === p.recipeName.toLowerCase());
              
              const entry: MealPlanEntry = {
                  date: fmt(d),
                  slot: (p.slot || 'dinner').toLowerCase() as MealSlot,
                  customTitle: p.recipeName,
                  emoji: p.emoji || '🥘',
                  servings: 2,
                  isCooked: false
              };

              if (matched?.id) {
                  entry.recipeId = matched.id;
              }
              
              batch.push(entry);
          });
          
          await repo.batchAdd(batch);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const syncToCart = async () => {
    setSyncing(true);
    // Aggregate ingredients
    weekPlans.forEach(plan => {
        let recipe = savedRecipes.find(r => r.id === plan.recipeId);
        if (recipe) {
            const factor = Math.max(0.5, plan.servings / 2); 
            addToCart(recipe, factor);
        }
    });
    // Fake delay for UX
    await new Promise(r => setTimeout(r, 800));
    setSyncing(false);
  };

  // Computed: Grid Data Structure
  const grid = useMemo(() => {
     const days = [];
     for(let i=0; i<7; i++) {
         const d = new Date(startOfWeek);
         d.setDate(d.getDate() + i);
         const dateStr = fmt(d);
         const dayPlans = weekPlans.filter(p => p.date === dateStr);
         days.push({
             date: d,
             dateStr,
             dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
             dayNum: d.getDate(),
             breakfast: dayPlans.filter(p => p.slot === 'breakfast'),
             lunch: dayPlans.filter(p => p.slot === 'lunch'),
             dinner: dayPlans.filter(p => p.slot === 'dinner'),
         });
     }
     return days;
  }, [startOfWeek, weekPlans]);

  return {
    state: { startOfWeek, weekPlans, isGenerating, syncing, grid, loading: repo.loading },
    actions: { nextWeek, prevWeek, addMeal, removeMeal, updateEntry, generateWeek, syncToCart }
  };
}
