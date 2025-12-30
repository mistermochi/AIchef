
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, GenieIdea, OrchestrationPlan } from '../types';
import { SYSTEM_INSTRUCTIONS, PROMPTS } from '../constants/prompts';
import { SCHEMAS } from '../constants/schemas';

// Helper to get a fresh client instance using the current environment key
const getClient = () => {
	const key = localStorage.getItem('chefai_pass');
  
  // If the key is null or empty, stop immediately
	if (!key) {
	  throw new Error("API Key not found in localStorage");
	}

	return new GoogleGenAI({ apiKey: key });
};

// --- FACTORY ---
async function callAI<T>(config: {
  model: string;
  system: string;
  prompt: string;
  schema: any;
  tools?: any[];
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
    const msg = error.message.toLowerCase();
    if (msg.includes('location') || msg.includes('region')) throw new Error("Region not supported.");
    if (msg.includes('entity was not found') || msg.includes('api_key_not_found')) throw new Error("API_KEY_NOT_FOUND");
    if (msg.includes('429') || msg.includes('quota')) throw new Error("API Limit reached.");
    throw new Error(error.message || "AI Service failure.");
  }
}

// --- UTILITIES ---
export const validateAIConnection = async (): Promise<{ status: 'healthy' | 'auth_error' | 'quota_error' | 'network_error' | 'region_restricted', message: string }> => {
  const ai = getClient();
  try {
    // Zero-cost check using countTokens on a cheap model
    // This validates API Key and Connectivity without invoking inference quota
    await ai.models.countTokens({
      model: 'gemini-flash-lite-latest',
      contents: [{ parts: [{ text: 'sanity_check' }] }],
    });
    return { status: 'healthy', message: 'Connected' };
  } catch (error: any) {
    const msg = error.message.toLowerCase();

    // 1. Region/Location Check (Priority)
    // Google returns "User location is not supported for the API use" with 400 Bad Request
    if (msg.includes('location') || msg.includes('region') || msg.includes('unsupported country')) {
       return { status: 'region_restricted', message: 'Location Not Supported' };
    }

    // 2. Quota Check
    if (msg.includes('quota') || msg.includes('429')) {
      return { status: 'quota_error', message: 'Quota Exceeded' };
    }

    // 3. Auth Check (Generic 400/403/Key)
    if (msg.includes('api_key') || msg.includes('403') || msg.includes('400') || msg.includes('not found')) {
      return { status: 'auth_error', message: 'Invalid API Key' };
    }

    // 4. Fallback
    return { status: 'network_error', message: error.message || 'Connection Failed' };
  }
};

// --- FEATURES ---
export const processRecipe = (input: string, prefs: string) => callAI<Partial<Recipe>>({
  model: 'gemini-3-pro-preview',
  schema: SCHEMAS.RECIPE,
  prompt: input,
  system: SYSTEM_INSTRUCTIONS.RECIPE_PROCESSOR(prefs)
});

export const generateGenieIdeas = (ingredients: string, prefs: string) => callAI<GenieIdea[]>({
  model: 'gemini-flash-lite-latest',
  schema: SCHEMAS.GENIE,
  prompt: PROMPTS.GENIE_INPUT(ingredients),
  system: SYSTEM_INSTRUCTIONS.GENIE(prefs)
});

export const refineRecipe = (recipe: Recipe, prompt: string) => callAI<string[]>({
  model: 'gemini-3-pro-preview',
  schema: { type: Type.ARRAY, items: { type: Type.STRING } },
  prompt: PROMPTS.REFINE_RECIPE(JSON.stringify(recipe), prompt),
  system: SYSTEM_INSTRUCTIONS.REFINE
});

export const generateOrchestrationPlan = (recipes: Recipe[]) => callAI<OrchestrationPlan>({
  model: 'gemini-3-pro-preview',
  schema: SCHEMAS.ORCHESTRATION,
  prompt: PROMPTS.ORCHESTRATE(JSON.stringify(recipes.map(r => ({ title: r.title, steps: r.instructions })))),
  system: SYSTEM_INSTRUCTIONS.ORCHESTRATOR
});

export const searchDeals = async (productName: string) => {
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
};

export const extractReceiptData = async (base64Image: string, mimeType: string) => {
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
};
