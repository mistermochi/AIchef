
import React, { Suspense } from 'react';
import { Loader2, UserCircle } from 'lucide-react';
import { useUIContext } from './context/UIContext';
import { useRecipeContext } from './context/RecipeContext';
import { useAuthContext } from './context/AuthContext';
import { Navigation } from './components/layout/Navigation';
import RecipeModal from './components/recipe/RecipeModal';
import { PageHeader } from './components/UI';

// Lazy load views
const HistoryView = React.lazy(() => import('./views/HistoryView').then(module => ({ default: module.HistoryView })));
const ShoppingView = React.lazy(() => import('./views/ShoppingView').then(module => ({ default: module.ShoppingView })));
const ProfileView = React.lazy(() => import('./views/ProfileView').then(module => ({ default: module.ProfileView })));
const GenieView = React.lazy(() => import('./views/GenieView').then(module => ({ default: module.GenieView })));
const TrackerView = React.lazy(() => import('./views/TrackerView').then(module => ({ default: module.TrackerView })));
const TestDashboardView = React.lazy(() => import('./views/TestDashboardView').then(module => ({ default: module.TestDashboardView })));
const PlanView = React.lazy(() => import('./views/PlanView').then(module => ({ default: module.PlanView })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full text-primary dark:text-primary-dark opacity-50">
    <Loader2 className="w-8 h-8 animate-spin" />
  </div>
);

/**
 * @component ChefAIApp
 * @description The root component of the ChefAI application.
 * It sets up the main layout, including the sidebar navigation and the main content area.
 * It also handles dynamic view switching (lazy-loading views) and manages the visibility of the global Recipe Modal.
 *
 * Layout:
 * - {@link Navigation}: Fixed sidebar on desktop, bottom bar on mobile.
 * - `main`: Dynamic container that renders the currently active view based on `UIContext`.
 * - {@link RecipeModal}: A global modal that overlays the active view when a recipe is selected.
 *
 * Interactions:
 * - {@link useUIContext}: To determine which view to render.
 * - {@link useRecipeContext}: To check if a recipe modal should be displayed.
 * - {@link useAuthContext}: For mobile-specific header actions (profile access).
 */
export default function ChefAIApp() {
  const { view, setView } = useUIContext();
  const { activeRecipe } = useRecipeContext();
  const { chefUser } = useAuthContext();
  
  const getBreadcrumb = () => {
    const views: Record<string, string> = {
      home: 'New recipe',
      genie: 'Kitchen Genie',
      cookbook: 'Cookbook',
      shopping: 'Shopping List',
      profile: 'Preferences',
      tracker: 'Price Tracker',
      test: 'Diagnostics',
      plan: 'Meal Planner'
    };
    return views[view] || view;
  };

  const userInitial = chefUser?.email ? chefUser.email[0].toUpperCase() : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-variant dark:bg-surface-variant-dark transition-colors text-content dark:text-content-dark">
      {/* Fixed Sidebar */}
      <Navigation />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative transition-colors">
        <PageHeader 
          title="ChefAI Studio" 
          breadcrumbs={[getBreadcrumb()]} 
          action={
            <button 
              onClick={() => setView('profile')}
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark text-primary dark:text-primary-dark active:scale-95 shadow-sm"
              title="Profile Settings"
            >
               {userInitial ? (
                 <span className="font-bold text-xs">{userInitial}</span>
               ) : (
                 <UserCircle className="w-5 h-5 opacity-80" />
               )}
            </button>
          }
        />

        {/* Workspace with Fluid Transition Wrapper */}
        <main className="flex-1 overflow-hidden relative">
          <div key={view} className="absolute inset-0 overflow-hidden flex flex-col animate-view-enter">
            <Suspense fallback={<LoadingFallback />}>
              {view === 'genie' && <GenieView />}
              {(view === 'cookbook' || view === 'home') && <HistoryView />}
              {view === 'shopping' && <ShoppingView />}
              {view === 'tracker' && <TrackerView />}
              {view === 'profile' && <ProfileView />}
              {view === 'test' && <TestDashboardView />}
              {view === 'plan' && <PlanView />}
            </Suspense>
          </div>
        </main>
      </div>

      {activeRecipe && <RecipeModal />}
    </div>
  );
}
