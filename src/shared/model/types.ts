
import { Timestamp, FieldValue } from 'firebase/firestore';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id?: string;
  title: string;
  emoji: string;
  summary: string;
  ingredients: Ingredient[];
  instructions: string[];
  extractedTips: string[];
  aiSuggestions: string[];
  sourceUrl?: string;
  coverImage?: string | null;
  authorId?: string;
  createdAt?: Timestamp | Date | FieldValue;
  lastRefinement?: string;
}

export interface OrchestrationStep {
  id: string;
  description: string;
  type: 'prep' | 'cook' | 'wait';
  recipeContext: string; // Which recipe(s) this step belongs to
  estimatedMinutes?: number;
}

export interface OrchestrationPlan {
  steps: OrchestrationStep[];
  totalEstimatedTime: number;
  optimizedSummary: string;
}

export interface GenieIdea {
  title: string;
  summary: string;
  emoji: string;
}

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
  aiProvider: 'gemini' | 'mistral';
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
  aiEnabled: true,
  aiProvider: 'gemini'
};
