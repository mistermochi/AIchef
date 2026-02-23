
import React, { Suspense } from 'react';
import { Loader2, UserCircle } from 'lucide-react';
import { useUIContext } from './providers/UIContext';
import { useRecipeContext } from '../entities/recipe/model/RecipeContext';
import { useAuthContext } from '../entities/user/model/AuthContext';
import { Navigation } from '../shared/ui/layout/Navigation';
const RecipeModal = React.lazy(() => import('../features/cookbook/ui/RecipeModal'));
import { PageHeader, ErrorBoundary } from '../shared/ui';

// Lazy load views
const CookbookPage = React.lazy(() => import('../pages/cookbook/ui/CookbookPage').then(module => ({ default: module.CookbookPage })));
const ShoppingPage = React.lazy(() => import('../pages/shopping/ui/ShoppingPage').then(module => ({ default: module.ShoppingPage })));
const ProfilePage = React.lazy(() => import('../pages/profile/ui/ProfilePage').then(module => ({ default: module.ProfilePage })));
const GeniePage = React.lazy(() => import('../pages/genie/ui/GeniePage').then(module => ({ default: module.GeniePage })));
const TrackerPage = React.lazy(() => import('../pages/tracker/ui/TrackerPage').then(module => ({ default: module.TrackerPage })));
const DiagnosticsPage = React.lazy(() => import('../pages/diagnostics/ui/DiagnosticsPage').then(module => ({ default: module.DiagnosticsPage })));
const PlannerPage = React.lazy(() => import('../pages/planner/ui/PlannerPage').then(module => ({ default: module.PlannerPage })));

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
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                {view === 'genie' && <GeniePage />}
                {(view === 'cookbook' || view === 'home') && <CookbookPage />}
                {view === 'shopping' && <ShoppingPage />}
                {view === 'tracker' && <TrackerPage />}
                {view === 'profile' && <ProfilePage />}
                {view === 'test' && <DiagnosticsPage />}
                {view === 'plan' && <PlannerPage />}
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {activeRecipe && (
        <Suspense fallback={null}>
          <RecipeModal />
        </Suspense>
      )}
    </div>
  );
}
