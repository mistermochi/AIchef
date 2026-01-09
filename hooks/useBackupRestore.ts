
import { useState } from 'react';
import { collection, getDocs, query, writeBatch, doc, orderBy } from 'firebase/firestore';
import { chefDb, trackerDb, CHEF_APP_ID, TRACKER_APP_ID } from '../firebase';
import { useAuthContext } from '../context/AuthContext';
import { downloadFile, readFileAsText, jsonToCSV, csvToJson } from '../utils/backup';
import { Recipe } from '../types';
import { calcNormalizedPrice } from '../utils/tracker';

export function useBackupRestore() {
  const { chefUser, trackerUser } = useAuthContext();
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');

  // Helper for consistent local date filenames (YYYY-MM-DD)
  const getLocalDateString = () => new Date().toLocaleDateString('en-CA');

  // --- COOKBOOK (JSON) ---

  const exportCookbook = async () => {
    if (!chefUser) return;
    setProcessing(true);
    setStatus('Exporting recipes...');
    try {
      const ref = collection(chefDb, 'artifacts', CHEF_APP_ID, 'public', 'data', 'recipes');
      const q = query(ref, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      
      const recipes = snap.docs.map(d => ({
        ...d.data(),
        id: d.id,
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }));

      const filename = `chefai_cookbook_${getLocalDateString()}.json`;
      downloadFile(JSON.stringify(recipes, null, 2), filename, 'json');
      setStatus('Export complete!');
    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e.message}`);
    } finally {
      setProcessing(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const restoreCookbook = async (file: File) => {
    if (!chefUser) return;
    setProcessing(true);
    setStatus('Parsing file...');
    try {
      const jsonStr = await readFileAsText(file);
      const recipes = JSON.parse(jsonStr) as Recipe[];
      
      if (!Array.isArray(recipes)) throw new Error("Invalid file format");

      setStatus(`Restoring ${recipes.length} recipes...`);
      
      const ref = collection(chefDb, 'artifacts', CHEF_APP_ID, 'public', 'data', 'recipes');
      const chunks = [];
      
      for (let i = 0; i < recipes.length; i += 400) {
        chunks.push(recipes.slice(i, i + 400));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(chefDb);
        chunk.forEach(r => {
          if (!r.id) return;
          const { id, ...data } = r;
          const payload = {
            ...data,
            authorId: chefUser.uid,
            createdAt: r.createdAt ? new Date(r.createdAt as any) : new Date()
          };
          batch.set(doc(ref, id), payload);
        });
        await batch.commit();
      }

      setStatus('Restore complete!');
    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e.message}`);
    } finally {
      setProcessing(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  // --- TRACKER (CSV) ---

  const exportTracker = async () => {
    if (!trackerUser) return;
    setProcessing(true);
    setStatus('Exporting purchases...');
    try {
      const ref = collection(trackerDb, 'artifacts', TRACKER_APP_ID, 'public', 'data', 'purchases');
      const q = query(ref, orderBy('date', 'desc'));
      const snap = await getDocs(q);
      
      const items = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          productName: data.productName || '',
          category: data.category || 'General',
          price: data.price || 0,
          unit: data.unit || 'pcs',
          quantity: data.quantity || 0,
          singleQty: data.singleQty || 0,
          count: data.count || 1,
          store: data.store || '',
          date: data.date?.toDate?.()?.toISOString().split('T')[0] || '',
          comment: data.comment || ''
        };
      });

      const cols = ['id', 'productName', 'category', 'price', 'unit', 'quantity', 'singleQty', 'count', 'store', 'date', 'comment'];
      const csv = jsonToCSV(items, cols);
      
      const filename = `chefai_tracker_${getLocalDateString()}.csv`;
      downloadFile(csv, filename, 'csv');
      setStatus('Export complete!');
    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e.message}`);
    } finally {
      setProcessing(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const restoreTracker = async (file: File) => {
    if (!trackerUser) return;
    setProcessing(true);
    setStatus('Parsing CSV...');
    try {
      const csvStr = await readFileAsText(file);
      const rawItems = csvToJson(csvStr);
      
      setStatus(`Restoring ${rawItems.length} entries...`);

      const ref = collection(trackerDb, 'artifacts', TRACKER_APP_ID, 'public', 'data', 'purchases');
      const chunks = [];
      
      for (let i = 0; i < rawItems.length; i += 400) {
        chunks.push(rawItems.slice(i, i + 400));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(trackerDb);
        chunk.forEach((item: any) => {
          if (!item.id || !item.productName) return;
          
          const p = parseFloat(item.price) || 0;
          const q = parseFloat(item.quantity) || 0;
          const u = item.unit || 'pcs';

          // Critical: Apply the unit-aware normalization logic during restore
          const normalizedPrice = calcNormalizedPrice(p, q, u);

          const payload = {
            userId: trackerUser.uid,
            productName: item.productName,
            category: item.category || 'General',
            price: p,
            unit: u,
            quantity: q,
            singleQty: parseFloat(item.singleQty) || 0,
            count: parseFloat(item.count) || 1,
            store: item.store || '',
            date: item.date ? new Date(item.date) : new Date(),
            comment: item.comment || '',
            normalizedPrice: normalizedPrice,
            timestamp: new Date()
          };
          
          batch.set(doc(ref, item.id), payload);
        });
        await batch.commit();
      }

      setStatus('Restore complete!');
    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e.message}`);
    } finally {
      setProcessing(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return {
    processing,
    status,
    exportCookbook,
    restoreCookbook,
    exportTracker,
    restoreTracker
  };
}
