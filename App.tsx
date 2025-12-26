
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useChefContext } from './context/ChefContext';
import { Navigation } from './components/Navigation';
import { HomeView } from './views/HomeView';
import { HistoryView } from './views/HistoryView';
import { ShoppingView } from './views/ShoppingView';
import { ProfileView } from './views/ProfileView';
import { GenieView } from './views/GenieView';
import RecipeModal from './components/RecipeModal';
import { PageHeader } from './components/UI';

export default function ChefAIApp() {
  const { user, view, setView, activeRecipe } = useChefContext();

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface dark:bg-surface-variant-dark text-primary dark:text-primary-dark gap-4 transition-colors">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-medium text-lg text-content dark:text-content-dark">Initializing ChefAI Studio...</p>
      </div>
    );
  }

  const getBreadcrumb = () => {
    const views = {
      home: 'New recipe',
      genie: 'Kitchen Genie',
      cookbook: 'Cookbook',
      shopping: 'Shopping List',
      profile: 'Preferences'
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

        {/* Workspace */}
        <main className="flex-1 overflow-hidden relative">
          {view === 'home' && <HomeView />}
          {view === 'genie' && <GenieView />}
          {view === 'cookbook' && <HistoryView />}
          {view === 'shopping' && <ShoppingView />}
          {view === 'profile' && <ProfileView />}
        </main>
      </div>

      {activeRecipe && <RecipeModal />}
    </div>
  );
}
