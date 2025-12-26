
// Fix: Use Gemini 3 Pro for complex extraction and reasoning tasks.
// Fix: Move task rules to systemInstruction in config.
// Fix: Add propertyOrdering to schemas and ensure Type usage is correct.

import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, GenieIdea, OrchestrationPlan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Original title of the recipe.' },
    emoji: { type: Type.STRING, description: 'Single emoji representing the dish.' },
    summary: { type: Type.STRING, description: 'Brief summary in Traditional Chinese.' },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Ingredient name in Trad. Chinese.' },
          quantity: { type: Type.NUMBER, description: 'Precise amount.' },
          unit: { type: Type.STRING, description: 'Standard unit (g, ml, tbsp, etc.).' },
        },
        required: ['name', 'quantity', 'unit'],
        propertyOrdering: ['name', 'quantity', 'unit'],
      }
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: 'Step-by-step instruction.' }
    },
    extractedTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: 'Extracted tips or notes.' }
    },
    aiSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: 'AI generated suggestions in Trad. Chinese.' }
    }
  },
  required: ['title', 'emoji', 'summary', 'ingredients', 'instructions', 'extractedTips', 'aiSuggestions'],
  propertyOrdering: ['title', 'emoji', 'summary', 'ingredients', 'instructions', 'extractedTips', 'aiSuggestions'],
};

export async function processRecipe(recipeInput: string, preferences: string): Promise<Partial<Recipe>> {
  const model = "gemini-3-pro-preview";
  const systemInstruction = `
    You are a professional culinary AI. Process the source recipe or concept.
    User Preferences: "${preferences || "Standard"}"

    Rules:
    1. Title: ALWAYS KEEP ORIGINAL; NEVER TRANSLATE.
    2. Units: Prioritize precise measurements (g, ml, tsp, tbsp).
    3. English source: Translate ONLY Ingredients to Trad. Chinese; keep Instructions/Units/ExtractedTips in English.
    4. Non-English source: Translate all components EXCEPT Title to Trad. Chinese.
    5. Emoji: Select exactly one emoji.
    6. Tips: Add 3 NEW AI Trad. Chinese suggestions based on the recipe.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: recipeInput,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
    },
  });

  return JSON.parse((response.text || "{}").trim());
}

export async function generateGenieIdeas(ingredients: string, preferences: string): Promise<GenieIdea[]> {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `
    Generate 5 creative and realistic recipe ideas that can be made with the user's ingredients.
    User Preferences: "${preferences}"
    
    Constraints:
    - Titles must be in English.
    - Summaries must be in Traditional Chinese.
    - Each must have a single representative emoji.
    - Return a JSON array of objects.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `Ingredients: "${ingredients}"`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
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
      }
    },
  });

  return JSON.parse((response.text || "[]").trim());
}

export async function refineRecipe(recipe: Recipe, refinePrompt: string): Promise<string[]> {
  const model = "gemini-3-pro-preview";
  const recipeData = JSON.stringify(recipe);
  const systemInstruction = `
    You are a culinary expert. Based on the provided full JSON recipe object and the user's goal, generate 3 professional culinary suggestions in Traditional Chinese.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `Recipe Data: ${recipeData}\nGoal: "${refinePrompt}"`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
    },
  });

  return JSON.parse((response.text || "[]").trim());
}

export async function generateOrchestrationPlan(recipes: Recipe[]): Promise<OrchestrationPlan> {
  const model = "gemini-3-pro-preview";
  const systemInstruction = `
    You are a master kitchen orchestrator. Your goal is to combine multiple recipes into ONE unified, time-optimized workflow.
    
    Rules:
    1. Group all "Prep" work (chopping, measuring) at the start to clear counter space.
    2. Parallelize: If dish A is baking or simmering (dead time), use that time for dish B's active tasks.
    3. Order steps to ensure all dishes finish roughly at the same time.
    4. Provide clear recipe context for each step so the user knows which dish they are working on.
    5. Summarize the strategy (e.g., "We start with the roast as it takes longest...").
  `;

  const input = recipes.map(r => ({
    title: r.title,
    instructions: r.instructions
  }));

  const response = await ai.models.generateContent({
    model,
    contents: `Recipes to Orchestrate: ${JSON.stringify(input)}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
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
              propertyOrdering: ['id', 'description', 'type', 'recipeContext', 'estimatedMinutes']
            }
          }
        },
        required: ['optimizedSummary', 'totalEstimatedTime', 'steps'],
        propertyOrdering: ['optimizedSummary', 'totalEstimatedTime', 'steps']
      }
    }
  });

  return JSON.parse((response.text || "{}").trim());
}
