
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { chefAuth, trackerAuth, chefDb, CHEF_APP_ID } from '../firebase';
import { UserProfile, DEFAULT_PROFILE } from '../types';
import { validateAIConnection } from '../services/geminiService';

interface AuthContextType {
  chefUser: User | null;
  trackerUser: User | null;
  isInitialized: boolean;
  isAIEnabled: boolean;
  hasSelectedKey: boolean;
  openKeySelector: () => Promise<void>;
  
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  saveProfile: () => Promise<void>;
  
  // AI Health
  aiHealth: 'unknown' | 'checking' | 'healthy' | 'unhealthy' | 'region_restricted';
  aiErrorMsg: string;
  checkHealth: () => Promise<void>;
  
  // Helper to format profile for AI prompt
  getProfileContext: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chefUser, setChefUser] = useState<User | null>(null);
  const [trackerUser, setTrackerUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // API Key State
  const [hasSelectedKey, setHasSelectedKey] = useState(!!process.env.API_KEY);
  
  // AI Health State
  const [aiHealth, setAiHealth] = useState<'unknown' | 'checking' | 'healthy' | 'unhealthy' | 'region_restricted'>('unknown');
  const [aiErrorMsg, setAiErrorMsg] = useState('');
  
  const isCheckingRef = useRef(false);

  // 1. Auth Init
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      // Use a safe timeout to ensure app considers itself initialized even if Auth hangs
      // 2500ms is a safe balance for AI Studio's "Launch" detection
      const timeout = setTimeout(() => {
        if (mounted && !isInitialized) setIsInitialized(true);
      }, 2500);

      try {
        // If using unified project, we only need one sign-in.
        if (chefAuth === trackerAuth) {
           await signInAnonymously(chefAuth);
        } else {
           await Promise.all([
             signInAnonymously(chefAuth).catch(e => console.warn("Chef Auth failed:", e.message)),
             signInAnonymously(trackerAuth).catch(e => console.warn("Tracker Auth failed:", e.message))
           ]);
        }
      } catch (e) {
        console.warn("ChefAI Auth: Proceeding in Guest Mode");
      } finally {
        clearTimeout(timeout);
        if (mounted) setIsInitialized(true);
      }
    };

    const unsubChef = onAuthStateChanged(chefAuth, (u) => {
      setChefUser(u);
      // If unified, keep tracker user in sync
      if (chefAuth === trackerAuth) setTrackerUser(u);
    });

    let unsubTracker = () => {};
    // Only attach second listener if they are distinct instances
    if (chefAuth !== trackerAuth) {
      unsubTracker = onAuthStateChanged(trackerAuth, (u) => setTrackerUser(u));
    }

    initAuth();
    return () => { mounted = false; unsubChef(); unsubTracker(); };
  }, []);

  // 2. Profile Sync
  useEffect(() => {
    if (!chefUser) return;
    const prefDoc = doc(chefDb, 'artifacts', CHEF_APP_ID, 'users', chefUser.uid, 'data', 'profile');
    const unsub = onSnapshot(prefDoc, (s) => {
      if (s.exists()) {
        const data = s.data() as Partial<UserProfile>;
        setProfile({ ...DEFAULT_PROFILE, ...data });
        // Sync haptics to local storage for the hook to read synchronously
        localStorage.setItem('chefai_haptics', String(data.haptics ?? true));
      }
    });
    return () => unsub();
  }, [chefUser]);

  // 3. API Key Check
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (process.env.API_KEY) {
          setHasSelectedKey(true);
          return;
        }
        const aistudio = (window as any).aistudio;
        if (aistudio?.hasSelectedApiKey) {
          const hasKey = await aistudio.hasSelectedApiKey();
          setHasSelectedKey(hasKey);
        }
      } catch (e) {
        console.warn("AI Studio Key API not available.");
      }
    };
    checkKey();
  }, []);

  // 4. AI Health Check Logic
  const checkHealth = useCallback(async () => {
    if (isCheckingRef.current) return;
    
    isCheckingRef.current = true;
    setAiHealth('checking');
    
    try {
        const result = await validateAIConnection();
        // Determine health state based on service response status
        if (result.status === 'healthy') {
          setAiHealth('healthy');
        } else if (result.status === 'region_restricted') {
          setAiHealth('region_restricted');
        } else {
          setAiHealth('unhealthy');
        }
        setAiErrorMsg(result.message);
    } catch (e) {
        setAiHealth('unhealthy');
        setAiErrorMsg('Connection Failed');
    } finally {
        isCheckingRef.current = false;
    }
  }, []);

  const openKeySelector = useCallback(async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio?.openSelectKey) {
        await aistudio.openSelectKey();
        setHasSelectedKey(true);
        // We trigger a check immediately if the user manually selects a key
        checkHealth();
      }
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  }, [checkHealth]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      // Sync local effects immediately
      if (typeof updates.haptics !== 'undefined') {
        localStorage.setItem('chefai_haptics', String(updates.haptics));
      }
      return next;
    });
  };

  const saveProfile = async () => {
    if (!chefUser) return;
    try {
      const prefDoc = doc(chefDb, 'artifacts', CHEF_APP_ID, 'users', chefUser.uid, 'data', 'profile');
      await setDoc(prefDoc, profile, { merge: true });
    } catch (e) {
      console.error("Save profile failed:", e);
    }
  };

  const getProfileContext = useCallback(() => {
    const p = profile;
    const parts = [
      `Units: ${p.measurements}`,
      `Servings: ${p.defaultServings}`,
      `Skill: ${p.skillLevel}`,
      p.dietary.length > 0 ? `Dietary: ${p.dietary.join(', ')}` : '',
      p.appliances.length > 0 ? `Appliances: ${p.appliances.join(', ')}` : '',
      p.dislikes ? `Dislikes: ${p.dislikes}` : '',
      p.customInstructions ? `Custom: ${p.customInstructions}` : ''
    ];
    return parts.filter(Boolean).join('. ');
  }, [profile]);

  const isAIEnabled = useMemo(() => {
    const keyReady = !!process.env.API_KEY || hasSelectedKey;
    // Optimistic check: Enabled unless specifically marked unhealthy or region restricted
    return keyReady && (profile.aiEnabled ?? true) && aiHealth !== 'unhealthy' && aiHealth !== 'region_restricted';
  }, [hasSelectedKey, profile.aiEnabled, aiHealth]);

  return (
    <AuthContext.Provider value={{
      chefUser, trackerUser, isInitialized,
      isAIEnabled, hasSelectedKey, openKeySelector,
      profile, updateProfile, saveProfile, getProfileContext,
      aiHealth, aiErrorMsg, checkHealth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
