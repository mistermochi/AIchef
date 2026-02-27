
import { Recipe, GenieIdea, OrchestrationPlan } from "../../../types";
import { SYSTEM_INSTRUCTIONS, PROMPTS } from "../../../constants/prompts";
import { mapAIError } from "../../../utils/ai";
import { AIProvider } from "../types";

/**
 * @class MistralProvider
 * @description Implementation of the AIProvider interface for Mistral AI models.
 * Uses native fetch to call Mistral's API.
 */
export class MistralProvider implements AIProvider {
  private async callMistral<T>(apiKey: string, config: {
    model: string;
    system: string;
    prompt: string;
    response_format?: { type: 'json_object' };
  }): Promise<T> {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: config.system },
            { role: 'user', content: config.prompt }
          ],
          response_format: config.response_format
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || `Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      return JSON.parse(text) as T;
    } catch (error: any) {
      const mapped = mapAIError(error);
      throw new Error(mapped.message);
    }
  }

  async validateConnection(apiKey: string) {
    try {
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (response.ok) return { status: 'healthy' as const, message: 'Connected' };
      return mapAIError(new Error("Invalid API Key"));
    } catch (error) {
      return mapAIError(error);
    }
  }

  async processRecipe(apiKey: string, input: string, prefs: string) {
    return this.callMistral<Partial<Recipe>>(apiKey, {
      model: 'mistral-large-latest',
      system: SYSTEM_INSTRUCTIONS.RECIPE_PROCESSOR(prefs) + " Output must be a valid JSON object matching the Recipe schema.",
      prompt: input,
      response_format: { type: 'json_object' }
    });
  }

  async generateGenieIdeas(apiKey: string, ingredients: string, prefs: string) {
    return this.callMistral<GenieIdea[]>(apiKey, {
      model: 'mistral-small-latest',
      system: SYSTEM_INSTRUCTIONS.GENIE(prefs) + " Output must be a valid JSON array of GenieIdea objects.",
      prompt: PROMPTS.GENIE_INPUT(ingredients),
      response_format: { type: 'json_object' }
    });
  }

  async refineRecipe(apiKey: string, recipe: Recipe, prompt: string) {
    return this.callMistral<string[]>(apiKey, {
      model: 'mistral-large-latest',
      system: SYSTEM_INSTRUCTIONS.REFINE + " Output must be a JSON array of strings.",
      prompt: PROMPTS.REFINE_RECIPE(JSON.stringify(recipe), prompt),
      response_format: { type: 'json_object' }
    });
  }

  async generateOrchestrationPlan(apiKey: string, recipes: Recipe[]) {
    return this.callMistral<OrchestrationPlan>(apiKey, {
      model: 'mistral-large-latest',
      system: SYSTEM_INSTRUCTIONS.ORCHESTRATOR + " Output must be a valid JSON object matching the OrchestrationPlan schema.",
      prompt: PROMPTS.ORCHESTRATE(JSON.stringify(recipes.map(r => ({ title: r.title, steps: r.instructions })))),
      response_format: { type: 'json_object' }
    });
  }

  async generateMealPlan(apiKey: string, recipes: Recipe[], prefs: string) {
    return this.callMistral<any[]>(apiKey, {
      model: 'mistral-large-latest',
      system: SYSTEM_INSTRUCTIONS.PLANNER(prefs) + " Output must be a valid JSON array of meal plan entries.",
      prompt: PROMPTS.PLAN_WEEK(recipes.map(r => r.title).join(', ')),
      response_format: { type: 'json_object' }
    });
  }

  async searchDeals(_apiKey: string, _productName: string) {
    return { items: [], sources: [] };
  }

  async extractReceiptData(_apiKey: string, _base64Image: string, _mimeType: string) {
    throw new Error("Receipt extraction not yet implemented for Mistral provider.");
  }

  async batchClassifyProducts(apiKey: string, productNames: string[]) {
    return this.callMistral<{ original_name: string, generic_name: string }[]>(apiKey, {
      model: 'mistral-small-latest',
      system: SYSTEM_INSTRUCTIONS.DATA_MIGRATION + " Output must be a JSON array of objects with original_name and generic_name.",
      prompt: PROMPTS.BATCH_CLASSIFY(JSON.stringify(productNames)),
      response_format: { type: 'json_object' }
    });
  }
}
