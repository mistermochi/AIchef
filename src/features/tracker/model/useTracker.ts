
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTrackerContext } from '../../../entities/tracker/model/TrackerContext';
import { useAuthContext } from '../../../entities/user/model/AuthContext';
import { useRecipeContext } from '../../../entities/recipe/model/RecipeContext';
import { searchDeals } from '../../../shared/api/geminiService';
import { Recipe } from '../../../shared/model/types';
import { Purchase } from '../../../entities/tracker/model/types';
import { toDate } from '../../../shared/lib/date';

export type TrackerModal = 
  | { type: 'none' }
  | { type: 'log' }
  | { type: 'edit'; id: string }
  | { type: 'detail'; pid: string; productName: string };

/**
 * @hook useTracker
 * @description The main logic for the Tracker (Price Tracker) feature.
 * It manages the UI state (tabs, modals), handles file scanning for receipts,
 * interacts with the TrackerContext for data persistence, and uses Gemini AI for deal searching.
 *
 * Interactions:
 * - {@link useTrackerContext}: For fetching products and purchases, and performing CRUD operations.
 * - {@link useAuthContext}: To check if AI is enabled and report AI-related errors.
 * - {@link useRecipeContext}: For linking products to saved recipes and setting active recipes.
 * - {@link searchDeals}: Service call to fetch online price insights.
 *
 * @returns {Object} { state, actions, refs, computed }
 */
export function useTracker() {
  const { products, purchases, loading, error, savePurchase, savePurchasesBatch, deletePurchase, loadMorePurchases, hasMore } = useTrackerContext();
  const { isAIEnabled, reportError } = useAuthContext();
  const { savedRecipes, setActiveRecipe } = useRecipeContext();

  const [activeTab, setActiveTab] = useState<'history' | 'catalog'>('catalog');
  const [modal, setModal] = useState<TrackerModal>({ type: 'none' });

  // Scan Logic
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingScanFile, setPendingScanFile] = useState<File | undefined>(undefined);

  // Deal Search Logic
  const [dealResults, setDealResults] = useState<any[]>([]);
  const [dealSources, setDealSources] = useState<any[]>([]);
  const [searchingDeals, setSearchingDeals] = useState(false);
  const [dealError, setDealError] = useState('');

  // Form Logic
  const [triggerSubmit, setTriggerSubmit] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Effects
  useEffect(() => {
    setIsFormValid(false);
    setTriggerSubmit(0);
    if (modal.type !== 'detail') {
      setDealResults([]);
      setDealSources([]);
      setDealError('');
    }
    if (modal.type === 'none') {
        setPendingScanFile(undefined);
    }
  }, [modal.type]);

  // Actions
  const closeModal = () => setModal({ type: 'none' });

  const handleScanClick = () => {
    if (!isAIEnabled) return;
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAIEnabled) return;
    const file = e.target.files?.[0];
    if (file) {
        setPendingScanFile(file);
        if (modal.type !== 'log') setModal({ type: 'log' });
    }
  };

  const handleSave = async (data: Partial<Purchase> | Partial<Purchase>[]) => {
    if (isSaving || (modal.type !== 'log' && modal.type !== 'edit')) return;
    setIsSaving(true);
    let success = false;
    try {
      if (modal.type === 'edit') {
        success = await savePurchase(data as Partial<Purchase>, true, modal.id);
      } else {
        success = await savePurchasesBatch(Array.isArray(data) ? data : [data as Partial<Purchase>]);
      }
    } catch (e) { console.error(e); }
    setIsSaving(false);
    if (success) {
      if (modal.type === 'log') setActiveTab('history');
      closeModal();
    }
  };

  const handleDelete = async () => {
    if (modal.type !== 'edit' || !modal.id) return;
    setIsSaving(true);
    await deletePurchase(modal.id);
    setIsSaving(false);
    closeModal();
  };

  const fetchAIInsight = async (productName: string) => {
    if (!isAIEnabled) return;
    setSearchingDeals(true);
    setDealError('');
    try {
      const result = await searchDeals(productName);
      setDealResults(result.items || []);
      setDealSources(result.sources || []);
    } catch (e: any) { 
        setDealError(e.message || 'AI search failed');
        const msg = e.message.toLowerCase();
        if (msg.includes('auth') || msg.includes('key')) reportError('auth_error', e.message);
        else if (msg.includes('limit') || msg.includes('quota')) reportError('quota_error', e.message);
        else if (msg.includes('region')) reportError('region_restricted', e.message);
        else reportError('unhealthy', e.message);
    } finally { 
        setSearchingDeals(false); 
    }
  };

  const openRecipe = (recipe: Recipe) => {
    setActiveRecipe(recipe);
  };

  // Computed
  const editFormData = useMemo(() => modal.type === 'edit' ? purchases.find(x => x.id === modal.id) : undefined, [modal, purchases]);
  
  const detailInfo = useMemo(() => {
    if (modal.type !== 'detail') return null;
    
    // Normalize logic: The identifier is now the normalized product name
    const normalizedTargetName = modal.productName.trim().toLowerCase();

    // 1. Try to find a synthetic "product" object from the context
    let prod = products.find(x => x.name.trim().toLowerCase() === normalizedTargetName);
    
    // 2. Filter History: Robustly match ONLY by Name
    const history = purchases.filter(x => {
        const pName = x.productName?.trim()?.toLowerCase();
        return pName === normalizedTargetName;
    });

    // 3. Sort by Date Descending to ensure index 0 is truly the latest
    const sortedHistory = [...history].sort((a, b) => {
        const dateA = toDate(a.date).getTime();
        const dateB = toDate(b.date).getTime();
        return dateB - dateA;
    });

    // 4. Derive "Latest" from the sorted history, NOT the pid passed in modal state
    // The pid passed might be the "Best Price" item ID from the catalog view
    const lastPurchase = sortedHistory[0];

    // 5. Fallback if product list is stale
    if (!prod && lastPurchase) {
       prod = { 
           id: normalizedTargetName, // ID is just the name key
           name: lastPurchase.productName, 
           category: lastPurchase.category,
           genericName: lastPurchase.genericName
       };
    }

    // 6. Find Related Recipes using Golden Tag (Generic Name)
    const searchTag = (prod?.genericName || prod?.name || '').trim().toLowerCase();
    const relatedRecipes = searchTag ? savedRecipes.filter(r => 
       r.ingredients?.some(ing => ing.name.toLowerCase().includes(searchTag))
    ) : [];

    return { lastPurchase, prod, history: sortedHistory, relatedRecipes };
  }, [modal, purchases, products, savedRecipes]);

  return {
    state: {
      activeTab, modal, loading, error, products, purchases,
      pendingScanFile, isAIEnabled, hasMore,
      dealResults, dealSources, searchingDeals, dealError,
      isSaving, isFormValid, triggerSubmit
    },
    actions: {
      setActiveTab, setModal, closeModal,
      handleScanClick, handleFileSelect,
      handleSave, handleDelete, fetchAIInsight,
      openRecipe, loadMorePurchases,
      setTriggerSubmit: () => setTriggerSubmit(p => p + 1),
      setIsFormValid
    },
    refs: { fileInputRef },
    computed: { editFormData, detailInfo }
  };
}
