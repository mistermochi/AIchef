
import React, { useState } from 'react';
import { Info, PlusCircle, Key, ExternalLink, Bot, AlertTriangle, RefreshCw } from 'lucide-react';
import { ViewHeader, PromptInput, PageLayout, Button } from '../components/UI';
import { useRecipeContext } from '../context/RecipeContext';
import { useAuthContext } from '../context/AuthContext';
import { useUIContext } from '../context/UIContext';
import { useRecipeAI } from '../hooks/useRecipeAI';
import { Recipe } from '../types';

export const HomeView: React.FC = () => {
  const { setActiveRecipe } = useRecipeContext();
  
  const [recipeInput, setRecipeInput] = useState('');
  
  const { isAIEnabled, openKeySelector, profile, aiHealth, aiErrorMsg, checkHealth } = useAuthContext();
  const { setView } = useUIContext();
  
  const { processRecipe, loading, error } = useRecipeAI();

  const handleManualCreateAction = () => {
    setActiveRecipe({ 
      title:'New Recipe', 
      emoji:'🥘', 
      summary:'', 
      ingredients:[{name:'',quantity:1,unit:'g'}], 
      instructions:[''], 
      extractedTips:[], 
      aiSuggestions:[] 
    } as Recipe);
  };

  const handleProcessRecipe = async () => {
    const result = await processRecipe(recipeInput);
    if (result) {
      setActiveRecipe(result);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col animate-in fade-in duration-500 max-w-4xl mx-auto">
        <ViewHeader 
            title="Recipe Adapter" 
            subtitle="Turn any text or URL into a clear recipe."
        />
        
        <div className="w-full space-y-6 mt-4">
          {!isAIEnabled ? (
            // Logic to distinguish between "User Disabled", "System Error", and "Key Missing"
            profile.aiEnabled === false ? (
               // CASE 1: User explicitly disabled AI
               <div className="p-8 bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-3xl flex flex-col items-center text-center gap-6 shadow-sm">
                 <div className="w-16 h-16 bg-surface-variant dark:bg-surface-variant-dark rounded-full flex items-center justify-center text-content-tertiary">
                   <Bot className="w-8 h-8 opacity-50" />
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-xl font-bold text-content dark:text-content-dark">Manual Mode Active</h3>
                   <p className="text-sm text-content-secondary dark:text-content-secondary-dark max-w-sm">
                     AI features are currently disabled in your settings. You can still manage your cookbook manually.
                   </p>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                   <Button fullWidth onClick={handleManualCreateAction} icon={<PlusCircle className="w-4 h-4" />}>
                     Create Manually
                   </Button>
                   <Button fullWidth variant="ghost" onClick={() => setView('profile')} icon={<Bot className="w-4 h-4" />}>
                     Enable AI
                   </Button>
                 </div>
               </div>
            ) : aiHealth === 'unhealthy' ? (
                // CASE 2: System Error (Quota, Network, Auth) despite user wanting AI
                <div className="p-8 bg-surface dark:bg-surface-dark border border-warning/30 dark:border-warning/30 rounded-3xl flex flex-col items-center text-center gap-6 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 right-0 h-1.5 bg-warning" />
                   <div className="w-16 h-16 bg-warning-container dark:bg-warning-container-dark rounded-full flex items-center justify-center text-warning-on-container dark:text-warning-on-container-dark">
                     <AlertTriangle className="w-8 h-8" />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-xl font-bold text-content dark:text-content-dark">AI Temporarily Paused</h3>
                     <p className="text-sm text-content-secondary dark:text-content-secondary-dark max-w-sm">
                       {aiErrorMsg || "We couldn't connect to the AI service."} Switched to Manual Mode to prevent interruptions.
                     </p>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                     <Button fullWidth onClick={checkHealth} icon={<RefreshCw className="w-4 h-4" />}>
                       Retry Connection
                     </Button>
                     <Button fullWidth variant="ghost" onClick={handleManualCreateAction} icon={<PlusCircle className="w-4 h-4" />}>
                       Continue Manually
                     </Button>
                   </div>
                   <button onClick={() => setView('profile')} className="text-xs font-bold text-content-tertiary hover:underline mt-2">Check Settings</button>
                </div>
            ) : (
              // CASE 3: Key Missing (Default First Run state)
              <div className="p-8 bg-surface dark:bg-surface-dark border-2 border-dashed border-primary/20 dark:border-primary-dark/20 rounded-3xl flex flex-col items-center text-center gap-6 shadow-xl">
                <div className="w-16 h-16 bg-primary-container dark:bg-primary-container-dark rounded-full flex items-center justify-center text-primary dark:text-primary-dark">
                  <Key className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-content dark:text-content-dark">Bring Your Own AI Power</h3>
                  <p className="text-sm text-content-secondary dark:text-content-secondary-dark max-w-sm">
                    ChefAI uses your own Google Gemini API key to process recipes securely and at no cost to us. 
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                  <Button fullWidth onClick={openKeySelector} icon={<Key className="w-4 h-4" />}>
                    Select API Key
                  </Button>
                  <Button fullWidth variant="ghost" onClick={handleManualCreateAction} icon={<PlusCircle className="w-4 h-4" />}>
                    Manual Create
                  </Button>
                </div>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-primary dark:text-primary-dark hover:underline flex items-center gap-1.5"
                >
                  Learn about billing and project setup <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )
          ) : (
            <PromptInput 
              autoFocus
              value={recipeInput} 
              onChange={setRecipeInput} 
              onSubmit={handleProcessRecipe}
              loading={loading}
              error={error}
              placeholder="Paste a recipe URL, list ingredients, or describe a dish..."
              className="text-lg shadow-xl"
            />
          )}

          {/* Info Card - Only show if AI is enabled, otherwise it's irrelevant */}
          {isAIEnabled && (
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
          )}
        </div>
      </div>
    </PageLayout>
  );
};
