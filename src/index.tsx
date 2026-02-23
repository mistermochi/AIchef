import ReactDOM from 'react-dom/client';
import ChefAIApp from './App';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { RecipeProvider } from './context/RecipeContext';
import { CartProvider } from './context/CartContext';
import { TrackerProvider } from './entities/tracker/model/TrackerContext';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <AuthProvider>
    <UIProvider>
      <TrackerProvider>
        <RecipeProvider>
          <CartProvider>
            <ChefAIApp />
          </CartProvider>
        </RecipeProvider>
      </TrackerProvider>
    </UIProvider>
  </AuthProvider>
);

// PWA Service Worker Registration
// Uses import.meta.env.BASE_URL to correctly resolve the path in both Dev and Prod (GitHub Pages)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Only register if not in a Blob/Null origin (some sandboxed environments)
    if (window.origin === 'null' || window.location.protocol === 'blob:') return;

    // Construct absolute path using Vite's injected base URL
    // e.g. /AIchef/service-worker.js
    const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;
    
    navigator.serviceWorker.register(swUrl, { scope: import.meta.env.BASE_URL })
      .then((registration) => {
        console.log('SW registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('SW registration failed:', error);
      });
  });
}