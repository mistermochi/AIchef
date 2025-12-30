
import React, { useState } from 'react';
import { 
  Clock, ChefHat, Utensils, 
  Timer, AlertCircle, ChevronDown, ChevronUp, Scale
} from 'lucide-react';
import { OrchestrationPlan, OrchestrationStep, ShoppingListItem } from '../types';
import { Modal, ModalHeader, ModalContent, Badge, InsightCard, ProcessCard } from './UI';

interface OrchestratorOverlayProps {
  plan: OrchestrationPlan;
  shoppingCart: ShoppingListItem[];
  onClose: () => void;
}

export const OrchestratorOverlay: React.FC<OrchestratorOverlayProps> = ({ plan, shoppingCart, onClose }) => {
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(new Set());

  const toggleIngredients = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getIngredientsForStep = (contextTitle: string) => {
    return shoppingCart.find(i => 
      i.title.trim().toLowerCase() === contextTitle.trim().toLowerCase() ||
      contextTitle.toLowerCase().includes(i.title.toLowerCase()) ||
      i.title.toLowerCase().includes(contextTitle.toLowerCase())
    );
  };

  const getStepIcon = (type: OrchestrationStep['type']) => {
    switch (type) {
      case 'prep': return { icon: ChefHat, color: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' };
      case 'cook': return { icon: Utensils, color: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' };
      case 'wait': return { icon: Clock, color: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' };
      default: return { icon: AlertCircle, color: 'text-content-secondary dark:text-content-secondary-dark', border: 'border-outline dark:border-outline-dark' };
    }
  };

  const headerTitle = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary dark:bg-primary-dark rounded-xl flex items-center justify-center shadow-sm">
        <Timer className="w-5 h-5 text-white" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-content dark:text-content-dark google-sans leading-none">Kitchen Orchestrator</h1>
        <p className="text-xs font-medium text-content-secondary dark:text-content-secondary-dark mt-1 uppercase tracking-wide">
          Unified Workflow Plan
        </p>
      </div>
    </div>
  );

  return (
    <Modal onClose={onClose} size="xl">
        <ModalHeader title={headerTitle} onClose={onClose} />
        
        <ModalContent>
           <div className="max-w-3xl mx-auto space-y-8 w-full">
              
              {/* Summary Card */}
              <InsightCard 
                title="Summary"
                description={plan.optimizedSummary}
                action={<Badge variant="primary" icon={<Clock />} label={`~${plan.totalEstimatedTime} Minutes`} className="px-4 py-2 text-sm" />}
              />

              {/* Timeline */}
              <div className="relative pl-4 md:pl-8">
                 {/* Vertical Line with Animation */}
                 <div className="absolute left-[15px] md:left-[19px] top-4 bottom-4 w-0.5 bg-outline dark:border-outline-dark animate-grow-height origin-top"></div>

                 <div className="space-y-8">
                    {plan.steps.map((step, index) => {
                       const style = getStepIcon(step.type);
                       const StepIcon = style.icon;
                       const isIngExpanded = expandedIngredients.has(step.id);
                       const matchingItem = getIngredientsForStep(step.recipeContext);
                       
                       return (
                          <div 
                            key={step.id} 
                            className="relative flex gap-4 md:gap-8 group transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                            style={{ animationDelay: `${index * 150}ms` }}
                          >
                             
                             {/* Icon Node */}
                             <div 
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-surface-variant dark:ring-surface-variant-dark transition-colors duration-300 bg-surface dark:bg-surface-dark border-2 ${style.border}`}
                             >
                                <StepIcon className={`w-4 h-4 md:w-5 md:h-5 ${style.color}`} />
                             </div>

                             {/* Content Card */}
                             <ProcessCard
                               type={step.type}
                               title={`Step ${index + 1} • ${step.type}`}
                               subtitle={step.estimatedMinutes ? `${step.estimatedMinutes}m` : undefined}
                             >
                                <div className="p-4 md:p-5">
                                    <div className="mb-2 flex items-center gap-2">
                                      <Badge label={step.recipeContext} variant="neutral" />
                                    </div>
                                    <p className="text-sm leading-relaxed transition-colors text-content dark:text-content-dark">
                                      {step.description}
                                    </p>

                                    {/* Ingredient Dropdown */}
                                    {matchingItem && (
                                      <div className="mt-4 pt-4 border-t border-outline dark:border-outline-dark">
                                        <button 
                                          onClick={(e) => toggleIngredients(e, step.id)}
                                          className="flex items-center gap-2 text-xs font-bold uppercase text-primary dark:text-primary-dark hover:bg-primary-container dark:hover:bg-primary-container-dark px-2 py-1.5 -ml-2 rounded-lg transition-colors w-full sm:w-auto"
                                        >
                                            {isIngExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            {isIngExpanded ? 'Hide' : 'View'} Adjusted Ingredients
                                            <Badge variant="primary" label={`${matchingItem.scalingFactor}x`} icon={<Scale />} className="ml-1" />
                                        </button>
                                        
                                        {isIngExpanded && (
                                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-slide-up">
                                            {matchingItem.ingredients.map((ing, idx) => (
                                              <div key={idx} className="flex justify-between items-center p-2.5 bg-surface-variant dark:bg-surface-variant-dark rounded-lg text-xs border border-outline dark:border-outline-dark shadow-sm">
                                                <span className="font-medium text-content-secondary dark:text-content-secondary-dark truncate pr-2">{ing.name}</span>
                                                <span className="font-mono font-bold text-content dark:text-content-dark shrink-0">
                                                  {Number((ing.quantity * matchingItem.scalingFactor).toFixed(2))} {ing.unit}
                                                </span>
                                              </div>
                                            ))}
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

                 {/* Finish Line */}
                 <div className="relative flex gap-4 md:gap-8 pt-8 opacity-40 animate-in fade-in" style={{ animationDelay: `${plan.steps.length * 150}ms` }}>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 z-10 bg-outline dark:bg-outline-dark ring-4 ring-surface-variant dark:ring-surface-variant-dark">
                       <div className="w-3 h-3 bg-surface rounded-full"></div>
                    </div>
                    <div className="flex-1 pt-1.5">
                       <span className="text-sm font-bold text-content-tertiary uppercase tracking-widest">Service</span>
                    </div>
                 </div>

              </div>
           </div>
        </ModalContent>
    </Modal>
  );
};
