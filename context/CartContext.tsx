
import React, { createContext, useContext, useState, useMemo } from 'react';
import { ShoppingListItem, OrchestrationPlan, Ingredient } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import * as gemini from '../services/geminiService';
import { useAuthContext } from './AuthContext';

interface CartContextType {
  cart: ShoppingListItem[];
  addToCart: (recipe: any, factor: number) => void;
  removeFromCart: (id: string) => void;
  updateCartItemFactor: (id: string, f: number) => void;
  clearCart: () => void;
  
  // Checklist State
  checkedIngredients: Set<string>;
  toggleIngredientCheck: (key: string) => void;
  consolidatedList: Ingredient[];
  toBuyCount: number;
  doneCount: number;

  // Orchestration
  orchestrationPlan: OrchestrationPlan | null;
  setOrchestrationPlan: (plan: OrchestrationPlan | null) => void;
  orchestrationLoading: boolean;
  generateOrchestrationAction: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAIEnabled } = useAuthContext();
  const [cart, setCart] = useLocalStorage<ShoppingListItem[]>('chefai_cart', []);
  const [checked, setChecked] = useLocalStorage<string[]>('chefai_checked', []);
  const [orchestrationPlan, setOrchestrationPlan] = useState<OrchestrationPlan | null>(null);
  const [orchestrationLoading, setOrchestrationLoading] = useState(false);

  // --- ACTIONS ---
  const addToCart = (recipe: any, factor: number) => {
    setCart(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 9),
      recipeId: recipe.id,
      title: recipe.title,
      ingredients: recipe.ingredients,
      scalingFactor: factor,
      originalRecipe: recipe
    }]);
  };

  const removeFromCart = (id: string) => setCart(p => p.filter(i => i.id !== id));
  
  const updateCartItemFactor = (id: string, f: number) => {
    if (f <= 0) return;
    setCart(p => p.map(i => i.id === id ? { ...i, scalingFactor: f } : i));
  };

  const clearCart = () => {
    setCart([]);
    setOrchestrationPlan(null);
  };

  const toggleIngredientCheck = (key: string) => {
    setChecked(prev => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key); else s.add(key);
      return Array.from(s);
    });
  };

  const consolidatedList = useMemo(() => {
    const list: Record<string, Ingredient> = {};
    cart.forEach(item => {
      item.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
        const qty = (Number(ing.quantity) || 0) * (Number(item.scalingFactor) || 1);
        if (list[key]) list[key].quantity += qty;
        else list[key] = { ...ing, quantity: qty };
      });
    });
    const s = new Set(checked);
    return Object.values(list).sort((a, b) => {
      const ka = `${a.name.toLowerCase()}|${a.unit.toLowerCase()}`;
      const kb = `${b.name.toLowerCase()}|${b.unit.toLowerCase()}`;
      if (s.has(ka) === s.has(kb)) return a.name.localeCompare(b.name);
      return s.has(ka) ? 1 : -1;
    });
  }, [cart, checked]);

  const stats = useMemo(() => {
    const s = new Set(checked);
    let done = 0;
    consolidatedList.forEach(i => { if (s.has(`${i.name.toLowerCase()}|${i.unit.toLowerCase()}`)) done++; });
    return { doneCount: done, toBuyCount: consolidatedList.length - done };
  }, [consolidatedList, checked]);

  const generateOrchestrationAction = async () => {
    const recipes = cart.map(i => i.originalRecipe).filter(Boolean) as any[];
    if (recipes.length === 0 || !isAIEnabled) return;
    setOrchestrationLoading(true);
    try {
      const plan = await gemini.generateOrchestrationPlan(recipes);
      setOrchestrationPlan(plan);
    } catch (e: any) { console.error(e); } finally { setOrchestrationLoading(false); }
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateCartItemFactor, clearCart,
      checkedIngredients: new Set(checked), toggleIngredientCheck,
      consolidatedList, toBuyCount: stats.toBuyCount, doneCount: stats.doneCount,
      orchestrationPlan, setOrchestrationPlan, orchestrationLoading, generateOrchestrationAction
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
