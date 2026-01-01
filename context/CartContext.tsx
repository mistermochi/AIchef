
import React, { createContext, useContext, useState, useMemo } from 'react';
import { ShoppingListItem, OrchestrationPlan, Ingredient } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import * as gemini from '../services/geminiService';
import { useAuthContext } from './AuthContext';
import { MULTIPLIERS, UNIT_TYPES } from '../utils/tracker';

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
        const rawName = ing.name.toLowerCase().trim();
        const rawUnit = ing.unit.toLowerCase().trim();
        const qty = (Number(ing.quantity) || 0) * (Number(item.scalingFactor) || 1);

        // Unit-Aware Normalization
        let groupingKey = `${rawName}|${rawUnit}`;
        let normalizedQty = qty;
        let finalUnit = ing.unit;

        const type = UNIT_TYPES[rawUnit];
        const multiplier = MULTIPLIERS[rawUnit];

        // If we know the type and multiplier, normalize to base unit for grouping
        if (type && multiplier) {
           const baseUnit = type === 'mass' ? 'g' : (type === 'volume' ? 'ml' : 'pcs');
           // Key is now name + TYPE (e.g. "sugar|mass") so "kg" and "g" merge
           groupingKey = `${rawName}|${type}`;
           normalizedQty = qty * multiplier;
           finalUnit = baseUnit; 
        }

        if (list[groupingKey]) {
          list[groupingKey].quantity += normalizedQty;
        } else {
          list[groupingKey] = { 
             name: ing.name, // Keep original casing of first item
             quantity: normalizedQty, 
             unit: finalUnit 
          };
        }
      });
    });

    // Formatting Pass: Convert back to readable units if large
    const finalItems = Object.values(list).map(item => {
        // Simple heuristic: If > 1000g, show as kg. If > 1000ml, show as l.
        if (item.unit === 'g' && item.quantity >= 1000) {
            return { ...item, quantity: item.quantity / 1000, unit: 'kg' };
        }
        if (item.unit === 'ml' && item.quantity >= 1000) {
            return { ...item, quantity: item.quantity / 1000, unit: 'l' };
        }
        return item;
    });

    const s = new Set(checked);
    return finalItems.sort((a, b) => {
      // Re-generate key for check status because we normalized units
      // We need a stable key for checklist state.
      // This is a bit tricky: previous keys were "name|unit". Now units might change (g -> kg).
      // We'll effectively rely on the *displayed* unit for the checklist key in the View.
      // But for sorting here, we approximate.
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [cart, checked]);

  const stats = useMemo(() => {
    const s = new Set(checked);
    let done = 0;
    consolidatedList.forEach(i => { 
        const key = `${i.name.toLowerCase()}|${i.unit.toLowerCase()}`;
        if (s.has(key)) done++; 
    });
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
