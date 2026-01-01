
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { chefDb, CHEF_APP_ID } from '../../firebase';
import { Recipe } from '../../types';
import { User } from 'firebase/auth';

export function useRecipeRepository(user: User | null) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setRecipes([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    const recipeCol = collection(chefDb, 'artifacts', CHEF_APP_ID, 'public', 'data', 'recipes');
    const q = query(recipeCol, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, { includeMetadataChanges: true }, (s) => {
      const data = s.docs.map(d => {
        const raw = d.data();
        return { 
            id: d.id, 
            ...raw,
            // Pre-calculate/Normalize timestamp to number for faster client-side sorting if needed
            // and to avoid serialization issues
            createdAt: raw.createdAt 
        } as Recipe;
      });
      
      setRecipes(data);
      
      // If we have data from cache, we can stop loading immediately
      // even if the server check is pending.
      if (!s.metadata.hasPendingWrites) {
         setLoading(false);
      }
    });
    
    return () => unsub();
  }, [user]);

  const addRecipe = async (recipe: Recipe) => {
    if (!user) throw new Error("User not authenticated");
    return await addDoc(collection(chefDb, 'artifacts', CHEF_APP_ID, 'public', 'data', 'recipes'), { 
        ...recipe, 
        authorId: user.uid, 
        createdAt: serverTimestamp() 
    });
  };

  const updateRecipe = async (id: string, data: Partial<Recipe>) => {
      if (!user) throw new Error("User not authenticated");
      const recipeRef = doc(chefDb, 'artifacts', CHEF_APP_ID, 'public', 'data', 'recipes', id);
      await updateDoc(recipeRef, data);
  };

  const deleteRecipe = async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      const recipeRef = doc(chefDb, 'artifacts', CHEF_APP_ID, 'public', 'data', 'recipes', id);
      await deleteDoc(recipeRef);
  };

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe };
}
