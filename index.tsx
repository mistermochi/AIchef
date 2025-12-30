
import ReactDOM from 'react-dom/client';
import ChefAIApp from './App';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { RecipeProvider } from './context/RecipeContext';
import { CartProvider } from './context/CartContext';
import { TrackerProvider } from './context/TrackerContext';

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
