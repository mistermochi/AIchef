
import React, { useState, useMemo } from 'react';
import { 
  Clock, ChefHat, Utensils, 
  Timer, AlertCircle, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Play
} from 'lucide-react';
import { ShoppingListItem } from '../../../shared/model/types';
import { OrchestrationPlan, OrchestrationStep } from '../../../entities/recipe/model/types';
import { Modal, ModalHeader, ModalContent, Badge, InsightCard, ProcessCard, HeaderAction, CountUp } from '../../../shared/ui';
import { MakeViewUI } from '../../recipe-maker/ui/MakeView';
import { useCookingSession } from '../../recipe-maker/model/useRecipeMaker';
import { useCartContext } from '../model/CartContext';

interface OrchestratorOverlayProps {
  plan: OrchestrationPlan;
  shoppingCart: ShoppingListItem[];
  onClose: () => void;
}

/**
 * @component OrchestratorOverlay
 * @description An advanced UI overlay that guides the user through an AI-generated multi-recipe cooking plan.
 * It translates the complex orchestration plan into a linear sequence of steps and integrates with the cooking session controller.
 *
 * Features:
 * - Plan Summary: Shows an AI-generated overview of the cooking strategy.
 * - Timeline View: A vertical timeline of prep, cook, and wait steps.
 * - Contextual Ingredients: Shows relevant ingredients for each step, filtered from the consolidated shopping list.
 * - "Cook Now" Mode: Launches a voice-controlled hands-free session for the entire orchestration plan.
 *
 * Interactions:
 * - {@link useCartContext}: For accessing the consolidated ingredient list.
 * - {@link useCookingSession}: To manage the actual cooking state (voice, steps, timers).
 */
export const OrchestratorOverlay: React.FC<OrchestratorOverlayProps> = ({ plan, shoppingCart, onClose }) => {
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(new Set());
  const [isMakeMode, setIsMakeMode] = useState(false);
  const { consolidatedList } = useCartContext();

  // --- COOKING SESSION LOGIC ---
  
  // Transform Plan into a linear recipe structure for MakeView
  const orchestrationRecipe = useMemo(() => {
     return {
        // Map consolidated shopping list to ingredients
        ingredients: consolidatedList,
        // Map steps to strings, prepending context for clarity in voice/read mode
        instructions: plan.steps.map(step => {
           let typeLabel = '';
           switch(step.type) {
             case 'prep': typeLabel = 'PREP'; break;
             case 'cook': typeLabel = 'COOK'; break;
             case 'wait': typeLabel = 'WAIT'; break;
           }
           // E.g. "[PREP • Sauce] Chop tomatoes."
           return `[${typeLabel} • ${step.recipeContext}] ${step.description}`;
        }),
        // Inject the summary as a tip so it appears in the "Tips" drawer
        extractedTips: [plan.optimizedSummary],
        aiSuggestions: []
     };
  }, [plan, consolidatedList]);

  // Hook into the cooking controller using the transformed data
  const cookingController = useCookingSession({
     recipe: orchestrationRecipe,
     onClose: () => setIsMakeMode(false)
  });

  // --- EXISTING OVERLAY LOGIC ---

  const toggleIngredients = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getRelevantIngredients = (step: OrchestrationStep) => {
    const context = step.recipeContext.toLowerCase();
    const description = step.description.toLowerCase();
    
    let involvedRecipes = shoppingCart.filter(item => 
      context.includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(context)
    );

    const isGenericContext = context.includes('all') || context.includes('全部') || context.includes('綜合') || context.includes('general');
    if (involvedRecipes.length === 0 || isGenericContext) {
      involvedRecipes = shoppingCart;
    }

    if (involvedRecipes.length === 0) return { ingredients: [], count: 0 };

    const mappedIngredients = involvedRecipes.flatMap(item => 
      item.ingredients.map(ing => {
        const isMatch = description.includes(ing.name.toLowerCase());
        return {
          ...ing,
          scalingFactor: item.scalingFactor,
          sourceRecipe: item.title,
          isMatch
        };
      })
    );

    const uniqueMap = new Map<string, typeof mappedIngredients[0]>();
    mappedIngredients.forEach(ing => {
        if (uniqueMap.has(ing.name)) {
            const existing = uniqueMap.get(ing.name)!;
            existing.quantity += ing.quantity; 
            if (ing.isMatch) existing.isMatch = true;
        } else {
            uniqueMap.set(ing.name, { ...ing });
        }
    });
    
    const finalIngredients = Array.from(uniqueMap.values());

    finalIngredients.sort((a, b) => {
      if (a.isMatch && !b.isMatch) return -1;
      if (!a.isMatch && b.isMatch) return 1;
      return a.name.localeCompare(b.name);
    });

    return { 
      ingredients: finalIngredients, 
      count: finalIngredients.length 
    };
  };

  const getStepIcon = (type: OrchestrationStep['type']) => {
    switch (type) {
      case 'prep': return { icon: ChefHat, color: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', label: '準備' };
      case 'cook': return { icon: Utensils, color: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', label: '烹飪' };
      case 'wait': return { icon: Clock, color: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', label: '等待' };
      default: return { icon: AlertCircle, color: 'text-content-secondary dark:text-content-secondary-dark', border: 'border-outline dark:border-outline-dark', label: '其他' };
    }
  };

  const headerTitle = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary dark:bg-primary-dark rounded-xl flex items-center justify-center shadow-sm">
        <Timer className="w-5 h-5 text-white" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-content dark:text-content-dark google-sans leading-none">廚房指揮官</h1>
        <p className="text-xs font-medium text-content-secondary dark:text-content-secondary-dark mt-1 uppercase tracking-wide">
          綜合烹飪流程
        </p>
      </div>
    </div>
  );

  // --- RENDER ---

  if (isMakeMode) {
      return <MakeViewUI state={cookingController.state} actions={cookingController.actions} />;
  }

  return (
    <Modal onClose={onClose} size="xl">
        <ModalHeader 
            title={headerTitle} 
            onClose={onClose} 
            actions={
               <HeaderAction 
                  label="Cook Now" 
                  icon={<Play />} 
                  active={true}
                  activeColor="success"
                  onClick={() => setIsMakeMode(true)} 
               />
            }
        />
        
        <ModalContent>
           <div className="max-w-3xl mx-auto space-y-8 w-full">
              
              <InsightCard 
                title="總結"
                description={plan.optimizedSummary}
                action={<Badge variant="primary" icon={<Clock />} label={`約 ${plan.totalEstimatedTime} 分鐘`} className="px-4 py-2 text-sm" />}
              />

              <div className="relative pl-4 md:pl-8">
                 <div className="absolute left-[15px] md:left-[19px] top-4 bottom-4 w-0.5 bg-outline dark:border-outline-dark animate-grow-height origin-top"></div>

                 <div className="space-y-8">
                    {plan.steps.map((step, index) => {
                       const style = getStepIcon(step.type);
                       const StepIcon = style.icon;
                       const isIngExpanded = expandedIngredients.has(step.id);
                       const { ingredients, count } = getRelevantIngredients(step);
                       
                       return (
                          <div 
                            key={step.id} 
                            className="relative flex gap-4 md:gap-8 group transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                            style={{ animationDelay: `${index * 150}ms` }}
                          >
                             
                             <div 
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-surface-variant dark:ring-surface-variant-dark transition-colors duration-300 bg-surface dark:bg-surface-dark border-2 ${style.border}`}
                             >
                                <StepIcon className={`w-4 h-4 md:w-5 md:h-5 ${style.color}`} />
                             </div>

                             <ProcessCard
                               type={step.type}
                               title={`步驟 ${index + 1} • ${style.label}`}
                               subtitle={step.estimatedMinutes ? `${step.estimatedMinutes} 分鐘` : undefined}
                             >
                                <div className="p-4 md:p-5">
                                    <div className="mb-2 flex items-center gap-2">
                                      <Badge label={step.recipeContext} variant="neutral" />
                                    </div>
                                    <p className="text-sm leading-relaxed transition-colors text-content dark:text-content-dark">
                                      {step.description}
                                    </p>

                                    {count > 0 && (
                                      <div className="mt-4 pt-4 border-t border-outline dark:border-outline-dark">
                                        <button 
                                          onClick={(e) => toggleIngredients(e, step.id)}
                                          className="flex items-center gap-2 text-xs font-bold uppercase text-primary dark:text-primary-dark hover:bg-primary-container dark:hover:bg-primary-container-dark px-2 py-1.5 -ml-2 rounded-lg transition-colors w-full sm:w-auto"
                                        >
                                            {isIngExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            {isIngExpanded ? '隱藏' : '查看'} 相關食材 ({count})
                                            {ingredients.some(i => i.isMatch) && <Sparkles className="w-3 h-3 text-accent" />}
                                        </button>
                                        
                                        {isIngExpanded && (
                                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-slide-up">
                                            {ingredients.map((ing, idx) => {
                                              const finalQty = ing.quantity * ing.scalingFactor;
                                              return (
                                                <div 
                                                  key={idx} 
                                                  className={`flex justify-between items-center p-2.5 rounded-lg text-xs border shadow-sm transition-colors ${
                                                    ing.isMatch 
                                                      ? 'bg-primary-container/20 border-primary/30 dark:bg-primary-container-dark/20 dark:border-primary-dark/30' 
                                                      : 'bg-surface-variant dark:bg-surface-variant-dark border-outline dark:border-outline-dark opacity-80 hover:opacity-100'
                                                  }`}
                                                >
                                                  <div className="flex items-center gap-2 overflow-hidden">
                                                    {ing.isMatch && <CheckCircle2 className="w-3 h-3 text-primary dark:text-primary-dark shrink-0" />}
                                                    <span className={`font-medium truncate pr-2 ${ing.isMatch ? 'text-primary dark:text-primary-dark' : 'text-content-secondary dark:text-content-secondary-dark'}`}>
                                                      {ing.name}
                                                    </span>
                                                  </div>
                                                  <span className="font-mono font-bold text-content dark:text-content-dark shrink-0 flex items-center gap-1">
                                                    <CountUp value={finalQty} /> {ing.unit}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>
                             </ProcessCard>

                          </div>
                       );
                    })}
                 </div>

                 <div className="relative flex gap-4 md:gap-8 pt-8 opacity-40 animate-in fade-in" style={{ animationDelay: `${plan.steps.length * 150}ms` }}>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 z-10 bg-outline dark:bg-outline-dark ring-4 ring-surface-variant dark:ring-surface-variant-dark">
                       <div className="w-3 h-3 bg-surface rounded-full"></div>
                    </div>
                    <div className="flex-1 pt-1.5">
                       <span className="text-sm font-bold text-content-tertiary uppercase tracking-widest">完成上菜</span>
                    </div>
                 </div>

              </div>
           </div>
        </ModalContent>
    </Modal>
  );
};
