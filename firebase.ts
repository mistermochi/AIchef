
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration for the ChefAI project
const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "chefai-dd91e.firebaseapp.com",
  projectId: "chefai-dd91e",
  storageBucket: "chefai-dd91e.firebasestorage.app",
  messagingSenderId: "382886206236",
  appId: "1:382886206236:web:48c46f20dc762e05a2b8d9"
};

// Initialize App
const app = initializeApp(firebaseConfig);

// ChefAI Resources
export const chefAuth = getAuth(app);
export const chefDb = getFirestore(app);
export const CHEF_APP_ID = 'chef-ai-v1';

// Tracker Resources (Aliased to ChefAI project)
export const trackerAuth = chefAuth;
export const trackerDb = chefDb;
export const TRACKER_APP_ID = 'chef-ai-tracker-v1';
