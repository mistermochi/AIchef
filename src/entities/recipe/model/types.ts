
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
