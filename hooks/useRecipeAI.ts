
import { useState } from 'react';
import * as gemini from '../services/geminiService';
import { useAuthContext } from '../context/AuthContext';
import { Recipe, GenieIdea } from '../types';

/**
 * @hook useRecipeAI
 * @description A high-level hook that connects the UI to the Gemini AI services for recipe-related tasks.
 * It manages loading states, handles AI-specific errors, and provides functions for processing, refining, and generating recipe ideas.
 *
 * Interactions:
 * - {@link geminiService}: Calls the underlying AI functions.
 * - {@link useAuthContext}: Uses user preferences and reports AI health status.
 *
 * @returns {Object} An object containing state and AI action functions.
 */
export function useRecipeAI() {
  const { isAIEnabled, openKeySelector, getProfileContext, reportError } = useAuthContext();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [genieLoading, setGenieLoading] = useState(false);
  const [genieIdeas, setGenieIdeas] = useState<GenieIdea[]>([]);

  const handleAIError = (e: any) => {
    const msg = e.message.toLowerCase();
    
    if (msg.includes('api_key_not_found') || msg.includes('api key') || msg.includes('auth')) {
      reportError('auth_error', "API Key invalid or missing.");
      setError("API Key invalid or missing.");
      openKeySelector();
    } else if (msg.includes('limit') || msg.includes('quota')) {
      reportError('quota_error', "API Quota Exceeded.");
      setError("API Quota Exceeded.");
    } else if (msg.includes('region') || msg.includes('location')) {
      reportError('region_restricted', "Region Not Supported.");
      setError("Region Not Supported.");
    } else {
      reportError('unhealthy', e.message);
      setError(e.message);
    }
  };

  /**
   * Processes raw text or OCR data into a structured Recipe object.
   * @param {string} input - The raw recipe data.
   * @returns {Promise<Recipe|null>} The structured recipe or null if failed.
   */
  const processRecipe = async (input: string): Promise<Recipe | null> => {
    if (!input.trim() || !isAIEnabled) return null;
    setLoading(true); 
    setError('');
    const prefs = getProfileContext();
    try {
      const res = await gemini.processRecipe(input, prefs);
      return { 
        ...res, 
        ingredients: res.ingredients||[], 
        instructions: res.instructions||[], 
        extractedTips: res.extractedTips||[], 
        aiSuggestions: res.aiSuggestions||[] 
      } as Recipe;
    } catch (e: any) { 
      handleAIError(e); 
      return null;
    } finally { 
      setLoading(false); 
    }
  };

  /**
   * Generates creative recipe ideas based on a list of ingredients.
   * Updates the `genieIdeas` state.
   * @param {string} input - List of ingredients.
   */
  const generateGenieIdeas = async (input: string) => {
    if (!input.trim() || !isAIEnabled) return;
    setGenieLoading(true); 
    setGenieIdeas([]);
    const prefs = getProfileContext();
    try {
      const ideas = await gemini.generateGenieIdeas(input, prefs);
      setGenieIdeas(ideas);
    } catch (e: any) { 
      handleAIError(e); 
    } finally { 
      setGenieLoading(false); 
    }
  };

  /**
   * Requests refinement suggestions for an existing recipe.
   * @param {Recipe} recipe - The original recipe.
   * @param {string} prompt - User feedback or instructions.
   * @returns {Promise<string[]>} A list of suggested changes.
   */
  const refineRecipe = async (recipe: Recipe, prompt: string): Promise<string[]> => {
    if (!prompt.trim() || !isAIEnabled) return [];
    setLoading(true);
    setError('');
    try {
      return await gemini.refineRecipe(recipe, prompt);
    } catch (e: any) {
      handleAIError(e);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    genieLoading,
    genieIdeas,
    processRecipe,
    generateGenieIdeas,
    refineRecipe
  };
}
