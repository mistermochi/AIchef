
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, GenieIdea, OrchestrationPlan } from '../types';
import { SYSTEM_INSTRUCTIONS, PROMPTS } from '../constants/prompts';
import { SCHEMAS } from '../constants/schemas';

// --- CLIENT CACHING ---
let cachedClient: GoogleGenAI | null = null;
let cachedKey: string | undefined = undefined;

// Helper to get a memoized client instance using the current environment key
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

export const generateGenieIdeas = async (ingredients: string, prefs: string): Promise<GenieIdea[]> => {
  const prompt = `${SYSTEM_INSTRUCTIONS.GENIE(prefs)}\n\nInput:\n${PROMPTS.GENIE_INPUT(ingredients)}`;
  
  // Directly use callAI with the array schema
  return callAI<GenieIdea[]>({
    model: 'gemini-2.5-flash',
    schema: SCHEMAS.GENIE,
    prompt: prompt,
    system: "You are a creative chef."
  });
};

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

export const generateMealPlan = (recipes: Recipe[], prefs: string) => callAI<any[]>({
  model: 'gemini-3-pro-preview',
  schema: SCHEMAS.MEAL_PLAN,
  prompt: PROMPTS.PLAN_WEEK(recipes.map(r => r.title).join(', ')),
  system: SYSTEM_INSTRUCTIONS.PLANNER(prefs)
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

export const batchClassifyProducts = async (productNames: string[]) => {
  return callAI<{ original_name: string, generic_name: string }[]>({
    model: 'gemini-flash-lite-latest',
    schema: SCHEMAS.MIGRATION_MAP,
    prompt: PROMPTS.BATCH_CLASSIFY(JSON.stringify(productNames)),
    system: SYSTEM_INSTRUCTIONS.DATA_MIGRATION
  });
};
