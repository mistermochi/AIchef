
import { useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, query, where, doc, writeBatch } from 'firebase/firestore';
import { chefDb, CHEF_APP_ID } from '../../../shared/api/firebase';
import { MealPlanEntry } from '../../../shared/model/types';

export function useMealPlanRepository(homeId: string | null) {
  const [loading, setLoading] = useState(false);

  const getCollectionRef = () => {
    if (!homeId) throw new Error("No active home session");
    return collection(chefDb, 'artifacts', CHEF_APP_ID, 'homes', homeId, 'meal_plans');
  };

  const subscribeToWeek = (start: string, end: string, callback: (data: MealPlanEntry[]) => void) => {
    if (!homeId) return () => {};
    setLoading(true);
    
    try {
      const ref = getCollectionRef();
      const q = query(ref, where('date', '>=', start), where('date', '<=', end));

      return onSnapshot(q, (s) => {
        const data = s.docs.map(d => ({ id: d.id, ...d.data() } as MealPlanEntry));
        callback(data);
        setLoading(false);
      });
    } catch (e) {
      console.error("Failed to subscribe to meal plans", e);
      setLoading(false);
      return () => {};
    }
  };

  const addEntry = async (entry: MealPlanEntry) => {
    if (!homeId) return;
    const ref = getCollectionRef();
    await addDoc(ref, entry);
  };

  const updateEntry = async (id: string, updates: Partial<MealPlanEntry>) => {
    if (!homeId) return;
    const ref = doc(chefDb, 'artifacts', CHEF_APP_ID, 'homes', homeId, 'meal_plans', id);
    await updateDoc(ref, updates);
  };

  const removeEntry = async (id: string) => {
    if (!homeId) return;
    const ref = doc(chefDb, 'artifacts', CHEF_APP_ID, 'homes', homeId, 'meal_plans', id);
    await deleteDoc(ref);
  };
  
  const batchAdd = async (entries: MealPlanEntry[]) => {
      if (!homeId) return;
      const batch = writeBatch(chefDb);
      const colRef = getCollectionRef();
      
      entries.forEach(e => {
          const docRef = doc(colRef);
          batch.set(docRef, e);
      });
      await batch.commit();
  };

  return { subscribeToWeek, addEntry, updateEntry, removeEntry, batchAdd, loading };
}
