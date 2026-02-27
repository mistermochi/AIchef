
import { useState } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { trackerDb, CHEF_APP_ID } from '../../../shared/api/firebase';
import { useAuthContext } from '../../../entities/user/model/AuthContext';
import { getAIService } from '../../../shared/api/aiServiceFactory';
import { calcNormalizedPrice } from '../../../entities/tracker/model/trackerModel';

export function useDataMigration() {
  const { trackerUser, isAIEnabled, currentHomeId, profile } = useAuthContext();
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>('');

  // AI Cleanup Migration (Fixes legacy price data & re-classifies names)
  const runMigration = async () => {
    if (!trackerUser || !isAIEnabled || !currentHomeId) return;
    
    setMigrating(true);
    setProgress(0);
    setStatus('Scanning database...');

    try {
      // Target the current home's purchase list
      const ref = collection(trackerDb, 'artifacts', CHEF_APP_ID, 'homes', currentHomeId, 'purchases');
      const snap = await getDocs(ref);
      
      const legacyDocs = snap.docs;
      if (legacyDocs.length === 0) {
        setStatus('Database is empty.');
        setTimeout(() => setMigrating(false), 2000);
        return;
      }

      setTotal(legacyDocs.length);
      setStatus(`Processing ${legacyDocs.length} items...`);

      // Identify Unique Product Names to save tokens
      const uniqueNamesMap = new Map<string, any[]>();
      legacyDocs.forEach(d => {
        const data = d.data();
        const name = data.productName;
        if (name) {
          if (!uniqueNamesMap.has(name)) uniqueNamesMap.set(name, []);
          uniqueNamesMap.get(name)?.push(d);
        }
      });

      const uniqueNames = Array.from(uniqueNamesMap.keys());
      const BATCH_SIZE = 40; // Gemini limit per prompt roughly
      let processedCount = 0;

      // Process in chunks
      for (let i = 0; i < uniqueNames.length; i += BATCH_SIZE) {
        const chunk = uniqueNames.slice(i, i + BATCH_SIZE);
        
        setStatus(`Classifying batch ${Math.floor(i/BATCH_SIZE) + 1} / ${Math.ceil(uniqueNames.length/BATCH_SIZE)}...`);
        
        try {
          // AI Call for Names
          const ai = getAIService(profile.aiProvider);
          const mappings = await ai.batchClassifyProducts(chunk);
          
          // Write Batch to Firestore
          const dbBatch = writeBatch(trackerDb);
          let opCount = 0;

          // For each mapped name, update all corresponding docs
          mappings.forEach(map => {
            const docsToUpdate = uniqueNamesMap.get(map.original_name);
            if (docsToUpdate) {
              docsToUpdate.forEach(docSnap => {
                const data = docSnap.data();
                
                // Recalculate price logic
                const p = Number(data.price) || 0;
                const q = Number(data.quantity) || 0;
                const u = data.unit || 'pcs';
                const correctNormalized = calcNormalizedPrice(p, q, u);

                dbBatch.update(doc(ref, docSnap.id), { 
                    genericName: map.generic_name,
                    normalizedPrice: correctNormalized 
                });
                
                processedCount++;
                opCount++;
              });
            }
          });

          if (opCount > 0) {
            await dbBatch.commit();
          }
          
          setProgress(processedCount);

        } catch (e) {
          console.error("Batch failed", e);
        }
      }

      setStatus('AI Cleanup complete!');
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    } finally {
      setTimeout(() => setMigrating(false), 3000);
    }
  };

  return { migrating, progress, total, status, runMigration };
}
