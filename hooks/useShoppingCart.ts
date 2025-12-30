
import { useCallback, useMemo } from 'react';
import { ShoppingListItem, Recipe, Ingredient } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useShoppingCart() {
  const [cart, setCart] = useLocalStorage<ShoppingListItem[]>('chefai_cart', []);
  const [checked, setChecked] = useLocalStorage<string[]>('chefai_checked', []);

  const addToCart = useCallback((recipe: Recipe, factor: number) => {
    setCart(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 9),
      recipeId: recipe.id,
      title: recipe.title,
      ingredients: recipe.ingredients,
      scalingFactor: factor,
      originalRecipe: recipe
    }]);
  }, [setCart]);

  const removeFromCart = useCallback((id: string) => setCart(p => p.filter(i => i.id !== id)), [setCart]);
  
  const updateFactor = useCallback((id: string, f: number) => {
    if (f <= 0) return;
    setCart(p => p.map(i => i.id === id ? { ...i, scalingFactor: f } : i));
  }, [setCart]);

  const toggleCheck = useCallback((key: string) => {
    setChecked(prev => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key); else s.add(key);
      return Array.from(s);
    });
  }, [setChecked]);

  const consolidated = useMemo(() => {
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
    consolidated.forEach(i => { if (s.has(`${i.name.toLowerCase()}|${i.unit.toLowerCase()}`)) done++; });
    return { doneCount: done, totalCount: consolidated.length };
  }, [consolidated, checked]);

  return { cart, setCart, checked: new Set(checked), toggleCheck, addToCart, removeFromCart, updateFactor, consolidated, ...stats };
}
