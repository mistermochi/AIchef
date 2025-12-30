
import React from 'react';
import { useUIContext } from './context/UIContext';
import { useRecipeContext } from './context/RecipeContext';
import { Navigation } from './components/Navigation';
import { HistoryView } from './views/HistoryView';
import { ShoppingView } from './views/ShoppingView';
import { ProfileView } from './views/ProfileView';
import { GenieView } from './views/GenieView';
import { TrackerView } from './views/TrackerView';
import RecipeModal from './components/RecipeModal';
import { PageHeader } from './components/UI';

export default function ChefAIApp() {
  const { view } = useUIContext();
  const { activeRecipe } = useRecipeContext();
  
  // NOTE: Automatic background health check has been removed to prevent 
  // API blocking issues during the initial launch phase.
  // Health checks will now occur lazily when the user interacts with specific features
  // or visits the Profile/Settings page.

  const getBreadcrumb = () => {
    const views = {
      home: 'New recipe',
      genie: 'Kitchen Genie',
      cookbook: 'Cookbook',
      shopping: 'Shopping List',
      profile: 'Preferences',
      tracker: 'Price Tracker'
    };
    return views[view] || view;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-variant dark:bg-surface-variant-dark transition-colors text-content dark:text-content-dark">
      {/* Fixed Sidebar */}
      <Navigation />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative transition-colors">
        <PageHeader title="ChefAI Studio" breadcrumbs={[getBreadcrumb()]} />

        {/* Workspace with Fluid Transition Wrapper */}
        <main className="flex-1 overflow-hidden relative">
          <div key={view} className="absolute inset-0 overflow-hidden flex flex-col animate-view-enter">
            {view === 'genie' && <GenieView />}
            {(view === 'cookbook' || view === 'home') && <HistoryView />}
            {view === 'shopping' && <ShoppingView />}
            {view === 'tracker' && <TrackerView />}
            {view === 'profile' && <ProfileView />}
          </div>
        </main>
      </div>

      {activeRecipe && <RecipeModal />}
    </div>
  );
}
