
import { GoogleGenAI } from "@google/genai";
import { Recipe, GenieIdea, OrchestrationPlan } from "../../../types";
import { SYSTEM_INSTRUCTIONS, PROMPTS } from "../../../constants/prompts";
import { SCHEMAS } from "../../../constants/schemas";
import { mapAIError } from "../../../utils/ai";
import { AIProvider } from "../types";

/**
 * @class GeminiProvider
 * @description Implementation of the AIProvider interface for Google's Gemini AI models.
 */
export class GeminiProvider implements AIProvider {
  private getClient(apiKey: string) {
    if (!apiKey) throw new Error("Gemini API Key not found");
    // Use the pattern from the original geminiService.ts
    return new GoogleGenAI({ apiKey });
  }

  private async callAI<T>(apiKey: string, config: {
    model: string;
    system: string;
    prompt: string;
    schema: any;
    tools?: any[];
  }): Promise<T> {
    const ai = this.getClient(apiKey);
    try {
      // @ts-ignore - The types in @google/genai might be slightly different than what's available at runtime in this env
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

      const text = response.text;
      if (!text) throw new Error("Safety filter blocked response.");
      return JSON.parse(text.trim()) as T;
    } catch (error: any) {
      const mapped = mapAIError(error);
      throw new Error(mapped.message);
    }
  }

  async validateConnection(apiKey: string) {
    const ai = this.getClient(apiKey);
    try {
      // @ts-ignore
      await ai.models.countTokens({
        model: 'gemini-1.5-flash-8b',
        contents: [{ parts: [{ text: 'sanity_check' }] }],
      });
      return { status: 'healthy' as const, message: 'Connected' };
    } catch (error: any) {
      return mapAIError(error);
    }
  }

  async processRecipe(apiKey: string, input: string, prefs: string) {
    return this.callAI<Partial<Recipe>>(apiKey, {
      model: 'gemini-1.5-pro',
      schema: SCHEMAS.RECIPE,
      prompt: input,
      system: SYSTEM_INSTRUCTIONS.RECIPE_PROCESSOR(prefs)
    });
  }

  async generateGenieIdeas(apiKey: string, ingredients: string, prefs: string) {
    const prompt = `${SYSTEM_INSTRUCTIONS.GENIE(prefs)}\n\nInput:\n${PROMPTS.GENIE_INPUT(ingredients)}`;
    return this.callAI<GenieIdea[]>(apiKey, {
      model: 'gemini-1.5-flash',
      schema: SCHEMAS.GENIE,
      prompt: prompt,
      system: "You are a creative chef."
    });
  }

  async refineRecipe(apiKey: string, recipe: Recipe, prompt: string) {
    return this.callAI<string[]>(apiKey, {
      model: 'gemini-1.5-pro',
      schema: { type: "ARRAY", items: { type: "STRING" } },
      prompt: PROMPTS.REFINE_RECIPE(JSON.stringify(recipe), prompt),
      system: SYSTEM_INSTRUCTIONS.REFINE
    });
  }

  async generateOrchestrationPlan(apiKey: string, recipes: Recipe[]) {
    return this.callAI<OrchestrationPlan>(apiKey, {
      model: 'gemini-1.5-pro',
      schema: SCHEMAS.ORCHESTRATION,
      prompt: PROMPTS.ORCHESTRATE(JSON.stringify(recipes.map(r => ({ title: r.title, steps: r.instructions })))),
      system: SYSTEM_INSTRUCTIONS.ORCHESTRATOR
    });
  }

  async generateMealPlan(apiKey: string, recipes: Recipe[], prefs: string) {
    return this.callAI<any[]>(apiKey, {
      model: 'gemini-1.5-pro',
      schema: SCHEMAS.MEAL_PLAN,
      prompt: PROMPTS.PLAN_WEEK(recipes.map(r => r.title).join(', ')),
      system: SYSTEM_INSTRUCTIONS.PLANNER(prefs)
    });
  }

  async searchDeals(apiKey: string, productName: string) {
    const ai = this.getClient(apiKey);
    // @ts-ignore
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
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

  async extractReceiptData(apiKey: string, base64Image: string, mimeType: string) {
    const ai = this.getClient(apiKey);
    // @ts-ignore
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
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

  async batchClassifyProducts(apiKey: string, productNames: string[]) {
    return this.callAI<{ original_name: string, generic_name: string }[]>(apiKey, {
      model: 'gemini-1.5-flash',
      schema: SCHEMAS.MIGRATION_MAP,
      prompt: PROMPTS.BATCH_CLASSIFY(JSON.stringify(productNames)),
      system: SYSTEM_INSTRUCTIONS.DATA_MIGRATION
    });
  }
}
