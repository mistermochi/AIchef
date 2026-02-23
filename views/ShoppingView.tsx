
import React, { useState } from 'react';
import { ShoppingCart, Trash2, Layers, Cpu, X, ListChecks, Settings2, Minus, Plus, CookingPot, Utensils } from 'lucide-react';
import { OrchestratorOverlay } from '../components/shopping/OrchestratorOverlay';
import { Button, SectionCard, IconButton, ViewHeader, CheckableIngredient, EmptyState, HeaderAction, HeaderActionSeparator, ActionBar, PageLayout, ConfirmButton } from '../components/UI';
import { useCartContext } from '../context/CartContext';
import { useUIContext } from '../context/UIContext';
import { useAuthContext } from '../context/AuthContext';

/**
 * @view ShoppingView
 * @description The Shopping List and Cooking Orchestrator view.
 * It displays a consolidated list of ingredients from recipes added to the cart.
 *
 * Features:
 * - Ingredient Consolidation: Merges identical ingredients across different recipes and calculates total quantities.
 * - Progress Tracking: Check off ingredients as you shop.
 * - Recipe Sources: Manage which recipes are contributing to the shopping list and adjust their scaling factors.
 * - Orchestrator: Launches an AI-generated multi-recipe cooking plan based on the ingredients in the list.
 *
 * Interactions:
 * - {@link useCartContext}: For managing the shopping cart state, ingredient checking, and orchestration logic.
 * - {@link useUIContext}: To navigate back to the cookbook if the list is empty.
 * - {@link useAuthContext}: To check if AI features like the Orchestrator are enabled.
 */
export const ShoppingView: React.FC = () => {
  const { 
    cart: shoppingCart, clearCart, removeFromCart,
    updateCartItemFactor, toBuyCount, doneCount, consolidatedList,
    toggleIngredientCheck, checkedIngredients,
    orchestrationPlan, orchestrationLoading, generateOrchestrationAction
  } = useCartContext();
  
  const { setView } = useUIContext();
  const { isAIEnabled } = useAuthContext();

  const [showSources, setShowSources] = useState(false);
  const [showOrchestrator, setShowOrchestrator] = useState(false);

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
                {isAIEnabled && (
                  <>
                    <HeaderAction 
                      label={orchestrationLoading ? 'Processing' : orchestrationPlan ? 'Start Cooking' : 'Cook Plan'}
                      icon={orchestrationPlan ? <CookingPot /> : <Cpu />}
                      active={!!orchestrationPlan}
                      loading={orchestrationLoading}
                      onClick={orchestrationPlan ? () => setShowOrchestrator(true) : generateOrchestrationAction}
                    />
                    <HeaderActionSeparator />
                  </>
                )}
                <HeaderAction 
                  label="Sources"
                  icon={<Settings2 />}
                  active={showSources}
                  onClick={() => setShowSources(!showSources)}
                />
                <ConfirmButton 
                  isHeaderAction
                  label="Clear"
                  confirmLabel="Confirm"
                  icon={<Trash2 />}
                  onConfirm={clearCart}
                  confirmVariant="danger"
                />
              </ActionBar>
            }
          />

          <SectionCard
            noPadding={true}
            title={`Consolidated Ingredients (${consolidatedList.length})`}
            icon={<ListChecks />}
            className="flex flex-col min-h-0"
          >
            <div className="divide-y divide-outline dark:divide-outline-dark">
              {consolidatedList.map((ing) => {
                const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
                const isChecked = checkedIngredients.has(key);
                return (
                  <CheckableIngredient
                    key={key}
                    name={ing.name}
                    quantity={ing.quantity}
                    unit={ing.unit}
                    isChecked={isChecked}
                    onToggle={() => toggleIngredientCheck(key)}
                  />
                );
              })}
            </div>
          </SectionCard>
        </div>
      </PageLayout>

      {showSources && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end lg:items-center justify-center p-0 lg:p-4" onClick={() => setShowSources(false)}>
          <SectionCard 
            noPadding={true}
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
