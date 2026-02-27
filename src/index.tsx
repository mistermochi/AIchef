import ReactDOM from 'react-dom/client';
import './index.css';
import ChefAIApp from './app/App';
import { AuthProvider } from './entities/user/model/AuthContext';
import { UIProvider } from './app/providers/UIContext';
import { RecipeProvider } from './entities/recipe/model/RecipeContext';
import { CartProvider } from './features/shopping-cart/model/CartContext';
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