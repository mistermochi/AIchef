

import { useState } from 'react';
import * as gemini from '../shared/api/ai';
import { useAuthContext } from '../context/AuthContext';
import { Recipe, GenieIdea } from '../types';
import { mapAIError } from '../utils/ai';

/**
 * @hook useRecipeAI
 * @description Provides logic for all AI-driven recipe features: processing, genie ideas, and refinements.
 * It manages loading and error states for these asynchronous operations.
 *
 * Features:
 * - Recipe Processing: Converts raw text/OCR to structured data.
 * - Kitchen Genie: Generates 5 recipe ideas from given ingredients.
 * - Recipe Refinement: Suggests 3 improvements to an existing recipe.
 *
 * Interactions:
 * - {@link useAuthContext}: Accesses dietary preferences and custom instructions for AI context.
 * - {@link AIService}: Calls the underlying AI functions.
 */
export function useRecipeAI() {
  const { getProfileContext, reportError, openKeySelector } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Genie specific state
  const [genieLoading, setGenieLoading] = useState(false);
  const [genieIdeas, setGenieIdeas] = useState<GenieIdea[]>([]);

  /**
   * Internal helper to handle standardized AI error flows.
   */
  const handleError = (e: any) => {
    const mapped = mapAIError(e);
    setError(mapped.message);
    reportError(mapped.status, mapped.message);

    // If it's an auth error, we might want to prompt the key selector
    if (mapped.status === 'auth_error') {
       openKeySelector();
    }

    throw e;
  };

  /**
   * Processes input text/OCR into a structured recipe.
   */
  const processRecipe = async (input: string) => {
    setLoading(true);
    setError(null);
    try {
      const prefs = getProfileContext();
      const res = await gemini.processRecipe(input, prefs);

      // Ensure essential fields exist even if AI missed them
      return {
        ...res,
        ingredients: res.ingredients || [],
        instructions: res.instructions || [],
        extractedTips: res.extractedTips || [],
        aiSuggestions: res.aiSuggestions || []
      } as Partial<Recipe>;
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generates 5 recipe ideas based on available ingredients.
   */
  const generateGenieIdeas = async (ingredients: string) => {
    setGenieLoading(true);
    setError(null);
    try {
      const prefs = getProfileContext();
      const res = await gemini.generateGenieIdeas(ingredients, prefs);
      setGenieIdeas(res);
      return res;
    } catch (e) {
      handleError(e);
    } finally {
      setGenieLoading(false);
    }
  };

  /**
   * Generates 3 suggestions to refine an existing recipe.
   */
  const getRefinements = async (recipe: Recipe, prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await gemini.refineRecipe(recipe, prompt);
      return res;
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    genieLoading,
    error,
    genieIdeas,
    processRecipe,
    generateGenieIdeas,
    getRefinements
  };
}
