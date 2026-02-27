
import { GeminiProvider } from './providers/gemini';
import { MistralProvider } from './providers/mistral';
import { AIProvider } from './types';
import { Recipe } from '../../../types';

export type AIProviderType = 'gemini' | 'mistral';

const providers: Record<AIProviderType, AIProvider> = {
  gemini: new GeminiProvider(),
  mistral: new MistralProvider(),
};

/**
 * @function getActiveProvider
 * @description Helper to get the provider implementation and API key based on user settings.
 */
const getActiveProvider = () => {
  const type = (localStorage.getItem('chefai_provider') as AIProviderType) || 'gemini';
  const provider = providers[type] || providers.gemini;
  let apiKey = localStorage.getItem(`chefai_${type}_key`) || localStorage.getItem('chefai_pass') || '';
  return { provider, apiKey, type };
};

/**
 * @module AIService
 * @description Central dispatcher for AI calls. Delegating to the appropriate provider based on user configuration.
 */
export const validateAIConnection = async () => {
  const { provider, apiKey } = getActiveProvider();
  if (!apiKey) return { status: 'auth_error' as const, message: 'API Key missing' };
  return provider.validateConnection(apiKey);
};

export const processRecipe = (input: string, prefs: string) => {
  const { provider, apiKey } = getActiveProvider();
  return provider.processRecipe(apiKey, input, prefs);
};

export const generateGenieIdeas = (ingredients: string, prefs: string) => {
  const { provider, apiKey } = getActiveProvider();
  return provider.generateGenieIdeas(apiKey, ingredients, prefs);
};

export const refineRecipe = (recipe: Recipe, prompt: string) => {
  const { provider, apiKey } = getActiveProvider();
  return provider.refineRecipe(apiKey, recipe, prompt);
};

export const generateOrchestrationPlan = (recipes: Recipe[]) => {
  const { provider, apiKey } = getActiveProvider();
  return provider.generateOrchestrationPlan(apiKey, recipes);
};

export const generateMealPlan = (recipes: Recipe[], prefs: string) => {
  const { provider, apiKey } = getActiveProvider();
  return provider.generateMealPlan(apiKey, recipes, prefs);
};

export const searchDeals = (productName: string) => {
  const { provider, apiKey } = getActiveProvider();
  return provider.searchDeals(apiKey, productName);
};

export const extractReceiptData = (base64Image: string, mimeType: string) => {
  const { provider, apiKey } = getActiveProvider();
  return provider.extractReceiptData(apiKey, base64Image, mimeType);
};

export const batchClassifyProducts = (productNames: string[]) => {
  const { provider, apiKey } = getActiveProvider();
  return provider.batchClassifyProducts(apiKey, productNames);
};
