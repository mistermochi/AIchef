
import type { Recipe, Ingredient, OrchestrationStep, OrchestrationPlan, GenieIdea } from '../../entities/recipe/model/types';
export type { Recipe, Ingredient, OrchestrationStep, OrchestrationPlan, GenieIdea };

export interface ShoppingListItem {
  id: string; // unique id for this item in the cart
  recipeId?: string;
  title: string;
  ingredients: Ingredient[];
  scalingFactor: number;
  originalRecipe?: Recipe; // Added to facilitate orchestration
}

// --- Meal Planner Types ---

export type MealSlot = 'breakfast' | 'lunch' | 'tea' | 'dinner';

export interface MealPlanEntry {
  id?: string;
  date: string; // YYYY-MM-DD
  slot: MealSlot;
  recipeId?: string; // Matches a Recipe.id if from cookbook
  customTitle?: string; // Fallback title if not in cookbook or custom entry
  emoji?: string;
  servings: number;
  isCooked: boolean;
}


export interface OnlineDeal {
  title: string;
  store: string;
  price: string;
  url: string;
  desc: string;
  imageUrl: string;
}

export type View = 'home' | 'cookbook' | 'profile' | 'shopping' | 'genie' | 'tracker' | 'test' | 'plan';

// --- User Profile ---

export interface UserProfile {
  measurements: 'metric' | 'imperial';
  defaultServings: number;
  dietary: string[];
  dislikes: string;
  appliances: string[];
  skillLevel: 'beginner' | 'pro';
  haptics: boolean;
  autoWakeLock: boolean;
  currency: string;
  customInstructions: string;
  aiEnabled: boolean;
}

export const DEFAULT_PROFILE: UserProfile = {
  measurements: 'metric',
  defaultServings: 2,
  dietary: [],
  dislikes: '',
  appliances: [],
  skillLevel: 'beginner',
  haptics: true,
  autoWakeLock: true,
  currency: 'USD',
  customInstructions: '',
  aiEnabled: true
};
