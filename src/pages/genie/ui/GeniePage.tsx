
import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, CookingPot, Zap, Mic, Plus, Bot } from 'lucide-react';
import { ViewHeader, Badge, PromptInput, EmptyState, PageLayout, Button } from '../../../shared/ui';
import { GenieCard, GenieSkeleton } from '../../../features/recipe-genie/ui/GenieCard';
import { useRecipeContext } from '../../../entities/recipe/model/RecipeContext';
import { useAuthContext } from '../../../entities/user/model/AuthContext';
import { useUIContext } from '../../../app/providers/UIContext';
import { useRecipeAI } from '../../../entities/recipe/api/useRecipeAI';
import { GenieIdea } from '../../../entities/recipe/model/types';

/**
 * @view GenieView
 * @description The "Kitchen Genie" view.
 * It allows users to input a list of ingredients and receive AI-generated recipe ideas.
 *
 * Features:
 * - Idea Generation: Suggests recipe titles, summaries, and emojis based on input.
 * - Recipe Creation: Allows selecting an idea to generate a full, structured recipe.
 * - AI Status Handling: Shows specific states when AI is disabled or resting.
 *
 * Interactions:
 * - {@link useRecipeAI}: For generating ideas and processing selected recipes.
 * - {@link useRecipeContext}: For setting the active recipe when an idea is selected.
 * - {@link useAuthContext}: For checking AI enablement and user profile preferences.
 */
export const GeniePage: React.FC = () => {
  const { setActiveRecipe } = useRecipeContext();
  const { isAIEnabled, profile } = useAuthContext();
  const { setView } = useUIContext();
  
  const { 
    generateGenieIdeas, genieLoading, genieIdeas, 
    processRecipe, loading: loadingRecipe, error: recipeError 
  } = useRecipeAI();
  
  const [genieInput, setGenieInput] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((genieLoading || genieIdeas.length > 0) && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [genieLoading, genieIdeas]);

  const selectGenieIdea = async (idea: GenieIdea) => {
    const prompt = `Recipe Idea: ${idea.title}. Description: ${idea.summary}. Generate full recipe.`;
    const result = await processRecipe(prompt);
    if (result) {
        setActiveRecipe(result);
    }
  };

  const handleGenerate = () => generateGenieIdeas(genieInput);

  const shouldShowHeader = genieLoading || genieIdeas.length > 0;

  if (!isAIEnabled) {
    return (
      <PageLayout>
         <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-surface-variant dark:bg-surface-variant-dark rounded-full flex items-center justify-center">
              {profile.aiEnabled === false ? (
                <Bot className="w-10 h-10 text-content-tertiary dark:text-content-tertiary-dark opacity-50" />
              ) : (
                <Sparkles className="w-10 h-10 text-content-tertiary dark:text-content-tertiary-dark opacity-50" />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-content dark:text-content-dark">
                {profile.aiEnabled === false ? "AI Features Disabled" : "Kitchen Genie Resting"}
              </h3>
              <p className="text-sm text-content-secondary dark:text-content-secondary-dark">
                {profile.aiEnabled === false 
                  ? "Enable AI in settings to unlock the Kitchen Genie." 
                  : "Connect an API key to wake up the Genie."}
              </p>
            </div>
            {profile.aiEnabled === false && (
               <Button variant="ghost" onClick={() => setView('profile')}>Go to Settings</Button>
            )}
         </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout contentClassName="flex flex-col" scrollRef={scrollRef}>
      <div className="flex flex-col animate-in fade-in duration-500 max-w-4xl mx-auto w-full min-h-full">
        {shouldShowHeader && (
          <ViewHeader 
            title="Kitchen Genie"
            subtitle="Recipe Ideas"
            actions={<Badge variant="primary" icon={<Zap />} label="Creative Mode" className="px-2.5 py-1" />}
            className="shrink-0"
          />
        )}

        <div className="flex-1 flex flex-col gap-6">
          {genieLoading ? (
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-2xs font-bold text-content-tertiary dark:text-content-tertiary-dark uppercase tracking-widest px-1 mb-4">
                  <Sparkles className="w-3 h-3 text-primary dark:text-primary-dark animate-pulse" />
                  <span className="animate-pulse">Thinking...</span>
                </div>
                {[...Array(1)].map((_, i) => <GenieSkeleton key={i} />)}
             </div>
          ) : genieIdeas.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-2xs font-bold text-content-tertiary dark:text-content-tertiary-dark uppercase tracking-widest px-1 mb-4">
                <Sparkles className="w-3 h-3 text-primary dark:text-primary-dark" />
                <span>Suggestions</span>
              </div>
              
              {genieIdeas.map((idea, idx) => (
                <GenieCard 
                  key={idx}
                  idea={idea}
                  onClick={() => !loadingRecipe && selectGenieIdea(idea)}
                  disabled={loadingRecipe}
                  className="animate-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center min-h-[40vh]">
              <EmptyState icon={<CookingPot />} title="Kitchen Genie" description="Tell me what ingredients you have, and I'll suggest what to cook." />
            </div>
          )}

          <div className="pt-4 mt-auto">
             <PromptInput 
                value={genieInput}
                onChange={setGenieInput}
                onSubmit={handleGenerate}
                loading={genieLoading || loadingRecipe}
                placeholder="What's in your fridge?"
                error={recipeError}
                className="text-lg shadow-xl"
                actions={
                  <>
                    <button type="button" className="p-2 text-content-secondary dark:text-content-secondary-dark hover:bg-surface dark:hover:bg-surface-dark rounded-lg transition-colors" title="Rewrite"><Sparkles className="w-5 h-5 opacity-60" /></button>
                    <button type="button" className="p-2 text-content-secondary dark:text-content-secondary-dark hover:bg-surface dark:hover:bg-surface-dark rounded-lg transition-colors" title="Voice input"><Mic className="w-5 h-5 opacity-60" /></button>
                    <button type="button" className="p-2 text-content-secondary dark:text-content-secondary-dark hover:bg-surface dark:hover:bg-surface-dark rounded-lg transition-colors" title="Add context"><Plus className="w-5 h-5 opacity-60" /></button>
                  </>
                }
              />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
