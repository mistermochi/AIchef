
import { useState, useCallback } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { trackerDb, CHEF_APP_ID } from '../firebase';
import { useAuthContext } from '../context/AuthContext';
import { batchClassifyProducts } from '../shared/api/ai';
import { calcNormalizedPrice } from '../utils/tracker';

export function useDataMigration() {
  const { currentHomeId, isAIEnabled } = useAuthContext();
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');

  const runMigration = useCallback(async () => {
    if (!currentHomeId || migrating) return;
    
    setMigrating(true);
    setStatus('Fetching data...');

    try {
      // 1. Fetch all purchases
      const purchasesRef = collection(trackerDb, 'artifacts', CHEF_APP_ID, 'homes', currentHomeId, 'purchases');
      const snap = await getDocs(purchasesRef);
      const docs = snap.docs;
      setTotal(docs.length);
      setStatus(`Processing ${docs.length} items...`);

      // 2. Classify products in batches (AI logic)
      const uniqueNames = Array.from(new Set(docs.map(d => d.data().productName)));
      const nameMap: Record<string, string> = {};
      
      if (isAIEnabled) {
         setStatus(`Classifying ${uniqueNames.length} products...`);
         // Process in chunks of 20
         for (let i = 0; i < uniqueNames.length; i += 20) {
            const chunk = uniqueNames.slice(i, i + 20);
            const results = await batchClassifyProducts(chunk);
            results.forEach((r: any) => {
               nameMap[r.original_name] = r.generic_name;
            });
         }
      }

      // 3. Apply updates in Firestore batches
      setStatus('Applying updates...');
      let count = 0;
      const batchSize = 100;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = writeBatch(trackerDb);
        const chunk = docs.slice(i, i + batchSize);
        
        chunk.forEach(d => {
          const data = d.data();
          const genericName = nameMap[data.productName] || data.genericName || '';
          
          // Re-calculate normalization if needed
          const normalizedPrice = calcNormalizedPrice(data.price, data.quantity, data.unit);
          
          batch.update(d.ref, {
            genericName,
            normalizedPrice,
            migrated: true,
            updatedAt: new Date()
          });
          count++;
        });

        await batch.commit();
        setProgress(count);
      }

      setStatus('Migration complete!');
      setTimeout(() => setStatus(''), 3000);
    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e.message}`);
    } finally {
      setMigrating(false);
    }
  }, [currentHomeId, migrating, isAIEnabled]);

  return { runMigration, migrating, progress, total, status };
}
