
import React from 'react';
import { Info } from 'lucide-react';
import { ViewHeader, PromptInput, PageLayout } from '../components/UI';
import { useChefContext } from '../context/ChefContext';

export const HomeView: React.FC = () => {
  const { recipeInput, setRecipeInput, processRecipeAction, loading, error } = useChefContext();

  return (
    <PageLayout>
      <div className="flex flex-col animate-in fade-in duration-500 max-w-4xl mx-auto">
        <ViewHeader 
            title="Recipe Adapter" 
            subtitle="Turn any text or URL into a clear recipe."
        />
        
        <div className="w-full space-y-6 mt-4">
          {/* Main Input */}
          <PromptInput 
              autoFocus
              value={recipeInput} 
              onChange={setRecipeInput} 
              onSubmit={processRecipeAction}
              loading={loading}
              error={error}
              placeholder="Paste a recipe URL, list ingredients, or describe a dish..."
              className="text-lg shadow-xl"
          />

          {/* Info Card */}
          <div className="p-4 bg-primary-container/30 dark:bg-primary-container-dark/10 rounded-xl border border-primary/10 dark:border-primary-dark/10 flex gap-4 items-start">
              <div className="p-2 bg-surface dark:bg-surface-dark rounded-full shrink-0 text-primary dark:text-primary-dark shadow-sm">
                  <Info className="w-5 h-5" />
              </div>
              <div>
                  <h4 className="text-sm font-bold text-content dark:text-content-dark mb-1">How it works</h4>
                  <p className="text-xs text-content-secondary dark:text-content-secondary-dark leading-relaxed">
                      ChefAI extracts ingredients and steps, then formats them to match your cooking style.
                  </p>
              </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
