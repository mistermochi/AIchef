
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, limit, doc, setDoc, addDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { trackerDb, CHEF_APP_ID } from '../firebase';
import { Product, Purchase } from '../types';
import { useAuthContext } from './AuthContext';
import { useUIContext } from './UIContext';

interface TrackerContextType {
  products: Product[];
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMorePurchases: () => void;
  savePurchase: (data: any, isEdit: boolean, id?: string) => Promise<boolean>;
  savePurchasesBatch: (items: any[]) => Promise<boolean>;
  deletePurchase: (id: string) => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

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

  const loadMorePurchases = () => {
    if (hasMore && !loading) {
      setLimitCount(prev => prev + 50);
    }
  };

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

  const savePurchase = async (data: any, isEdit: boolean, id?: string) => {
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
  };

  const savePurchasesBatch = async (items: any[]) => {
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
  };

  const deletePurchase = (id: string) => {
      if (!currentHomeId) return Promise.reject("No Home");
      return deleteDoc(doc(trackerDb, 'artifacts', CHEF_APP_ID, 'homes', currentHomeId, 'purchases', id));
  };

  return (
    <TrackerContext.Provider value={{ products, purchases, loading, error, hasMore, loadMorePurchases, savePurchase, savePurchasesBatch, deletePurchase }}>
      {children}
    </TrackerContext.Provider>
  );
};

export const useTrackerContext = () => {
  const context = useContext(TrackerContext);
  if (!context) throw new Error('useTrackerContext must be used within TrackerProvider');
  return context;
};
