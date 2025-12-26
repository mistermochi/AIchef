
import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, Trash2, Layers, 
  Cpu, X, CookingPot, Utensils, ListChecks, Settings2,
  Minus, Plus
} from 'lucide-react';
import { OrchestratorOverlay } from '../components/OrchestratorOverlay';
import { Button, SectionCard, IconButton, ViewHeader, IngredientItem, EmptyState, HeaderAction, HeaderActionSeparator, ActionBar, PageLayout } from '../components/UI';
import { useChefContext } from '../context/ChefContext';

export const ShoppingView: React.FC = () => {
  const { 
    shoppingCart, clearCart, removeFromCart,
    updateCartItemFactor, toBuyCount, doneCount, consolidatedList,
    toggleIngredientCheck, checkedIngredients, setView,
    orchestrationPlan, orchestrationLoading, generateOrchestrationAction
  } = useChefContext();

  const [isConfirming, setIsConfirming] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showOrchestrator, setShowOrchestrator] = useState(false);
  const clearBtnRef = useRef<HTMLDivElement>(null);

  // Handle click outside to reset confirmation state
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clearBtnRef.current && !clearBtnRef.current.contains(event.target as Node)) {
        setIsConfirming(false);
      }
    };

    if (isConfirming) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isConfirming]);

  if (shoppingCart.length === 0) {
    return (
      <EmptyState 
        icon={<ShoppingCart />}
        title="Shopping List is Empty"
        description="Add some recipes from your Cookbook to generate a consolidated shopping list."
        action={<Button onClick={() => setView('cookbook')} icon={<Utensils className="w-4 h-4" />}>Go to Cookbook</Button>}
      />
    );
  }

  const progressPercent = Math.round((doneCount / (toBuyCount + doneCount || 1)) * 100);

  return (
    <>
      <PageLayout>
        {/* Removed h-full here to allow the card to grow and page to scroll */}
        <div className="max-w-4xl mx-auto">
          <ViewHeader 
            title="Shopping List"
            subtitle={
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary dark:text-primary-dark uppercase tracking-wider">{progressPercent}% DONE</span>
                <div className="h-1 w-12 bg-surface-variant dark:bg-surface-variant-dark rounded-full overflow-hidden">
                    <div className="h-full bg-primary dark:bg-primary-dark" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            }
            actions={
              <ActionBar>
                {/* Orchestration Button */}
                <HeaderAction 
                  label={orchestrationLoading ? 'Processing' : orchestrationPlan ? 'Start Cooking' : 'Cook Plan'}
                  icon={orchestrationPlan ? <CookingPot /> : <Cpu />}
                  isActive={!!orchestrationPlan}
                  loading={orchestrationLoading}
                  onClick={orchestrationPlan ? () => setShowOrchestrator(true) : generateOrchestrationAction}
                />
                
                <HeaderActionSeparator />
                
                {/* Sources Toggle */}
                <HeaderAction 
                  label="Sources"
                  icon={<Settings2 />}
                  isActive={showSources}
                  onClick={() => setShowSources(!showSources)}
                />
                
                {/* Clear Cart Button */}
                <div ref={clearBtnRef} className="flex items-center transition-all duration-300">
                  <HeaderAction 
                    label={isConfirming ? "Confirm" : "Clear"}
                    icon={<Trash2 />}
                    variant="danger"
                    className={isConfirming ? "!bg-danger !text-white hover:!bg-danger/90 border-danger animate-in zoom-in duration-200" : ""}
                    onClick={() => {
                      if (isConfirming) {
                        clearCart();
                        setIsConfirming(false);
                      } else {
                        setIsConfirming(true);
                      }
                    }}
                  />
                </div>
              </ActionBar>
            }
          />

          {/* 2. THE MAIN LIST - SCROLLS WITH HEADER */}
          <SectionCard
            noPadding
            title={`Consolidated Ingredients (${consolidatedList.length})`}
            icon={<ListChecks />}
            className="flex flex-col min-h-0"
          >
            <div className="divide-y divide-outline dark:divide-outline-dark">
              {consolidatedList.map((ing, idx) => {
                const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
                const isChecked = checkedIngredients.has(key);
                return (
                  <IngredientItem
                    key={idx}
                    name={ing.name}
                    quantity={ing.quantity}
                    unit={ing.unit}
                    isChecked={isChecked}
                    onClick={() => toggleIngredientCheck(key)}
                    onToggle={() => toggleIngredientCheck(key)}
                  />
                );
              })}
            </div>
          </SectionCard>
        </div>
      </PageLayout>

      {/* 3. SOURCES DRAWER */}
      {showSources && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end lg:items-center justify-center p-0 lg:p-4" onClick={() => setShowSources(false)}>
          <SectionCard 
            noPadding
            title="Selected Recipes"
            icon={<Layers />}
            action={<IconButton size="sm" icon={<X className="w-5 h-5"/>} onClick={() => setShowSources(false)} />}
            className="w-full lg:max-w-md rounded-t-3xl lg:rounded-2xl shadow-2xl animate-slide-up max-h-[80vh] flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            <div className="overflow-y-auto divide-y divide-outline dark:divide-outline-dark custom-scrollbar">
              {shoppingCart.map(item => (
                <div key={item.id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-content dark:text-content-dark truncate pr-4">{item.title}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-danger dark:text-danger-dark"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <div className="flex items-center justify-between bg-surface-variant dark:bg-surface-variant-dark p-1.5 rounded-lg border border-outline dark:border-outline-dark">
                    <span className="text-xs font-bold text-content-tertiary dark:text-content-tertiary-dark px-2 uppercase">Scale Factor</span>
                    <div className="flex items-center gap-1 bg-surface dark:bg-surface-dark rounded-md border border-outline dark:border-outline-dark shadow-sm">
                      <button onClick={() => updateCartItemFactor(item.id, item.scalingFactor - 0.5)} className="p-1.5"><Minus className="w-4 h-4 text-content-secondary dark:text-content-secondary-dark"/></button>
                      <span className="text-xs font-mono font-bold w-12 text-center text-primary dark:text-primary-dark">{item.scalingFactor}x</span>
                      <button onClick={() => updateCartItemFactor(item.id, item.scalingFactor + 0.5)} className="p-1.5"><Plus className="w-4 h-4 text-content-secondary dark:text-content-secondary-dark"/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-surface-variant dark:bg-surface-variant-dark border-t border-outline dark:border-outline-dark mt-auto">
              <Button fullWidth onClick={() => setShowSources(false)}>Update List</Button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* 5. MODULAR ORCHESTRATOR OVERLAY */}
      {showOrchestrator && orchestrationPlan && (
        <OrchestratorOverlay 
          plan={orchestrationPlan}
          shoppingCart={shoppingCart} 
          onClose={() => setShowOrchestrator(false)} 
        />
      )}
    </>
  );
};
