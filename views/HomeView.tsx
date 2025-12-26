import React from 'react';
import { Info, PlusCircle, AlertTriangle } from 'lucide-react';
import { ViewHeader, PromptInput, PageLayout, Button } from '../components/UI';
import { useChefContext } from '../context/ChefContext';

export const HomeView: React.FC = () => {
  const { 
    recipeInput, setRecipeInput, processRecipeAction, loading, error, 
    isAIEnabled, handleManualCreateAction, setView
  } = useChefContext();

  return (
    <PageLayout>
      <div className="flex flex-col animate-in fade-in duration-500 max-w-4xl mx-auto">
        <ViewHeader 
            title="Recipe Adapter" 
            subtitle="Turn any text or URL into a clear recipe."
        />
        
        <div className="w-full space-y-6 mt-4">
          {!isAIEnabled && (
            <div className="p-4 bg-warning-container/50 dark:bg-warning-container-dark/20 rounded-xl border border-warning/20 flex flex-col sm:flex-row gap-4 items-start">
               <div className="p-2 bg-warning-container dark:bg-warning-container-dark rounded-full shrink-0 text-warning-on-container dark:text-warning-on-container-dark">
                  <AlertTriangle className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <h4 className="text-sm font-bold text-content dark:text-content-dark mb-1">AI Features Disabled</h4>
                 <p className="text-xs text-content-secondary dark:text-content-secondary-dark leading-relaxed mb-3">
                   No API key detected. AI generation features are unavailable. You can still manually create recipes or enter your own API Key in settings.
                 </p>
                 <Button size="sm" variant="secondary" onClick={() => setView('profile')}>Add API Key</Button>
               </div>
            </div>
          )}

          {/* Main Input */}
          <PromptInput 
              autoFocus
              value={recipeInput} 
              onChange={setRecipeInput} 
              onSubmit={processRecipeAction}
              loading={loading}
              error={error}
              disabled={!isAIEnabled}
              placeholder={isAIEnabled ? "Paste a recipe URL, list ingredients, or describe a dish..." : "AI disabled. Add Key to enable."}
              className="text-lg shadow-xl"
              actions={
                !isAIEnabled ? (
                   <Button onClick={handleManualCreateAction} icon={<PlusCircle className="w-4 h-4" />}>Manual Create</Button>
                ) : undefined
              }
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