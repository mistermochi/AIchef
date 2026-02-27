
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, GenieIdea, OrchestrationPlan } from '../model/types';
import { SYSTEM_INSTRUCTIONS, PROMPTS } from '../config/prompts';
import { SCHEMAS } from '../config/schemas';
import { mapAIError } from '../lib/ai';
import { AIService } from './aiService';

/**
 * @module GeminiService
 * @description Provides high-level functions to interact with Google Gemini AI models.
 * It handles client initialization, error mapping, and specific AI-driven features like recipe processing and orchestration.
 */

// --- CLIENT CACHING ---
let cachedClient: GoogleGenAI | null = null;
let cachedKey: string | undefined = undefined;

/**
 * Retrieves a memoized instance of the GoogleGenAI client.
 * Uses the API key stored in localStorage ('chefai_pass').
 * @returns {GoogleGenAI} The Gemini AI client.
 * @throws {Error} If the API key is not found in localStorage.
 */
const getClient = () => {
	const apiKey = localStorage.getItem('chefai_pass');
  
  // If the key is null or empty, stop immediately
	if (!apiKey) {
	  throw new Error("API Key not found in localStorage");
	}
	
  if (!cachedClient || cachedKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    cachedKey = apiKey;
  }
  return cachedClient;
};

/**
 * Internal factory function to make standardized calls to the Gemini AI models.
 * @template T
 * @param {Object} config - The configuration for the AI call.
 * @param {string} config.model - The model ID to use (e.g., 'gemini-3-pro-preview').
 * @param {string} config.system - System instructions to guide the AI's behavior.
 * @param {string} config.prompt - The user prompt.
 * @param {any} config.schema - The expected JSON response schema.
 * @param {any[]} [config.tools] - Optional tools for the AI (e.g., Google Search).
 * @returns {Promise<T>} The parsed JSON response from the AI.
 * @throws {Error} Maps various AI errors (quota, region, auth) to user-friendly messages.
 */
async function callAI<T>(config: {
  model: string;
  system: string;
  prompt: string;
  schema: object;
  tools?: object[];
}): Promise<T> {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: config.model,
      contents: [{ parts: [{ text: config.prompt }] }],
      config: {
        systemInstruction: config.system,
        responseMimeType: "application/json",
        responseSchema: config.schema,
        tools: config.tools
      }
    });
    if (!response.text) throw new Error("Safety filter blocked response.");
    return JSON.parse(response.text.trim()) as T;
  } catch (error: any) {
    const mapped = mapAIError(error);
    throw new Error(mapped.message);
  }
}

export class GeminiService implements AIService {
  /**
   * Validates the AI connection and API key without consuming significant quota.
   * Uses a zero-cost token count check on a cheap model.
   * @returns {Promise<Object>} Status of the connection and a message.
   */
  async validateAIConnection(): Promise<{ status: 'healthy' | 'auth_error' | 'quota_error' | 'network_error' | 'region_restricted' | 'unhealthy', message: string }> {
    try {
      const ai = getClient();
      // Zero-cost check using countTokens on a cheap model
      await ai.models.countTokens({
        model: 'gemini-flash-lite-latest',
        contents: [{ parts: [{ text: 'sanity_check' }] }],
      });
      return { status: 'healthy', message: 'Connected' };
    } catch (error: any) {
      return mapAIError(error);
    }
  }

  /**
   * Processes raw recipe text or image data into a structured Recipe object.
   * @param {string} input - The raw recipe data (text or OCR result).
   * @param {string} prefs - User dietary preferences and context.
   * @returns {Promise<Partial<Recipe>>} The structured recipe data.
   */
  async processRecipe(input: string, prefs: string) {
    return callAI<Partial<Recipe>>({
      model: 'gemini-3-pro-preview',
      schema: SCHEMAS.RECIPE,
      prompt: input,
      system: SYSTEM_INSTRUCTIONS.RECIPE_PROCESSOR(prefs)
    });
  }

  /**
   * Generates creative recipe ideas based on available ingredients.
   * @param {string} ingredients - List of available ingredients.
   * @param {string} prefs - User dietary preferences and context.
   * @returns {Promise<GenieIdea[]>} A list of recipe ideas.
   */
  async generateGenieIdeas(ingredients: string, prefs: string): Promise<GenieIdea[]> {
    const prompt = `${SYSTEM_INSTRUCTIONS.GENIE(prefs)}\n\nInput:\n${PROMPTS.GENIE_INPUT(ingredients)}`;

    return callAI<GenieIdea[]>({
      model: 'gemini-2.5-flash',
      schema: SCHEMAS.GENIE,
      prompt: prompt,
      system: "You are a creative chef."
    });
  }

  /**
   * Refines an existing recipe based on user feedback or specific requests.
   * @param {Recipe} recipe - The original recipe object.
   * @param {string} prompt - User instructions for refinement.
   * @returns {Promise<string[]>} A list of recommended changes/refinements.
   */
  async refineRecipe(recipe: Recipe, prompt: string) {
    return callAI<string[]>({
      model: 'gemini-3-pro-preview',
      schema: { type: Type.ARRAY, items: { type: Type.STRING } },
      prompt: PROMPTS.REFINE_RECIPE(JSON.stringify(recipe), prompt),
      system: SYSTEM_INSTRUCTIONS.REFINE
    });
  }

  /**
   * Generates a multi-recipe orchestration plan (prep, cook, wait steps).
   * Synchronizes timing between multiple dishes.
   * @param {Recipe[]} recipes - The list of recipes to orchestrate.
   * @returns {Promise<OrchestrationPlan>} The multi-step orchestration plan.
   */
  async generateOrchestrationPlan(recipes: Recipe[]) {
    return callAI<OrchestrationPlan>({
      model: 'gemini-3-pro-preview',
      schema: SCHEMAS.ORCHESTRATION,
      prompt: PROMPTS.ORCHESTRATE(JSON.stringify(recipes.map(r => ({ title: r.title, steps: r.instructions })))),
      system: SYSTEM_INSTRUCTIONS.ORCHESTRATOR
    });
  }

  /**
   * Generates a weekly meal plan based on a collection of recipes.
   * @param {Recipe[]} recipes - Available recipes to choose from.
   * @param {string} prefs - User preferences.
   * @returns {Promise<any[]>} The generated meal plan entries.
   */
  async generateMealPlan(recipes: Recipe[], prefs: string) {
    return callAI<any[]>({
      model: 'gemini-3-pro-preview',
      schema: SCHEMAS.MEAL_PLAN,
      prompt: PROMPTS.PLAN_WEEK(recipes.map(r => r.title).join(', ')),
      system: SYSTEM_INSTRUCTIONS.PLANNER(prefs)
    });
  }

  /**
   * Searches for online deals and prices for a specific product using Google Search grounding.
   * @param {string} productName - The name of the product to search for.
   * @returns {Promise<Object>} An object containing found items and their sources.
   */
  async searchDeals(productName: string) {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: PROMPTS.DEAL_SEARCH(productName) }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: SCHEMAS.DEALS
      }
    });

    const items = JSON.parse(response.text || '[]').map((it: any) => ({
      ...it,
      imageUrl: it.imageUrl || 'https://placehold.co/80x80/f3f4f6/374151?text=IMG',
      url: it.url || '#'
    }));

    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
      .filter((c: any) => c.web)
      .map((c: any) => ({ uri: c.web!.uri, title: c.web!.title || 'Source' }));

    return { items, sources };
  }

  /**
   * Extracts structured purchase data from a receipt image using OCR and AI analysis.
   * @param {string} base64Image - The base64 encoded receipt image.
   * @param {string} mimeType - The MIME type of the image.
   * @returns {Promise<Object>} Structured data containing product names, prices, and quantities.
   */
  async extractReceiptData(base64Image: string, mimeType: string) {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [{
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType } },
          { text: SYSTEM_INSTRUCTIONS.RECEIPT_OCR }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: SCHEMAS.RECEIPT_EXTRACTION
      }
    });
    return JSON.parse(response.text || '{}');
  }

  /**
   * Classifies multiple product names into generic/canonical names for better data organization.
   * Used during data migration or cleanup.
   * @param {string[]} productNames - List of raw product names.
   * @returns {Promise<Array<{original_name: string, generic_name: string}>>} Mapped product names.
   */
  async batchClassifyProducts(productNames: string[]) {
    return callAI<{ original_name: string, generic_name: string }[]>({
      model: 'gemini-flash-lite-latest',
      schema: SCHEMAS.MIGRATION_MAP,
      prompt: PROMPTS.BATCH_CLASSIFY(JSON.stringify(productNames)),
      system: SYSTEM_INSTRUCTIONS.DATA_MIGRATION
    });
  }
}

// Export a singleton instance for backward compatibility where needed,
// though the factory is preferred going forward.
export const geminiService = new GeminiService();

// Keep individual exports for now to avoid breaking existing imports before refactoring them
export const validateAIConnection = () => geminiService.validateAIConnection();
export const processRecipe = (input: string, prefs: string) => geminiService.processRecipe(input, prefs);
export const generateGenieIdeas = (ingredients: string, prefs: string) => geminiService.generateGenieIdeas(ingredients, prefs);
export const refineRecipe = (recipe: Recipe, prompt: string) => geminiService.refineRecipe(recipe, prompt);
export const generateOrchestrationPlan = (recipes: Recipe[]) => geminiService.generateOrchestrationPlan(recipes);
export const generateMealPlan = (recipes: Recipe[], prefs: string) => geminiService.generateMealPlan(recipes, prefs);
export const searchDeals = (productName: string) => geminiService.searchDeals(productName);
export const extractReceiptData = (base64Image: string, mimeType: string) => geminiService.extractReceiptData(base64Image, mimeType);
export const batchClassifyProducts = (productNames: string[]) => geminiService.batchClassifyProducts(productNames);
