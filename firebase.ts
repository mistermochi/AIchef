// Fix: Ensure modular Firebase v9+ imports are correctly recognized.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBzpBV8owQ5VbHmaOasDXzn1fbnfzG7fU8",
  authDomain: "chefai-dd91e.firebaseapp.com",
  projectId: "chefai-dd91e",
  storageBucket: "chefai-dd91e.firebasestorage.app",
  messagingSenderId: "382886206236",
  appId: "1:382886206236:web:48c46f20dc762e05a2b8d9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const APP_ID = 'chef-ai-v1';