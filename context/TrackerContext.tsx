
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, limit, doc, setDoc, addDoc, writeBatch, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { trackerDb, TRACKER_APP_ID } from '../firebase';
import { Product, Purchase } from '../types';
import { useAuthContext } from './AuthContext';

interface TrackerContextType {
  products: Product[];
  purchases: Purchase[];
  loading: boolean;
  savePurchase: (data: any, isEdit: boolean, id?: string) => Promise<boolean>;
  savePurchasesBatch: (items: any[]) => Promise<boolean>;
  deletePurchase: (id: string) => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { trackerUser } = useAuthContext();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Purchases
  useEffect(() => {
    if (!trackerUser) return;
    const purcRef = collection(trackerDb, 'artifacts', TRACKER_APP_ID, 'public', 'data', 'purchases');
    const unsub = onSnapshot(query(purcRef, orderBy('date', 'desc'), limit(500)), (s) => {
      setPurchases(s.docs.map(d => ({ id: d.id, ...d.data() } as Purchase)));
      setLoading(false);
    });
    return () => unsub();
  }, [trackerUser]);

  // Derived Products
  const products = useMemo(() => {
    const productMap: Record<string, Product> = {};
    purchases.forEach(p => {
      // Use normalized name as the key/ID since we no longer have a dedicated productId
      const nameKey = p.productName?.trim()?.toLowerCase() || 'unknown';
      if (!productMap[nameKey]) {
        productMap[nameKey] = {
          id: nameKey, // The ID is now strictly the normalized name
          name: p.productName || 'Unknown Product',
          category: p.category || 'General',
          defaultUnit: p.unit
        };
      }
    });
    return Object.values(productMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [purchases]);

  const savePurchase = async (data: any, isEdit: boolean, id?: string) => {
    if (!trackerUser) return false;
    const ref = collection(trackerDb, 'artifacts', TRACKER_APP_ID, 'public', 'data', 'purchases');
    try {
      const { id: _, ...cleanData } = data;
      // We no longer save productId. Grouping is done dynamically by productName.
      const payload = { ...cleanData, userId: trackerUser.uid };
      if (isEdit && id) {
        await setDoc(doc(ref, id), payload, { merge: true });
      } else {
        await addDoc(ref, { ...payload, timestamp: serverTimestamp() });
      }
      return true;
    } catch (e) { console.error("Tracker Save Error:", e); return false; }
  };

  const savePurchasesBatch = async (items: any[]) => {
    if (!trackerUser || items.length === 0) return false;
    const batch = writeBatch(trackerDb);
    const ref = collection(trackerDb, 'artifacts', TRACKER_APP_ID, 'public', 'data', 'purchases');
    try {
      items.forEach(item => {
        const { id: _, ...cleanItem } = item;
        batch.set(doc(ref), { ...cleanItem, timestamp: serverTimestamp(), userId: trackerUser.uid });
      });
      await batch.commit();
      return true;
    } catch (e) { console.error("Batch error", e); return false; }
  };

  const deletePurchase = (id: string) => deleteDoc(doc(trackerDb, 'artifacts', TRACKER_APP_ID, 'public', 'data', 'purchases', id));

  return (
    <TrackerContext.Provider value={{ products, purchases, loading, savePurchase, savePurchasesBatch, deletePurchase }}>
      {children}
    </TrackerContext.Provider>
  );
};

export const useTrackerContext = () => {
  const context = useContext(TrackerContext);
  if (!context) throw new Error('useTrackerContext must be used within TrackerProvider');
  return context;
};
