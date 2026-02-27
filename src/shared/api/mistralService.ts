
import { Mistral } from '@mistralai/mistralai';
import { Recipe, GenieIdea, OrchestrationPlan } from '../model/types';
import { SYSTEM_INSTRUCTIONS, PROMPTS } from '../config/prompts';
import { mapAIError } from '../lib/ai';
import { AIService } from './aiService';

/**
 * @module MistralService
 * @description Provides high-level functions to interact with Mistral AI models.
 */

// --- CLIENT CACHING ---
let cachedClient: Mistral | null = null;
let cachedKey: string | undefined = undefined;

/**
 * Retrieves a memoized instance of the Mistral client.
 * Uses the API key stored in localStorage ('mistral_api_key').
 * @returns {Mistral} The Mistral AI client.
 * @throws {Error} If the API key is not found in localStorage.
 */
const getClient = () => {
  const apiKey = localStorage.getItem('mistral_api_key');

  if (!apiKey) {
    throw new Error("Mistral API Key not found in localStorage");
  }

  if (!cachedClient || cachedKey !== apiKey) {
    cachedClient = new Mistral({ apiKey });
    cachedKey = apiKey;
  }
  return cachedClient;
};

/**
 * Internal factory function to make standardized calls to the Mistral AI models.
 */
async function callAI<T>(config: {
  model: string;
  system: string;
  prompt: string;
}): Promise<T> {
  const client = getClient();
  try {
    const response = await client.chat.complete({
      model: config.model,
      messages: [
        { role: 'system', content: config.system },
        { role: 'user', content: config.prompt }
      ],
      responseFormat: { type: 'json_object' }
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error("Empty response from Mistral.");

    return JSON.parse(content.trim()) as T;
  } catch (error: any) {
    // We reuse mapAIError for now, as it handles common HTTP status codes
    const mapped = mapAIError(error);
    throw new Error(mapped.message);
  }
}

export class MistralService implements AIService {
  async validateAIConnection(): Promise<{ status: 'healthy' | 'auth_error' | 'quota_error' | 'network_error' | 'region_restricted' | 'unhealthy', message: string }> {
    try {
      const client = getClient();
      // Simple chat completion to validate key
      await client.chat.complete({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: 'hi' }],
        maxTokens: 1
      });
      return { status: 'healthy', message: 'Connected' };
    } catch (error: any) {
      return mapAIError(error);
    }
  }

  async processRecipe(input: string, prefs: string) {
    return callAI<Partial<Recipe>>({
      model: 'mistral-large-latest',
      prompt: `Please process this recipe: ${input}. Ensure the output follows the required JSON structure.`,
      system: SYSTEM_INSTRUCTIONS.RECIPE_PROCESSOR(prefs) + "\nOutput valid JSON."
    });
  }

  async generateGenieIdeas(ingredients: string, prefs: string): Promise<GenieIdea[]> {
    const prompt = PROMPTS.GENIE_INPUT(ingredients);
    const res = await callAI<{ ideas: GenieIdea[] }>({
      model: 'mistral-small-latest',
      prompt: prompt,
      system: SYSTEM_INSTRUCTIONS.GENIE(prefs) + "\nReturn a JSON object with an 'ideas' array."
    });
    return res.ideas || [];
  }

  async refineRecipe(recipe: Recipe, prompt: string) {
    const res = await callAI<{ suggestions: string[] }>({
      model: 'mistral-large-latest',
      prompt: PROMPTS.REFINE_RECIPE(JSON.stringify(recipe), prompt),
      system: SYSTEM_INSTRUCTIONS.REFINE + "\nReturn a JSON object with a 'suggestions' array."
    });
    return res.suggestions || [];
  }

  async generateOrchestrationPlan(recipes: Recipe[]) {
    return callAI<OrchestrationPlan>({
      model: 'mistral-large-latest',
      prompt: PROMPTS.ORCHESTRATE(JSON.stringify(recipes.map(r => ({ title: r.title, steps: r.instructions })))),
      system: SYSTEM_INSTRUCTIONS.ORCHESTRATOR + "\nOutput valid JSON."
    });
  }

  async generateMealPlan(recipes: Recipe[], prefs: string) {
    const res = await callAI<{ plan: any[] }>({
      model: 'mistral-large-latest',
      prompt: PROMPTS.PLAN_WEEK(recipes.map(r => r.title).join(', ')),
      system: SYSTEM_INSTRUCTIONS.PLANNER(prefs) + "\nReturn a JSON object with a 'plan' array."
    });
    return res.plan || [];
  }

  async searchDeals(_productName: string): Promise<{ items: any[]; sources: any[] }> {
    throw new Error("Deal Search (Google Search Grounding) is not supported by Mistral provider.");
  }

  async extractReceiptData(base64Image: string, mimeType: string) {
    const client = getClient();
    try {
      const response = await client.chat.complete({
        model: 'pixtral-large-latest',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: SYSTEM_INSTRUCTIONS.RECEIPT_OCR + "\nOutput valid JSON." },
              { type: 'image_url', imageUrl: `data:${mimeType};base64,${base64Image.split(',')[1]}` }
            ]
          }
        ],
        responseFormat: { type: 'json_object' }
      });

      const content = response.choices?.[0]?.message?.content;
      if (typeof content !== 'string') throw new Error("Empty response from Mistral.");
      return JSON.parse(content.trim());
    } catch (error: any) {
      const mapped = mapAIError(error);
      throw new Error(mapped.message);
    }
  }

  async batchClassifyProducts(productNames: string[]) {
    const res = await callAI<{ mappings: Array<{ original_name: string, generic_name: string }> }>({
      model: 'mistral-small-latest',
      prompt: PROMPTS.BATCH_CLASSIFY(JSON.stringify(productNames)),
      system: SYSTEM_INSTRUCTIONS.DATA_MIGRATION + "\nReturn a JSON object with a 'mappings' array."
    });
    return res.mappings || [];
  }
}

export const mistralService = new MistralService();
