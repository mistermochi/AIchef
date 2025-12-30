
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

// --- Price Tracker Types ---

export interface Product {
  id: string; // Derived from normalized name
  name: string;
  category: string;
  defaultUnit?: string;
  appId?: string;
  userId?: string;
}

// Fix: Removed productId, strictly receipt-based now.
export interface Purchase {
  id: string;
  productName: string;
  category: string;
  date: any; // Firestore Timestamp or Date
  price: number;
  quantity: number; // Total quantity (singleQty * count)
  singleQty?: number; // The size of a single unit in a pack (e.g. 330 for a 6-pack)
  count?: number; // The multiplier (e.g. 6)
  unit: string;
  normalizedPrice: number;
  store: string;
  comment?: string;
  timestamp?: any;
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

export type View = 'home' | 'cookbook' | 'profile' | 'shopping' | 'genie' | 'tracker';

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
  airGestures: boolean;
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
  airGestures: false,
  currency: 'USD',
  customInstructions: '',
  aiEnabled: true
};

export const APPLIANCE_LIST = ['Air Fryer', 'Instant Pot', 'Blender', 'Slow Cooker', 'Sous Vide', 'Food Processor', 'Wok'];
export const DIETARY_LIST = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Low Carb', 'Dairy-Free', 'Nut-Free'];
