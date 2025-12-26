
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Recipe, GenieIdea, OrchestrationPlan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Schemas ---

const RECIPE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Original title.' },
    emoji: { type: Type.STRING, description: 'Single representative emoji.' },
    summary: { type: Type.STRING, description: 'Summary in Traditional Chinese.' },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit: { type: Type.STRING },
        },
        required: ['name', 'quantity', 'unit'],
        propertyOrdering: ['name', 'quantity', 'unit'],
      }
    },
    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
    extractedTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    aiSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['title', 'emoji', 'summary', 'ingredients', 'instructions', 'extractedTips', 'aiSuggestions'],
};

const GENIE_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summary: { type: Type.STRING },
      emoji: { type: Type.STRING }
    },
    required: ['title', 'summary', 'emoji'],
    propertyOrdering: ['title', 'summary', 'emoji']
  }
};

const ORCHESTRATION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    optimizedSummary: { type: Type.STRING },
    totalEstimatedTime: { type: Type.NUMBER },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['prep', 'cook', 'wait'] },
          recipeContext: { type: Type.STRING },
          estimatedMinutes: { type: Type.NUMBER }
        },
        required: ['id', 'description', 'type', 'recipeContext'],
      }
    }
  },
  required: ['optimizedSummary', 'totalEstimatedTime', 'steps'],
};

// --- Helper ---

async function generateJson<T>(model: string, contents: string, systemInstruction: string, responseSchema: Schema): Promise<T> {
  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: { systemInstruction, responseMimeType: "application/json", responseSchema },
    });

    if (!response.text) throw new Error("Response blocked by safety filters.");
    return JSON.parse(response.text.trim()) as T;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('429') || msg.includes('quota')) throw new Error("Usage limit exceeded.");
    if (msg.includes('503')) throw new Error("AI service busy.");
    if (msg.includes('safety')) throw new Error("Content flagged by safety filters.");
    throw new Error("AI Service Error: " + (error.message || "Unknown error"));
  }
}

// --- Exports ---

export async function processRecipe(recipeInput: string, preferences: string): Promise<Partial<Recipe>> {
  const systemInstruction = `
    You are a culinary AI. Process the source. Prefs: "${preferences || "Standard"}"
    Rules:
    1. Title: KEEP ORIGINAL.
    2. Units: Precise (g, ml).
    3. English source: Translate Ingredients ONLY to Trad. Chinese. Keep Instructions English.
    4. Non-English: Translate all to Trad. Chinese.
    5. Tips: Add 3 NEW AI Trad. Chinese suggestions.
  `;
  return generateJson<Partial<Recipe>>("gemini-3-pro-preview", recipeInput, systemInstruction, RECIPE_SCHEMA);
}

export async function generateGenieIdeas(ingredients: string, preferences: string): Promise<GenieIdea[]> {
  const systemInstruction = `
    Generate 5 creative recipe ideas for: "${ingredients}". Prefs: "${preferences}".
    Constraints: Titles in English. Summaries in Traditional Chinese. One emoji each.
  `;
  return generateJson<GenieIdea[]>("gemini-3-flash-preview", "", systemInstruction, GENIE_SCHEMA);
}

export async function refineRecipe(recipe: Recipe, refinePrompt: string): Promise<string[]> {
  const systemInstruction = "Culinary expert. Generate 3 professional suggestions in Traditional Chinese based on the goal.";
  const schema = { type: Type.ARRAY, items: { type: Type.STRING } } as Schema;
  const content = `Recipe: ${JSON.stringify(recipe)}\nGoal: "${refinePrompt}"`;
  
  return generateJson<string[]>("gemini-3-pro-preview", content, systemInstruction, schema);
}

export async function generateOrchestrationPlan(recipes: Recipe[]): Promise<OrchestrationPlan> {
  const systemInstruction = `
    Master kitchen orchestrator. Combine recipes into ONE unified workflow.
    Rules: Group prep. Parallelize cooking. Order logically. OUTPUT: TRADITIONAL CHINESE.
  `;
  const input = recipes.map(r => ({ title: r.title, instructions: r.instructions }));
  
  return generateJson<OrchestrationPlan>(
    "gemini-3-pro-preview", 
    `Recipes: ${JSON.stringify(input)}`, 
    systemInstruction, 
    ORCHESTRATION_SCHEMA
  );
}
