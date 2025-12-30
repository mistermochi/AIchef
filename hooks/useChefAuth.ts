
import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { chefAuth, trackerAuth } from '../firebase';

export function useChefAuth() {
  const [chefUser, setChefUser] = useState<User | null>(null);
  const [trackerUser, setTrackerUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Use a timeout to ensure we don't hang the app forever on bad networks
      const timeout = setTimeout(() => {
        if (mounted && !isInitialized) setIsInitialized(true);
      }, 5000);

      try {
        // Attempt anonymous sign-in if no user exists
        const attempts = [
          signInAnonymously(chefAuth).catch(e => console.warn("Chef Auth failed:", e.message)),
          signInAnonymously(trackerAuth).catch(e => console.warn("Tracker Auth failed:", e.message))
        ];
        
        await Promise.all(attempts);
      } catch (e) {
        console.warn("ChefAI Auth: Proceeding in Guest Mode");
      } finally {
        clearTimeout(timeout);
        if (mounted) setIsInitialized(true);
      }
    };

    const unsubChef = onAuthStateChanged(chefAuth, (u) => setChefUser(u));
    const unsubTracker = onAuthStateChanged(trackerAuth, (u) => setTrackerUser(u));

    initAuth();

    return () => { 
      mounted = false;
      unsubChef(); 
      unsubTracker(); 
    };
  }, []);

  return { chefUser, trackerUser, isInitialized };
}
