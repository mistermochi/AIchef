
import { useState } from 'react';
import * as gemini from '../services/geminiService';
import { useAuthContext } from '../context/AuthContext';
import { Recipe, GenieIdea } from '../types';

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
