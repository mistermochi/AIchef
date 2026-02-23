
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { chefDb, CHEF_APP_ID } from '../../../shared/api/firebase';
import { Recipe } from '../model/types';
import { useAuthContext } from '../../../entities/user/model/AuthContext';

export function useRecipeRepository(homeId: string | null) {
  const { chefUser } = useAuthContext();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const INITIAL_LIMIT = 12;
  const LOAD_STEP = 12;
  const [limitCount, setLimitCount] = useState(INITIAL_LIMIT);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!homeId) {
        setRecipes([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    
    // New Path: artifacts/{appId}/homes/{homeId}/recipes
    const recipeCol = collection(chefDb, 'artifacts', CHEF_APP_ID, 'homes', homeId, 'recipes');
    
    // Optimized Query: Only fetch limited number of docs initially
    const q = query(recipeCol, orderBy('createdAt', 'desc'), limit(limitCount));

    const unsub = onSnapshot(q, { includeMetadataChanges: true }, (s) => {
      const data = s.docs.map(d => {
        const raw = d.data();
        return { 
            id: d.id, 
            ...raw,
            createdAt: raw.createdAt 
        } as Recipe;
      });
      
      setRecipes(data);
      
      // Heuristic: If we received fewer docs than requested, we've hit the end.
      if (data.length < limitCount) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      if (!s.metadata.hasPendingWrites) {
         setLoading(false);
      }
    });
    
    return () => unsub();
  }, [homeId, limitCount]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setLimitCount(prev => prev + LOAD_STEP);
    }
  };

  const addRecipe = async (recipe: Recipe) => {
    if (!chefUser || !homeId) throw new Error("No active home session");
    return await addDoc(collection(chefDb, 'artifacts', CHEF_APP_ID, 'homes', homeId, 'recipes'), { 
        ...recipe, 
        authorId: chefUser.uid, 
        createdAt: new Date() 
    });
  };

  const updateRecipe = async (id: string, data: Partial<Recipe>) => {
      if (!homeId) throw new Error("No active home session");
      const recipeRef = doc(chefDb, 'artifacts', CHEF_APP_ID, 'homes', homeId, 'recipes', id);
      await updateDoc(recipeRef, data);
  };

  const deleteRecipe = async (id: string) => {
      if (!homeId) throw new Error("No active home session");
      const recipeRef = doc(chefDb, 'artifacts', CHEF_APP_ID, 'homes', homeId, 'recipes', id);
      await deleteDoc(recipeRef);
  };

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe, loadMore, hasMore };
}
