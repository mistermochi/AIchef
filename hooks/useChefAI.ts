
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  Timestamp 
} from 'firebase/firestore';
import { auth, db, APP_ID } from '../firebase';
import { Recipe, View, ShoppingListItem, Ingredient, GenieIdea, OrchestrationPlan } from '../types';
import * as gemini from '../services/geminiService';

export function useChefAI() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [view, setView] = useState<View>('home');
  const [preferences, setPreferences] = useState('');
  
  const [recipeInput, setRecipeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('chefai_theme') === 'dark';
  });

  // Kitchen Genie States
  const [genieInput, setGenieInput] = useState('');
  const [genieIdeas, setGenieIdeas] = useState<GenieIdea[]>([]);
  const [genieLoading, setGenieLoading] = useState(false);

  // Orchestrator States
  const [orchestrationPlan, setOrchestrationPlan] = useState<OrchestrationPlan | null>(null);
  const [orchestrationLoading, setOrchestrationLoading] = useState(false);

  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [scalingFactor, setScalingFactor] = useState(1);
  const [refining, setRefining] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [refineError, setRefineError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [shoppingCart, setShoppingCart] = useState<ShoppingListItem[]>(() => {
    try {
      const saved = localStorage.getItem('chefai_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Cart restoration failed", e);
      return [];
    }
  });

  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('chefai_checked');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.error("Checked ingredients restoration failed", e);
      return new Set();
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chefai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chefai_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('chefai_cart', JSON.stringify(shoppingCart));
  }, [shoppingCart]);

  useEffect(() => {
    localStorage.setItem('chefai_checked', JSON.stringify(Array.from(checkedIngredients)));
  }, [checkedIngredients]);

  useEffect(() => {
    const initAuth = async () => {
      const initialToken = (window as any).__initial_auth_token;
      if (initialToken) {
        try {
          await signInWithCustomToken(auth, initialToken);
        } catch (e) {
          await signInAnonymously(auth);
        }
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const prefsUnsub = onSnapshot(
      doc(db, 'artifacts', APP_ID, 'users', user.uid, 'data', 'preferences'),
      (docSnap) => {
        if (docSnap.exists()) {
          setPreferences(docSnap.data().text || '');
        }
      }
    );

    const recipesUnsub = onSnapshot(
      collection(db, 'artifacts', APP_ID, 'public', 'data', 'recipes'),
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setSavedRecipes(docs);
      }
    );

    return () => {
      prefsUnsub();
      recipesUnsub();
    };
  }, [user]);

  const savePreferences = async () => {
    if (!user) return;
    try {
      await setDoc(
        doc(db, 'artifacts', APP_ID, 'users', user.uid, 'data', 'preferences'),
        { text: preferences }
      );
    } catch (e) {
      console.error("Error saving prefs:", e);
    }
  };

  const processRecipeAction = async (input?: string | any) => {
    // Fix: input might be a React MouseEvent if passed directly to onClick
    const finalInput = (typeof input === 'string' ? input : recipeInput) || '';
    if (!finalInput.trim()) return;
    
    setLoading(true);
    setError('');
    setActiveRecipe(null);
    setScalingFactor(1);
    
    try {
      const result = await gemini.processRecipe(finalInput, preferences);
      setActiveRecipe({ 
        ...result, 
        sourceUrl: '', 
        coverImage: null,
        ingredients: result.ingredients || [],
        instructions: result.instructions || [],
        extractedTips: result.extractedTips || [],
        aiSuggestions: result.aiSuggestions || []
      } as Recipe);
      setIsEditing(true);
    } catch (err) {
      setError('AI extraction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateGenieIdeasAction = async () => {
    if (!genieInput.trim()) return;
    setGenieLoading(true);
    setError('');
    try {
      const ideas = await gemini.generateGenieIdeas(genieInput, preferences);
      setGenieIdeas(ideas);
    } catch (err) {
      setError('Genie failed to conjure ideas. Try again.');
    } finally {
      setGenieLoading(false);
    }
  };

  const selectGenieIdea = async (idea: GenieIdea) => {
    const prompt = `Idea: ${idea.title} (${idea.summary}). Ingredients I have: ${genieInput}`;
    await processRecipeAction(prompt);
  };

  const generateOrchestrationAction = async () => {
    if (shoppingCart.length === 0) return;
    setOrchestrationLoading(true);
    setError('');
    try {
      const recipes = shoppingCart.map(item => item.originalRecipe).filter(Boolean) as Recipe[];
      if (recipes.length === 0) {
          setError("Limited recipe metadata for orchestration. Reload recipes to cart.");
          return;
      }
      const plan = await gemini.generateOrchestrationPlan(recipes);
      setOrchestrationPlan(plan);
    } catch (err) {
      setError("Failed to orchestrate workspace.");
    } finally {
      setOrchestrationLoading(false);
    }
  };

  const handleRefineAction = async () => {
    if (!refinePrompt.trim() || !activeRecipe) return;
    setRefining(true);
    setRefineError('');
    
    try {
      const suggestions = await gemini.refineRecipe(activeRecipe, refinePrompt);
      setActiveRecipe(prev => prev ? ({
        ...prev,
        aiSuggestions: suggestions,
        lastRefinement: refinePrompt
      }) : null);
      setRefinePrompt('');
    } catch (err) {
      setRefineError('Failed to refine.');
    } finally {
      setRefining(false);
    }
  };

  const handleSaveRecipeAction = async () => {
    if (!user || !activeRecipe) return;
    setSaving(true);
    setSaveError('');
    try {
      const dataToSave = {
        ...activeRecipe,
        authorId: user.uid,
        createdAt: Timestamp.now()
      };
      
      await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'recipes'), dataToSave);
      setActiveRecipe(null);
      setIsEditing(false);
      setView('cookbook');
    } catch (e: any) {
      setSaveError(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRecipeAction = async () => {
    if (!user || !activeRecipe?.id) return;
    setSaving(true);
    setSaveError('');
    try {
      const dataToUpdate = { ...activeRecipe };
      const docId = dataToUpdate.id!;
      delete dataToUpdate.id;

      await updateDoc(
        doc(db, 'artifacts', APP_ID, 'public', 'data', 'recipes', docId),
        dataToUpdate
      );
      setIsEditing(false);
    } catch (e: any) {
      setSaveError(`Update Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecipeAction = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!window.confirm("Delete this recipe?")) return;
    deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'recipes', id)).catch(console.error);
  }, [user]);

  const addToCart = useCallback((recipe: Recipe, factor: number) => {
    setShoppingCart(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        recipeId: recipe.id,
        title: recipe.title,
        ingredients: recipe.ingredients,
        scalingFactor: factor,
        originalRecipe: recipe
      }
    ]);
    setActiveRecipe(null);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setShoppingCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateCartItemFactor = useCallback((id: string, newFactor: number) => {
    if (newFactor <= 0) return;
    setShoppingCart(prev => prev.map(item => 
      item.id === id ? { ...item, scalingFactor: newFactor } : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setShoppingCart([]);
    setCheckedIngredients(new Set());
    setOrchestrationPlan(null);
  }, []);

  const consolidatedList = useMemo(() => {
    const list: { [key: string]: Ingredient } = {};
    shoppingCart.forEach(item => {
      item.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
        const scaledQty = (Number(ing.quantity) || 0) * (Number(item.scalingFactor) || 1);
        if (list[key]) {
          list[key].quantity += scaledQty;
        } else {
          list[key] = { ...ing, quantity: scaledQty };
        }
      });
    });

    return Object.values(list).sort((a, b) => {
      const keyA = `${a.name.toLowerCase()}|${a.unit.toLowerCase()}`;
      const keyB = `${b.name.toLowerCase()}|${b.unit.toLowerCase()}`;
      const checkedA = checkedIngredients.has(keyA);
      const checkedB = checkedIngredients.has(keyB);

      if (checkedA === checkedB) {
        return a.name.localeCompare(b.name);
      }
      return checkedA ? 1 : -1;
    });
  }, [shoppingCart, checkedIngredients]);

  const { toBuyCount, doneCount } = useMemo(() => {
    let toBuy = 0;
    let done = 0;
    consolidatedList.forEach(ing => {
      const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
      if (checkedIngredients.has(key)) {
        done++;
      } else {
        toBuy++;
      }
    });
    return { toBuyCount: toBuy, doneCount: done };
  }, [consolidatedList, checkedIngredients]);

  const toggleIngredientCheck = useCallback((key: string) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const filteredRecipes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return savedRecipes.filter(r => {
      const titleMatch = r.title?.toLowerCase().includes(term);
      const ingredientMatch = r.ingredients?.some(ing => ing.name.toLowerCase().includes(term));
      return titleMatch || ingredientMatch;
    });
  }, [savedRecipes, searchTerm]);

  return {
    user,
    view,
    setView,
    preferences,
    setPreferences,
    recipeInput,
    setRecipeInput,
    genieInput,
    setGenieInput,
    genieIdeas,
    genieLoading,
    generateGenieIdeasAction,
    selectGenieIdea,
    orchestrationPlan,
    orchestrationLoading,
    generateOrchestrationAction,
    setOrchestrationPlan,
    loading,
    error,
    activeRecipe,
    setActiveRecipe,
    isEditing,
    setIsEditing,
    scalingFactor,
    setScalingFactor,
    refining,
    refinePrompt,
    setRefinePrompt,
    refineError,
    saving,
    saveError,
    savedRecipes,
    searchTerm,
    setSearchTerm,
    shoppingCart,
    setShoppingCart,
    checkedIngredients,
    setCheckedIngredients,
    savePreferences,
    processRecipeAction,
    handleRefineAction,
    handleSaveRecipeAction,
    handleUpdateRecipeAction,
    handleDeleteRecipeAction,
    addToCart,
    removeFromCart,
    updateCartItemFactor,
    clearCart,
    consolidatedList,
    toBuyCount,
    doneCount,
    toggleIngredientCheck,
    filteredRecipes,
    darkMode,
    setDarkMode
  };
}
