import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, Timestamp, doc } from 'firebase/firestore';
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
    
    // Subscribe to recipes, sorted by creation time
    const unsub = onSnapshot(recipeCol, (s) => {
      setRecipes(s.docs.map(d => ({ id: d.id, ...d.data() } as Recipe)).sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0)));
      setLoading(false);
    });
    
    return () => unsub();
  }, [user]);

  const addRecipe = async (recipe: Recipe) => {
    if (!user) throw new Error("User not authenticated");
    
    // Add authorId and timestamps
    return await addDoc(collection(chefDb, 'artifacts', CHEF_APP_ID, 'public', 'data', 'recipes'), { 
        ...recipe, 
        authorId: user.uid, 
        createdAt: Timestamp.now() 
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