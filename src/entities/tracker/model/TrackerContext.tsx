
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, limit, doc, setDoc, addDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { trackerDb, CHEF_APP_ID } from '../../../firebase';
import { Product, Purchase } from './types';
import { useAuthContext } from '../../../context/AuthContext';
import { useUIContext } from '../../../context/UIContext';

/**
 * @interface TrackerContextType
 * @description Defines the shape of the Tracker Context, which manages grocery purchase history and product price tracking.
 */
interface TrackerContextType {
  /** Aggregated list of unique products derived from purchase history. */
  products: Product[];
  /** List of individual purchase records. */
  purchases: Purchase[];
  /** Indicates if data is currently being fetched from Firestore. */
  loading: boolean;
  /** Error message if a fetch fails. */
  error: string | null;
  /** Whether more purchase records are available for pagination. */
  hasMore: boolean;
  /** Increments the pagination limit to load more records. */
  loadMorePurchases: () => void;
  /** Saves a single purchase record (create or update). */
  savePurchase: (data: Partial<Purchase>, isEdit: boolean, id?: string) => Promise<boolean>;
  /** Saves multiple purchase records in a single Firestore batch. */
  savePurchasesBatch: (items: Partial<Purchase>[]) => Promise<boolean>;
  /** Deletes a specific purchase record by ID. */
  deletePurchase: (id: string) => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

/**
 * @component TrackerProvider
 * @description Manages the state and persistence of grocery purchase history.
 * Subscribes to Firestore data based on the current household (Home) and provides pagination support.
 * Only activates (starts fetching) when the user navigates to a relevant view to save resources.
 */
export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentHomeId, trackerUser } = useAuthContext();
  const { view } = useUIContext();
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActivated, setHasActivated] = useState(false);
  
  // Pagination State
  const [limitCount, setLimitCount] = useState(50);
  const [hasMore, setHasMore] = useState(true);

  // Lazy Activation: Only start fetching if user visits Tracker or Plan views
  useEffect(() => {
    if (!hasActivated && (view === 'tracker' || view === 'plan')) {
      setHasActivated(true);
    }
  }, [view, hasActivated]);

  // Load Purchases
  useEffect(() => {
    // 1. If no home, reset.
    // 2. If not activated yet, do nothing (keep initial empty state)
    if (!currentHomeId || !hasActivated) {
        if (!currentHomeId) setPurchases([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    setError(null);

    const purcRef = collection(trackerDb, 'artifacts', CHEF_APP_ID, 'homes', currentHomeId, 'purchases');
    
    // Fetch with dynamic limit
    const unsub = onSnapshot(
      query(purcRef, orderBy('date', 'desc'), limit(limitCount)), 
      { includeMetadataChanges: true }, 
      (s) => {
        const data = s.docs.map(d => {
          const raw = d.data();
          let dateObj = new Date();
          // Defensive date parsing
          if (raw.date?.toDate) dateObj = raw.date.toDate();
          else if (raw.date) dateObj = new Date(raw.date);

          return { 
              id: d.id, 
              ...raw,
              date: dateObj
          } as Purchase;
        });
        
        setPurchases(data);
        
        // If we got fewer than requested, we're at the end
        // Note: checking >= limitCount accounts for exact matches where more might exist, 
        // but typically simple heuristic is fine for infinite scroll.
        if (data.length < limitCount) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setLoading(false);
      },
      (err) => {
        console.error("Tracker Snapshot Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [currentHomeId, hasActivated, limitCount]);

  const loadMorePurchases = useCallback(() => {
    if (hasMore && !loading) {
      setLimitCount(prev => prev + 50);
    }
  }, [hasMore, loading]);

  // Derived Products (Note: This will only reflect products in the loaded purchases)
  const products = useMemo(() => {
    const productMap: Record<string, Product> = {};
    purchases.forEach(p => {
      const nameKey = p.productName?.trim()?.toLowerCase() || 'unknown';
      if (!productMap[nameKey]) {
        productMap[nameKey] = {
          id: nameKey,
          name: p.productName || 'Unknown Product',
          genericName: p.genericName,
          category: p.category || 'General',
          defaultUnit: p.unit
        };
      }
    });
    return Object.values(productMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [purchases]);

  const savePurchase = useCallback(async (data: Partial<Purchase>, isEdit: boolean, id?: string) => {
    if (!currentHomeId || !trackerUser) return false;
    const ref = collection(trackerDb, 'artifacts', CHEF_APP_ID, 'homes', currentHomeId, 'purchases');
    try {
      const { id: _, ...cleanData } = data;
      const payload = { ...cleanData, userId: trackerUser.uid };
      if (isEdit && id) {
        await setDoc(doc(ref, id), payload, { merge: true });
      } else {
        await addDoc(ref, { ...payload, timestamp: new Date() });
      }
      return true;
    } catch (e) { console.error("Tracker Save Error:", e); return false; }
  }, [currentHomeId, trackerUser]);

  const savePurchasesBatch = useCallback(async (items: Partial<Purchase>[]) => {
    if (!currentHomeId || !trackerUser || items.length === 0) return false;
    const batch = writeBatch(trackerDb);
    const ref = collection(trackerDb, 'artifacts', CHEF_APP_ID, 'homes', currentHomeId, 'purchases');
    try {
      items.forEach(item => {
        const { id: _, ...cleanItem } = item;
        batch.set(doc(ref), { ...cleanItem, timestamp: new Date(), userId: trackerUser.uid });
      });
      await batch.commit();
      return true;
    } catch (e) { console.error("Batch error", e); return false; }
  }, [currentHomeId, trackerUser]);

  const deletePurchase = useCallback((id: string) => {
      if (!currentHomeId) return Promise.reject("No Home");
      return deleteDoc(doc(trackerDb, 'artifacts', CHEF_APP_ID, 'homes', currentHomeId, 'purchases', id));
  }, [currentHomeId]);

  const contextValue = useMemo(() => ({
    products, purchases, loading, error, hasMore,
    loadMorePurchases, savePurchase, savePurchasesBatch, deletePurchase
  }), [products, purchases, loading, error, hasMore, loadMorePurchases, savePurchase, savePurchasesBatch, deletePurchase]);

  return (
    <TrackerContext.Provider value={contextValue}>
      {children}
    </TrackerContext.Provider>
  );
};

/**
 * Hook to consume the TrackerContext.
 * @returns {TrackerContextType} The tracker context value.
 * @throws {Error} If used outside of a TrackerProvider.
 */
export const useTrackerContext = () => {
  const context = useContext(TrackerContext);
  if (!context) throw new Error('useTrackerContext must be used within TrackerProvider');
  return context;
};
