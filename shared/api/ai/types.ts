
import { Recipe, GenieIdea, OrchestrationPlan, OnlineDeal } from "../../../types";
import { AIStatus } from "../../../utils/ai";

/**
 * @interface AIProvider
 * @description Defines the standard interface for all AI service providers (Gemini, Mistral, etc.).
 * Each method handles a specific AI-driven feature of the ChefAI application.
 */
export interface AIProvider {
  /**
   * Validates the AI connection and API key.
   * @param apiKey The API key to validate.
   */
  validateConnection(apiKey: string): Promise<{ status: AIStatus; message: string }>;

  /**
   * Processes raw recipe text or image data into a structured Recipe object.
   */
  processRecipe(apiKey: string, input: string, prefs: string): Promise<Partial<Recipe>>;

  /**
   * Generates creative recipe ideas based on available ingredients.
   */
  generateGenieIdeas(apiKey: string, ingredients: string, prefs: string): Promise<GenieIdea[]>;

  /**
   * Refines an existing recipe based on user feedback.
   */
  refineRecipe(apiKey: string, recipe: Recipe, prompt: string): Promise<string[]>;

  /**
   * Generates a multi-recipe orchestration plan.
   */
  generateOrchestrationPlan(apiKey: string, recipes: Recipe[]): Promise<OrchestrationPlan>;

  /**
   * Generates a weekly meal plan.
   */
  generateMealPlan(apiKey: string, recipes: Recipe[], prefs: string): Promise<any[]>;

  /**
   * Searches for online deals and prices (Note: may require specific tool support like Google Search).
   */
  searchDeals(apiKey: string, productName: string): Promise<{ items: OnlineDeal[]; sources: { uri: string; title: string }[] }>;

  /**
   * Extracts structured purchase data from a receipt image.
   */
  extractReceiptData(apiKey: string, base64Image: string, mimeType: string): Promise<any>;

  /**
   * Classifies product names into generic/canonical names.
   */
  batchClassifyProducts(apiKey: string, productNames: string[]): Promise<{ original_name: string; generic_name: string }[]>;
}
