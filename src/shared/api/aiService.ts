
import { Recipe, GenieIdea, OrchestrationPlan, OnlineDeal } from '../model/types';
import { AIStatus } from '../lib/ai';

/**
 * @interface AIService
 * @description Defines the standard interface for AI providers (e.g., Gemini, Mistral).
 */
export interface AIService {
  /** Validates the API connection and key. */
  validateAIConnection(): Promise<{ status: AIStatus; message: string }>;

  /** Processes raw recipe text into a structured Recipe object. */
  processRecipe(input: string, prefs: string): Promise<Partial<Recipe>>;

  /** Generates creative recipe ideas based on ingredients. */
  generateGenieIdeas(ingredients: string, prefs: string): Promise<GenieIdea[]>;

  /** Refines an existing recipe based on user feedback. */
  refineRecipe(recipe: Recipe, prompt: string): Promise<string[]>;

  /** Generates a multi-recipe orchestration plan. */
  generateOrchestrationPlan(recipes: Recipe[]): Promise<OrchestrationPlan>;

  /** Generates a weekly meal plan. */
  generateMealPlan(recipes: Recipe[], prefs: string): Promise<any[]>;

  /** Searches for online deals (may not be supported by all providers). */
  searchDeals(productName: string): Promise<{ items: OnlineDeal[]; sources: { uri: string; title: string }[] }>;

  /** Extracts structured data from a receipt image (may not be supported by all providers). */
  extractReceiptData(base64Image: string, mimeType: string): Promise<any>;

  /** Classifies multiple product names. */
  batchClassifyProducts(productNames: string[]): Promise<Array<{ original_name: string; generic_name: string }>>;
}
