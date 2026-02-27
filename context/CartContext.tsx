
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { ShoppingListItem, OrchestrationPlan, Ingredient, Recipe } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import * as gemini from '../shared/api/ai';
import { useAuthContext } from './AuthContext';
import { consolidateShoppingList } from '../utils/shopping';

interface CartContextType {
  cart: ShoppingListItem[];
  addToCart: (recipe: Recipe, scalingFactor: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateScaling: (id: string, factor: number) => void;

  // Consolidate
  consolidatedIngredients: Ingredient[];
  
  // Orchestration
  orchestrationPlan: OrchestrationPlan | null;
  isOrchestrating: boolean;
  orchestrationError: string | null;
  generatePlan: () => Promise<void>;
  dismissPlan: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useLocalStorage<ShoppingListItem[]>('chefai_cart', []);
  const [orchestrationPlan, setOrchestrationPlan] = useState<OrchestrationPlan | null>(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationError, setOrchestrationError] = useState<string | null>(null);
  const { isAIEnabled, reportError } = useAuthContext();

  const addToCart = (recipe: Recipe, scalingFactor: number) => {
    const newItem: ShoppingListItem = {
      id: `${recipe.id || 'manual'}-${Date.now()}`,
      recipeId: recipe.id,
      title: recipe.title,
      ingredients: recipe.ingredients,
      scalingFactor,
      originalRecipe: recipe
    };
    setCart([...cart, newItem]);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
    // Clear plan if cart changes? Optional.
  };

  const clearCart = () => setCart([]);

  const updateScaling = (id: string, factor: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, scalingFactor: factor } : item));
  };

  const consolidatedIngredients = useMemo(() => {
    return consolidateShoppingList(cart);
  }, [cart]);

  const generatePlan = async () => {
    if (!isAIEnabled || cart.length === 0) return;

    setIsOrchestrating(true);
    setOrchestrationError(null);

    try {
      const recipes = cart.map(item => item.originalRecipe).filter(Boolean) as Recipe[];
      if (recipes.length === 0) throw new Error("No structured recipes found in cart.");

      const plan = await gemini.generateOrchestrationPlan(recipes);
      setOrchestrationPlan(plan);
    } catch (err: any) {
      setOrchestrationError(err.message || "Failed to generate workflow.");
      reportError('unhealthy', err.message);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const dismissPlan = () => setOrchestrationPlan(null);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart, updateScaling,
      consolidatedIngredients,
      orchestrationPlan, isOrchestrating, orchestrationError, generatePlan, dismissPlan
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartContext must be used within CartProvider');
  return context;
};
