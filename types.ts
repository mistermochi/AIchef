
// Fix: Use modular Firestore Timestamp import.
import { Timestamp } from 'firebase/firestore';

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
  createdAt?: Timestamp;
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

export type View = 'home' | 'cookbook' | 'profile' | 'shopping' | 'genie';
