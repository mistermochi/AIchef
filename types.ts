
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

import { Timestamp, FieldValue } from 'firebase/firestore';

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

export interface ShoppingListItem {
  id: string; // unique id for this item in the cart
  recipeId?: string;
  title: string;
  ingredients: Ingredient[];
  scalingFactor: number;
  originalRecipe?: Recipe; // Added to facilitate orchestration
}

export interface GenieIdea {
  title: string;
  summary: string;
  emoji: string;
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

// --- Price Tracker Types ---

export interface Product {
  id: string; // Derived from normalized name
  name: string;
  genericName?: string; // Canonical name for recipe matching (e.g. "Milk" for "Meiji 4.3 Milk")
  category: string;
  defaultUnit?: string;
  appId?: string;
  userId?: string;
}

export interface Purchase {
  id: string;
  productName: string;
  genericName?: string; // Canonical name for recipe matching
  category: string;
  date: Timestamp | Date;
  price: number;
  quantity: number; // Total quantity (singleQty * count)
  singleQty?: number; // The size of a single unit in a pack (e.g. 330 for a 6-pack)
  count?: number; // The multiplier (e.g. 6)
  unit: string;
  normalizedPrice: number;
  store: string;
  comment?: string;
  timestamp?: Timestamp | Date | FieldValue;
  appId?: string;
  userId?: string;
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

export const APPLIANCE_LIST = ['Air Fryer', 'Instant Pot', 'Blender', 'Slow Cooker', 'Sous Vide', 'Food Processor', 'Wok'];
export const DIETARY_LIST = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Low Carb', 'Dairy-Free', 'Nut-Free'];
