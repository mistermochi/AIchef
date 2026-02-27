
import { useState, useCallback } from 'react';
import { useTrackerContext } from '../../context/TrackerContext';
import { useAuthContext } from '../../context/AuthContext';
import { useRecipeContext } from '../../context/RecipeContext';
import { searchDeals } from '../../shared/api/ai';
import { Recipe, Purchase } from '../../types';
import { toDate } from '../../utils/tracker';

/**
 * @hook useTrackerController
 * @description Controller for the Price Tracker view.
 * Manages purchase history, deal searching, and product price analysis.
 */
export function useTrackerController() {
  const {
    purchases,
    products,
    loading: repoLoading,
    addPurchase,
    deletePurchase,
    getCheapestStore
  } = useTrackerContext();

  const { recipes } = useRecipeContext();
  const { isAIEnabled, reportError } = useAuthContext();

  const [isSearching, setIsSearching] = useState(false);
  const [deals, setDeals] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);

  /**
   * Searches for online deals and prices for a specific product.
   * Uses Gemini AI with Google Search grounding.
   */
  const handleSearchDeals = useCallback(async (productName: string) => {
    if (!isAIEnabled) return;

    setIsSearching(true);
    setDeals([]);
    try {
      const res = await searchDeals(productName);
      setDeals(res.items);
      setSources(res.sources);
    } catch (err: any) {
      reportError('unhealthy', err.message);
    } finally {
      setIsSearching(false);
    }
  }, [isAIEnabled, reportError]);

  /**
   * Calculates the estimated cost of a recipe based on tracked purchase data.
   */
  const getRecipeCostEstimate = useCallback((recipe: Recipe) => {
    let total = 0;
    let missingCount = 0;

    recipe.ingredients.forEach(ing => {
      const genericName = ing.name.toLowerCase(); // simplified
      const product = products.find(p =>
        p.name.toLowerCase() === genericName ||
        p.genericName?.toLowerCase() === genericName
      );

      if (product) {
         const latestPurchase = purchases
           .filter(p => p.productName === product.name)
           .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())[0];

         if (latestPurchase) {
            total += (latestPurchase.normalizedPrice * ing.quantity);
         } else {
            missingCount++;
         }
      } else {
        missingCount++;
      }
    });

    return {
      total,
      isPartial: missingCount > 0,
      missingCount
    };
  }, [purchases, products]);

  return {
    purchases,
    products,
    loading: repoLoading,
    isSearching,
    deals,
    sources,
    addPurchase,
    deletePurchase,
    searchDeals: handleSearchDeals,
    getRecipeCost: getRecipeCostEstimate,
    getCheapestStore
  };
}
