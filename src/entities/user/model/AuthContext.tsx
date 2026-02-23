
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User, 
  updateProfile as updateFirebaseProfile 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  addDoc, 
  collection 
} from 'firebase/firestore';
import { chefDb, chefAuth, CHEF_APP_ID } from '../../../shared/api/firebase';
import { UserProfile, DEFAULT_PROFILE } from '../../../shared/model/types';
import { validateAIConnection } from '../../../shared/api/geminiService';

interface HomeData {
  name: string;
  members: string[];
  ownerId?: string;
}

interface MemberProfile {
  uid: string;
  displayName: string;
  email: string;
  isOwner: boolean;
}

/**
 * @interface AuthContextType
 * @description Defines the shape of the Authentication Context, including user state, profile management, AI health monitoring, and household (Home) management.
 */
interface AuthContextType {
  /** The currently authenticated Firebase user for the Chef app. */
  chefUser: User | null;
  /** Alias for chefUser, used in tracking contexts. */
  trackerUser: User | null;
  
  // Profile
  /** The extended user profile containing preferences and settings. */
  profile: UserProfile;
  /** Updates the local profile state. */
  updateProfile: (p: Partial<UserProfile>) => void;
  /** Persists the current profile to Firestore. */
  saveProfile: () => Promise<void>;
  /** Updates the user's display name in both Firebase Auth and Firestore. */
  updateUserDisplayName: (name: string) => Promise<void>;
  /** Generates a string summary of user preferences for AI context. */
  getProfileContext: () => string;
  
  // AI Status
  /** Whether AI features are currently usable based on user settings and health checks. */
  isAIEnabled: boolean;
  /** The current health status of the Gemini AI connection. */
  aiHealth: 'unknown' | 'checking' | 'healthy' | 'auth_error' | 'quota_error' | 'network_error' | 'region_restricted' | 'unhealthy';
  /** Error message associated with AI health issues. */
  aiErrorMsg: string;
  /** Triggers a health check of the AI service. */
  checkHealth: () => Promise<void>;
  /** Manually reports an AI-related error to the context. */
  reportError: (type: AuthContextType['aiHealth'], msg: string) => void;
  /** Opens the AI Studio key selector (if available in the environment). */
  openKeySelector: () => Promise<void>;

  // Homes
  /** ID of the currently active household/home. */
  currentHomeId: string | null;
  /** Data object for the current home. */
  currentHome: HomeData | null;
  /** List of members in the current home. */
  homeMembers: MemberProfile[];
  /** Creates a new home and sets it as current. */
  createHome: (name: string) => Promise<void>;
  /** Joins an existing home by its ID. */
  joinHome: (id: string) => Promise<void>;

  // Auth Actions
  /** Logs in a user with email and password. */
  login: (e: string, p: string) => Promise<void>;
  /** Registers a new user with email and password. */
  register: (e: string, p: string) => Promise<void>;
  /** Logs out the current user and clears local state. */
  logout: () => Promise<void>;
  /** Current authentication error message. */
  authError: string;
  /** Success or feedback message from auth actions. */
  authMessage: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @component AuthProvider
 * @description Provides authentication and user profile state to the entire application.
 * Manages Firebase Auth listeners, Firestore profile sync, and household data subscriptions.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chefUser, setChefUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Homes
  const [currentHomeId, setCurrentHomeId] = useState<string | null>(null);
  const [currentHome, setCurrentHome] = useState<HomeData | null>(null);
  const [homeMembers, setHomeMembers] = useState<MemberProfile[]>([]);

  // Auth Feedback
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // AI Health - OPTIMISTIC START (Unknown = Assumed Working until proven otherwise)
  const [aiHealth, setAiHealth] = useState<AuthContextType['aiHealth']>('unknown');
  const [aiErrorMsg, setAiErrorMsg] = useState('');

  // 1. Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(chefAuth, async (user) => {
      setChefUser(user);
      if (user) {
        // OPTIMIZATION: Optimistic Cache Load
        // Try to load home/profile from local storage immediately to unblock UI/Recipe fetching
        const cacheKey = `chefai_user_cache_${user.uid}`;
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const c = JSON.parse(cached);
            if (c.profile) setProfile(c.profile);
            if (c.currentHomeId) setCurrentHomeId(c.currentHomeId);
          }
        } catch(e) { console.warn("Cache read error", e); }

        // Load Fresh User Config
        const userDocRef = doc(chefDb, 'artifacts', CHEF_APP_ID, 'users', user.uid);
        const snap = await getDoc(userDocRef);
        
        if (snap.exists()) {
          const data = snap.data();
          setProfile({ ...DEFAULT_PROFILE, ...data.profile });
          
          let homeId = data.currentHomeId;
          if (!homeId) {
             createHome(`${user.displayName || 'My'} Kitchen`);
          } else {
             if (homeId !== currentHomeId) setCurrentHomeId(homeId);
          }

          // Backfill/Sync Identity info to Firestore (so other members can see name/email)
          if (user.email !== data.email || user.displayName !== data.displayName) {
             setDoc(userDocRef, { email: user.email, displayName: user.displayName }, { merge: true });
          }

          // Update Cache
          localStorage.setItem(cacheKey, JSON.stringify({
            profile: { ...DEFAULT_PROFILE, ...data.profile },
            currentHomeId: homeId || null
          }));

        } else {
          // New User Setup
          await setDoc(userDocRef, { 
             profile: DEFAULT_PROFILE,
             createdAt: new Date(),
             email: user.email || '',
             displayName: user.displayName || ''
          });
          createHome(`${user.displayName || 'My'} Kitchen`);
        }
      } else {
        setProfile(DEFAULT_PROFILE);
        setCurrentHomeId(null);
        // Anonymous login if no user
        signInAnonymously(chefAuth).catch(console.error);
      }
    });
    return () => unsub();
  }, []);

  // 2. Home Listener
  useEffect(() => {
    if (!currentHomeId) {
       setCurrentHome(null);
       setHomeMembers([]);
       return;
    }

    const homeRef = doc(chefDb, 'artifacts', CHEF_APP_ID, 'homes', currentHomeId);
    const unsub = onSnapshot(homeRef, async (s) => {
       if (s.exists()) {
          const hData = s.data() as HomeData;
          setCurrentHome(hData);
          
          if (hData.members && hData.members.length > 0) {
             const memberPromises = hData.members.map(async (uid: string) => {
                 if (uid === chefUser?.uid) {
                     return {
                        uid,
                        displayName: chefUser?.displayName || 'You',
                        email: chefUser?.email || '',
                        isOwner: uid === hData.ownerId
                     };
                 }
                 
                 try {
                     const uSnap = await getDoc(doc(chefDb, 'artifacts', CHEF_APP_ID, 'users', uid));
                     const uData = uSnap.exists() ? uSnap.data() : null;
                     return {
                        uid,
                        displayName: uData?.displayName || 'Member',
                        email: uData?.email || '...',
                        isOwner: uid === hData.ownerId
                     };
                 } catch {
                     return { uid, displayName: 'Member', email: '...', isOwner: uid === hData.ownerId };
                 }
             });

             const membersData = await Promise.all(memberPromises);
             setHomeMembers(membersData);
          }
       } else {
          setCurrentHomeId(null);
       }
    });
    return () => unsub();
  }, [currentHomeId, chefUser]);

  // 3. AI Health Check
  const checkHealth = useCallback(async () => {
    if (profile.aiEnabled === false) {
       setAiHealth('unknown'); 
       return;
    }
    
    setAiHealth('checking');
    try {
      const res = await validateAIConnection();
      setAiHealth(res.status);
      setAiErrorMsg(res.message);
    } catch (e) {
      setAiHealth('unhealthy');
    }
  }, [profile.aiEnabled]);

  const reportError = useCallback((type: AuthContextType['aiHealth'], msg: string) => {
     setAiHealth(type);
     setAiErrorMsg(msg);
  }, []);

  // --- ACTIONS ---

  const updateProfile = (p: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...p }));
  };

  const saveProfile = async () => {
    if (!chefUser) return;
    try {
      await setDoc(doc(chefDb, 'artifacts', CHEF_APP_ID, 'users', chefUser.uid), { profile }, { merge: true });
      setAuthMessage('Profile saved!');
      setTimeout(() => setAuthMessage(''), 3000);
      // Explicit check on save is good UX
      checkHealth(); 
    } catch (e: any) {
      setAuthError(e.message);
    }
  };

  const updateUserDisplayName = async (name: string) => {
    if (!chefUser) return;
    try {
      await updateFirebaseProfile(chefUser, { displayName: name });
      setChefUser({ ...chefUser, displayName: name } as User);
      await setDoc(doc(chefDb, 'artifacts', CHEF_APP_ID, 'users', chefUser.uid), { displayName: name }, { merge: true });
      setAuthMessage('Name updated');
      setTimeout(() => setAuthMessage(''), 3000);
    } catch (e: any) {
      setAuthError(e.message);
    }
  };

  const getProfileContext = () => {
    return `Diet: ${profile.dietary.join(', ')}. Appliances: ${profile.appliances.join(', ')}. Skill: ${profile.skillLevel}. ${profile.customInstructions}`;
  };

  const createHome = async (name: string) => {
     if (!chefUser) return;
     const homeRef = await addDoc(collection(chefDb, 'artifacts', CHEF_APP_ID, 'homes'), {
        name,
        ownerId: chefUser.uid,
        members: [chefUser.uid],
        createdAt: new Date()
     });
     
     await setDoc(doc(chefDb, 'artifacts', CHEF_APP_ID, 'users', chefUser.uid), { currentHomeId: homeRef.id }, { merge: true });
     setCurrentHomeId(homeRef.id);
  };

  const joinHome = async (homeId: string) => {
     if (!chefUser) return;
     const homeRef = doc(chefDb, 'artifacts', CHEF_APP_ID, 'homes', homeId);
     const homeSnap = await getDoc(homeRef);
     
     if (!homeSnap.exists()) {
        throw new Error("Invalid Code: Household not found.");
     }

     const homeData = homeSnap.data();
     const members = homeData.members || [];
     if (!members.includes(chefUser.uid)) {
        await setDoc(homeRef, { members: [...members, chefUser.uid] }, { merge: true });
     }

     const userDocRef = doc(chefDb, 'artifacts', CHEF_APP_ID, 'users', chefUser.uid);
     await setDoc(userDocRef, { currentHomeId: homeId }, { merge: true });
     setCurrentHomeId(homeId);
  };

  const openKeySelector = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        checkHealth();
    } else {
        alert("API Key selection not available in this environment.");
    }
  };

  const login = async (e: string, p: string) => {
     setAuthError('');
     try {
       await signInWithEmailAndPassword(chefAuth, e, p);
     } catch (err: any) {
       setAuthError(err.message);
       throw err;
     }
  };

  const register = async (e: string, p: string) => {
     setAuthError('');
     try {
       await createUserWithEmailAndPassword(chefAuth, e, p);
     } catch (err: any) {
       setAuthError(err.message);
       throw err;
     }
  };

  const logout = async () => {
     await signOut(chefAuth);
     setProfile(DEFAULT_PROFILE);
     setCurrentHomeId(null);
  };

  const isAIEnabled = profile.aiEnabled !== false && aiHealth !== 'unhealthy' && aiHealth !== 'auth_error' && aiHealth !== 'quota_error' && aiHealth !== 'region_restricted';

  return (
    <AuthContext.Provider value={{
      chefUser, trackerUser: chefUser,
      profile, updateProfile, saveProfile, updateUserDisplayName, getProfileContext,
      isAIEnabled, aiHealth, aiErrorMsg, checkHealth, reportError, openKeySelector,
      currentHomeId, currentHome, homeMembers, createHome, joinHome,
      login, register, logout, authError, authMessage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to consume the AuthContext.
 * @returns {AuthContextType} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
