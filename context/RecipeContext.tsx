
import React, { createContext, useContext, useState, useMemo } from 'react';
import { Recipe, GenieIdea } from '../types';
import * as gemini from '../services/geminiService';
import { useAuthContext } from './AuthContext';
import { useSearch } from '../hooks/useSearch';
import { useRecipeRepository } from '../hooks/data/useRecipeRepository';

interface RecipeContextType {
  // Data
  savedRecipes: Recipe[];
  recipesLoading: boolean;
  activeRecipe: Recipe | null;
  setActiveRecipe: (r: Recipe | null | ((prev: Recipe | null) => Recipe | null)) => void;
  
  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredRecipes: Recipe[];

  // Editor State
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  isHandsFree: boolean;
  setIsHandsFree: (v: boolean) => void;
  scalingFactor: number;
  setScalingFactor: (v: number) => void;
  
  // AI Actions
  recipeInput: string;
  setRecipeInput: (v: string) => void;
  loading: boolean;
  error: string;
  processRecipeAction: (input?: string) => Promise<void>;
  handleManualCreateAction: () => void;
  handleSaveRecipeAction: () => Promise<void>;
  handleUpdateRecipeAction: () => Promise<void>;
  handleDeleteRecipeAction: (id: string) => Promise<void>;
  
  // Genie
  genieInput: string;
  setGenieInput: (v: string) => void;
  genieIdeas: GenieIdea[];
  genieLoading: boolean;
  generateGenieIdeasAction: () => Promise<void>;
  selectGenieIdea: (idea: GenieIdea) => Promise<void>;

  // Refine
  refining: boolean;
  refinePrompt: string;
  setRefinePrompt: (v: string) => void;
  refineError: string;
  handleRefineAction: () => Promise<void>;
  saving: boolean;
  saveError: string;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { chefUser, getProfileContext, isAIEnabled, openKeySelector } = useAuthContext();
  
  // Data Repository
  const { recipes: savedRecipes, loading: recipesLoading, addRecipe, updateRecipe, deleteRecipe } = useRecipeRepository(chefUser);

  // UI State
  const [activeRecipeRaw, setActiveRecipeRaw] = useState<Recipe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [scalingFactor, setScalingFactor] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // AI & Genie State
  const [recipeInput, setRecipeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [genieInput, setGenieInput] = useState('');
  const [genieIdeas, setGenieIdeas] = useState<GenieIdea[]>([]);
  const [genieLoading, setGenieLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [refineError, setRefineError] = useState('');

  // Search Logic
  const { searchTerm, setSearchTerm, filteredItems: filteredRecipes } = useSearch(
    savedRecipes, 
    (r: Recipe, term: string) => {
      const searchData = `${r.title} ${r.ingredients?.map(i => i.name).join(' ') || ''}`.toLowerCase();
      return searchData.includes(term);
    }
  );

  // Active Recipe Sanitization
  const activeRecipe = useMemo(() => {
    if (!activeRecipeRaw) return null;
    return {
      ...activeRecipeRaw,
      ingredients: activeRecipeRaw.ingredients || [],
      instructions: activeRecipeRaw.instructions || [],
      extractedTips: activeRecipeRaw.extractedTips || [],
      aiSuggestions: activeRecipeRaw.aiSuggestions || [],
      title: activeRecipeRaw.title || '',
      summary: activeRecipeRaw.summary || '',
      emoji: activeRecipeRaw.emoji || '🥘'
    } as Recipe;
  }, [activeRecipeRaw]);

  const setActiveRecipe = (r: Recipe | null | ((prev: Recipe | null) => Recipe | null)) => {
    if (typeof r === 'function') setActiveRecipeRaw(prev => r(prev));
    else setActiveRecipeRaw(r);
  };

  // --- ACTIONS ---

  const handleAIError = (e: any) => {
    const msg = e.message.toLowerCase();
    if (msg.includes('api_key_not_found')) {
      setError("API Key invalid or missing.");
      openKeySelector();
    } else {
      setError(e.message);
    }
  };

  const processRecipeAction = async (input?: string) => {
    const final = input || recipeInput;
    if (!final.trim() || !isAIEnabled) return;
    setLoading(true); setError('');
    const prefs = getProfileContext();
    try {
      const res = await gemini.processRecipe(final, prefs);
      setActiveRecipe({ ...res, ingredients: res.ingredients||[], instructions: res.instructions||[], extractedTips: res.extractedTips||[], aiSuggestions: res.aiSuggestions||[] } as Recipe);
      setIsEditing(true);
    } catch (e: any) { handleAIError(e); } finally { setLoading(false); }
  };

  const generateGenieIdeasAction = async () => {
    if (!genieInput.trim() || !isAIEnabled) return;
    setGenieLoading(true); setGenieIdeas([]);
    const prefs = getProfileContext();
    try {
      const ideas = await gemini.generateGenieIdeas(genieInput, prefs);
      setGenieIdeas(ideas);
    } catch (e: any) { handleAIError(e); } finally { setGenieLoading(false); }
  };

  const selectGenieIdea = async (idea: GenieIdea) => {
    if (!isAIEnabled) return;
    setLoading(true); setError('');
    const prefs = getProfileContext();
    try {
      const prompt = `Recipe Idea: ${idea.title}. Description: ${idea.summary}. Generate full recipe.`;
      const res = await gemini.processRecipe(prompt, prefs);
      setActiveRecipe({ ...res, ingredients: res.ingredients||[], instructions: res.instructions||[], extractedTips: res.extractedTips||[], aiSuggestions: res.aiSuggestions||[] } as Recipe);
      setIsEditing(true);
    } catch (e: any) { handleAIError(e); } finally { setLoading(false); }
  };

  const handleSaveRecipeAction = async () => {
    if (!chefUser || !activeRecipe) return;
    setSaving(true); setSaveError('');
    try {
      const docRef = await addRecipe(activeRecipe);
      setActiveRecipe({ ...activeRecipe, id: docRef.id });
      setIsEditing(false);
    } catch (e: any) { setSaveError(e.message); } finally { setSaving(false); }
  };

  const handleUpdateRecipeAction = async () => {
    if (!chefUser || !activeRecipe || !activeRecipe.id) return;
    setSaving(true); setSaveError('');
    try {
      const { id, ...data } = activeRecipe;
      await updateRecipe(id!, data);
      setIsEditing(false);
    } catch (e: any) { setSaveError(e.message); } finally { setSaving(false); }
  };

  const handleDeleteRecipeAction = async (id: string) => {
    try {
      await deleteRecipe(id);
      if (activeRecipe?.id === id) setActiveRecipe(null);
    } catch (e: any) { console.error("Delete failed:", e); }
  };

  const handleRefineAction = async () => {
    if (!activeRecipe || !refinePrompt.trim() || !isAIEnabled) return;
    setRefining(true); setRefineError('');
    try {
      const suggestions = await gemini.refineRecipe(activeRecipe, refinePrompt);
      setActiveRecipe(prev => prev ? ({ ...prev, aiSuggestions: [...(prev.aiSuggestions || []), ...suggestions] }) : null);
      setRefinePrompt('');
    } catch (e: any) { setRefineError(e.message); } finally { setRefining(false); }
  };

  const handleManualCreateAction = () => {
    setActiveRecipe({ title:'New Recipe', emoji:'🥘', summary:'', ingredients:[{name:'',quantity:1,unit:'g'}], instructions:[''], extractedTips:[], aiSuggestions:[] } as Recipe);
    setIsEditing(true);
  };

  return (
    <RecipeContext.Provider value={{
      savedRecipes, recipesLoading, activeRecipe, setActiveRecipe,
      searchTerm, setSearchTerm, filteredRecipes,
      isEditing, setIsEditing, isHandsFree, setIsHandsFree, scalingFactor, setScalingFactor,
      recipeInput, setRecipeInput, loading, error, processRecipeAction, handleManualCreateAction,
      handleSaveRecipeAction, handleUpdateRecipeAction, handleDeleteRecipeAction,
      genieInput, setGenieInput, genieIdeas, genieLoading, generateGenieIdeasAction, selectGenieIdea,
      refining, refinePrompt, setRefinePrompt, refineError, handleRefineAction, saving, saveError
    }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipeContext = () => {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipeContext must be used within RecipeProvider');
  return context;
};
