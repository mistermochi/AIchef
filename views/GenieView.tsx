import React, { useRef, useEffect } from 'react';
import { Sparkles, ChevronRight, CookingPot, Zap, Mic, Plus, AlertTriangle } from 'lucide-react';
import { ViewHeader, Badge, PromptInput, EmptyState, Card, GenieSkeleton, PageLayout, Button } from '../components/UI';
import { useChefContext } from '../context/ChefContext';

export const GenieView: React.FC = () => {
  const { 
    genieInput, setGenieInput, genieIdeas, genieLoading,
    generateGenieIdeasAction, selectGenieIdea, loading: loadingRecipe, error,
    isAIEnabled, setView
  } = useChefContext();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top when loading starts or new ideas arrive to show results
  useEffect(() => {
    if ((genieLoading || genieIdeas.length > 0) && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [genieLoading, genieIdeas]);

  const shouldShowHeader = genieLoading || genieIdeas.length > 0;

  if (!isAIEnabled) {
    return (
      <PageLayout>
         <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-surface-variant dark:bg-surface-variant-dark rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-content-tertiary dark:text-content-tertiary-dark opacity-50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-content dark:text-content-dark">Kitchen Genie Sleeping</h3>
              <p className="text-sm text-content-secondary dark:text-content-secondary-dark">
                The Genie requires an AI connection to function. Please check your API settings.
              </p>
            </div>
            <Button variant="secondary" onClick={() => setView('profile')}>Configure API Key</Button>
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
                <Card 
                  key={idx}
                  onClick={() => !loadingRecipe && selectGenieIdea(idea)}
                  className={`cursor-pointer group hover:ring-2 hover:ring-primary/50 dark:hover:ring-primary-dark/50 transition-all active:scale-[0.98] animate-in slide-in-from-bottom-2 duration-300 relative ${loadingRecipe ? 'opacity-50 pointer-events-none' : ''}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail Section */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline/50 dark:border-outline-dark/50 flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-105">
                      {idea.emoji}
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <h4 className="text-base font-bold text-content dark:text-content-dark google-sans group-hover:text-primary dark:group-hover:text-primary-dark transition-colors mb-1 truncate">
                        {idea.title}
                      </h4>
                      <p className="text-sm text-content-secondary dark:text-content-secondary-dark line-clamp-2 leading-relaxed">
                        {idea.summary}
                      </p>
                    </div>

                    {/* Action Icon */}
                    <div className="self-center pl-2">
                      <div className="p-2 rounded-full bg-surface-variant dark:bg-surface-variant-dark group-hover:bg-primary-container dark:group-hover:bg-primary-container-dark text-content-tertiary dark:text-content-tertiary-dark group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center min-h-[40vh]">
              <EmptyState 
                icon={<CookingPot />}
                title="Kitchen Genie"
                description="Tell me what ingredients you have, and I'll suggest what to cook."
              />
            </div>
          )}

          {/* Prompt Bar - In flow at the bottom */}
          <div className="pt-4 mt-auto">
             <PromptInput 
                value={genieInput}
                onChange={setGenieInput}
                onSubmit={generateGenieIdeasAction}
                loading={genieLoading || loadingRecipe}
                placeholder="What's in your fridge?"
                error={error}
                className="text-lg shadow-xl"
                actions={
                  <>
                    <button type="button" className="p-2 text-content-secondary dark:text-content-secondary-dark hover:bg-surface dark:hover:bg-surface-dark rounded-lg transition-colors" title="Rewrite">
                      <Sparkles className="w-5 h-5 opacity-60" />
                    </button>
                    <button type="button" className="p-2 text-content-secondary dark:text-content-secondary-dark hover:bg-surface dark:hover:bg-surface-dark rounded-lg transition-colors" title="Voice input">
                      <Mic className="w-5 h-5 opacity-60" />
                    </button>
                    <button type="button" className="p-2 text-content-secondary dark:text-content-secondary-dark hover:bg-surface dark:hover:bg-surface-dark rounded-lg transition-colors" title="Add context">
                      <Plus className="w-5 h-5 opacity-60" />
                    </button>
                  </>
                }
              />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};