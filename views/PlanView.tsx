
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Wand2, ShoppingCart, Loader2, Plus, ArrowRight } from 'lucide-react';
import { PageLayout, ViewHeader, Button, Modal, ModalHeader, ModalContent, EmptyState, Input, SectionCard, ListRow } from '../components/UI';
import { PlanConfigForm } from '../components/plan/PlanUI';
import { usePlanController } from '../hooks/controllers/usePlanController';
import { useRecipeContext } from '../context/RecipeContext';
import { Recipe, MealSlot, MealPlanEntry } from '../types';

const SLOT_ORDER: MealSlot[] = ['breakfast', 'lunch', 'tea', 'dinner'];
const SLOT_EMOJIS: Record<MealSlot, string> = { 
    breakfast: '🌅', 
    lunch: '☀️', 
    tea: '☕', 
    dinner: '🌙' 
};
const SLOT_LABELS: Record<MealSlot, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    tea: 'Tea Time',
    dinner: 'Dinner'
};

/**
 * @view PlanView
 * @description The Meal Planner view.
 * It provides a weekly calendar interface where users can organize recipes into different meal slots (Breakfast, Lunch, Tea, Dinner).
 *
 * Features:
 * - Weekly Navigation: Scroll through weeks and view day-by-day plans.
 * - Auto-Plan: Uses AI to generate a weekly meal plan based on the cookbook.
 * - Cart Sync: Synchronizes planned meals with the shopping cart for ingredient aggregation.
 * - Meal Management: Add, edit, or remove recipes from specific dates and slots.
 *
 * Interactions:
 * - {@link usePlanController}: Manages the complex state of the weekly grid and meal plans.
 * - {@link useRecipeContext}: For selecting recipes from the cookbook and setting active recipes.
 */
export const PlanView: React.FC = () => {
  const { state, actions } = usePlanController();
  const { savedRecipes, setActiveRecipe } = useRecipeContext();

  // State
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null); // Stage 1 of adding
  const [pendingSlot, setPendingSlot] = useState<MealSlot>('dinner');
  const [pendingServings, setPendingServings] = useState(2);
  
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [recipeFilter, setRecipeFilter] = useState('');

  // Refs for Auto-scroll
  const todayRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (todayRef.current) {
        todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500); // Slight delay for rendering
    return () => clearTimeout(timer);
  }, [state.startOfWeek]);

  // Helpers
  const handleEntryClick = (entry: MealPlanEntry) => {
      if (entry.id) {
          setEditingEntryId(entry.id);
          // Initialize pending state with current entry values for editing
          setPendingSlot(entry.slot);
          setPendingServings(entry.servings);
      }
  };

  const resetAddState = () => {
      setActiveDate(null);
      setSelectedRecipe(null);
      setRecipeFilter('');
      setPendingSlot('dinner');
      setPendingServings(2);
  };

  const confirmAddMeal = () => {
      if (activeDate && selectedRecipe) {
          actions.addMeal(activeDate, pendingSlot, selectedRecipe, pendingServings);
          resetAddState();
      }
  };

  const confirmUpdateEntry = async () => {
      if (editingEntryId) {
          await actions.updateEntry(editingEntryId, { 
              slot: pendingSlot, 
              servings: pendingServings 
          });
      }
      setEditingEntryId(null);
  };

  const handleSelectRecipe = (r: Recipe) => {
      setSelectedRecipe(r);
      // Reset defaults for stage 2
      setPendingSlot('dinner');
      setPendingServings(2);
  };

  const currentEditingEntry = state.weekPlans.find(p => p.id === editingEntryId);
  const monthLabel = state.startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Normalize today for comparison
  const today = new Date();
  today.setHours(0,0,0,0);

  // Organize data for the list view
  const days = useMemo(() => {
      return state.grid.map(day => {
          // Filter raw plans for safety
          const dayPlans = state.weekPlans.filter(p => p.date === day.dateStr);
          
          // Sort by slot order
          const sortedPlans = dayPlans.sort((a, b) => {
              return SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot);
          });

          return {
              ...day,
              plans: sortedPlans
          };
      });
  }, [state.grid, state.weekPlans]);

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-full">
        
        {/* Header */}
        <ViewHeader 
            title="Meal Planner" 
            subtitle="Organize your culinary week."
            actions={
                <div className="flex items-center gap-2">
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        icon={state.syncing ? <Loader2 className="animate-spin"/> : <ShoppingCart />}
                        onClick={actions.syncToCart}
                        disabled={state.syncing}
                    >
                        Sync
                    </Button>
                    <Button 
                        size="sm" 
                        variant="primary" 
                        icon={state.isGenerating ? <Loader2 className="animate-spin"/> : <Wand2 />}
                        onClick={actions.generateWeek}
                        disabled={state.isGenerating}
                    >
                        Auto-Plan
                    </Button>
                </div>
            }
        />

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6 bg-surface dark:bg-surface-dark p-2 rounded-2xl border border-outline dark:border-outline-dark shadow-sm sticky top-0 z-20">
            <button onClick={actions.prevWeek} className="p-2 hover:bg-surface-variant dark:hover:bg-surface-variant-dark rounded-xl transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <div className="text-center">
                <div className="text-xs font-bold text-content-tertiary uppercase tracking-widest">{monthLabel}</div>
                <div className="text-sm font-bold">Week of {state.startOfWeek.getDate()}th</div>
            </div>
            <button onClick={actions.nextWeek} className="p-2 hover:bg-surface-variant dark:hover:bg-surface-variant-dark rounded-xl transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* Day Cards List */}
        <div className="flex flex-col gap-6 pb-20">
            {days.map((day) => {
                const dayDate = new Date(day.date);
                dayDate.setHours(0,0,0,0);
                
                const isToday = dayDate.getTime() === today.getTime();
                const isPast = dayDate < today;

                return (
                    <div 
                        key={day.dateStr}
                        ref={isToday ? todayRef : null}
                        className={`transition-all duration-500 scroll-mt-32 ${isPast ? 'opacity-50 grayscale-[0.8] hover:opacity-100 hover:grayscale-0' : ''}`}
                    >
                        <SectionCard
                            title={
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-sm font-bold uppercase tracking-wider ${isToday ? 'text-primary dark:text-primary-dark' : 'text-content dark:text-content-dark'}`}>
                                        {day.dayName}
                                    </span>
                                    <span className="text-xs text-content-tertiary font-medium">
                                        {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                    {isToday && <span className="ml-2 text-[10px] bg-primary dark:bg-primary-dark text-white px-1.5 py-0.5 rounded font-bold uppercase">Today</span>}
                                </div>
                            }
                            icon={<Calendar className={isToday ? "text-primary dark:text-primary-dark" : "text-content-tertiary"} />}
                            noPadding={true}
                        >
                            {day.plans.length === 0 ? (
                                <div className="p-6 text-center">
                                    <div className="text-sm text-content-tertiary dark:text-content-tertiary-dark italic">No meals planned.</div>
                                </div>
                            ) : (
                                day.plans.map(entry => (
                                    <ListRow
                                        key={entry.id}
                                        onClick={() => handleEntryClick(entry)}
                                        className="cursor-pointer group"
                                        leading={
                                            <div className="text-xl w-8 text-center" title={SLOT_LABELS[entry.slot]}>
                                                {SLOT_EMOJIS[entry.slot]}
                                            </div>
                                        }
                                        content={
                                            <div className="flex flex-col">
                                                <span className="font-bold text-content dark:text-content-dark">{entry.customTitle}</span>
                                                <div className="flex items-center gap-2 text-xs text-content-secondary dark:text-content-secondary-dark mt-0.5">
                                                    <span>{entry.emoji}</span>
                                                    <span className="text-outline dark:text-outline-dark">•</span>
                                                    <span>{entry.servings} serving{entry.servings > 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        }
                                        actions={
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                                <ChevronRight className="w-4 h-4 text-content-tertiary" />
                                            </div>
                                        }
                                    />
                                ))
                            )}
                            <button 
                                onClick={() => setActiveDate(day.dateStr)}
                                className="w-full py-4 bg-surface-variant/50 dark:bg-surface-variant-dark/30 text-primary dark:text-primary-dark text-xs font-bold uppercase hover:bg-primary-container dark:hover:bg-primary-container-dark border-t border-outline/30 dark:border-outline-dark/30 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Meal
                            </button>
                        </SectionCard>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Add Meal Modal (Two-Stage) */}
      {activeDate && (
          <Modal onClose={resetAddState} size="md">
              <ModalHeader 
                title={selectedRecipe ? "Configure Meal" : "Add Meal"} 
                onClose={resetAddState} 
                subtitle={selectedRecipe ? undefined : "Select a recipe to plan"}
              />
              <ModalContent>
                  {!selectedRecipe ? (
                      // STAGE 1: Select Recipe
                      <>
                        <Input 
                            autoFocus
                            placeholder="Search cookbook..." 
                            value={recipeFilter} 
                            onChange={(e) => setRecipeFilter(e.target.value)}
                            className="mb-4"
                        />
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {savedRecipes
                                .filter(r => r.title.toLowerCase().includes(recipeFilter.toLowerCase()))
                                .map(r => (
                                <button 
                                    key={r.id} 
                                    onClick={() => handleSelectRecipe(r)}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-surface-variant dark:hover:bg-surface-variant-dark rounded-xl transition-colors text-left group"
                                >
                                    <span className="text-2xl">{r.emoji}</span>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm text-content dark:text-content-dark">{r.title}</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-content-tertiary group-hover:text-primary transition-colors" />
                                </button>
                            ))}
                            {savedRecipes.length === 0 && <EmptyState title="Cookbook Empty" description="Add recipes first." />}
                        </div>
                      </>
                  ) : (
                      // STAGE 2: Configure Settings (Using Unified Form)
                      <PlanConfigForm 
                          title={selectedRecipe.title}
                          emoji={selectedRecipe.emoji}
                          slot={pendingSlot}
                          servings={pendingServings}
                          onSlotChange={setPendingSlot}
                          onServingsChange={setPendingServings}
                          onSubmit={confirmAddMeal}
                          submitLabel="Add to Plan"
                      />
                  )}
              </ModalContent>
          </Modal>
      )}

      {/* Edit Entry Modal (Using Unified Form) */}
      {currentEditingEntry && (
          <Modal onClose={() => setEditingEntryId(null)} size="md">
              <ModalHeader title="Edit Meal" onClose={() => setEditingEntryId(null)} />
              <ModalContent>
                  <PlanConfigForm 
                      title={currentEditingEntry.customTitle || 'Unknown Recipe'}
                      emoji={currentEditingEntry.emoji || '🥘'}
                      slot={pendingSlot}
                      servings={pendingServings}
                      onSlotChange={setPendingSlot}
                      onServingsChange={setPendingServings}
                      onSubmit={confirmUpdateEntry}
                      submitLabel="Save Changes"
                      onDelete={() => { actions.removeMeal(currentEditingEntry.id!); setEditingEntryId(null); }}
                      onOpenRecipe={currentEditingEntry.recipeId ? () => {
                          const r = savedRecipes.find(rx => rx.id === currentEditingEntry.recipeId);
                          if(r) { setActiveRecipe(r); setEditingEntryId(null); }
                      } : undefined}
                  />
              </ModalContent>
          </Modal>
      )}

    </PageLayout>
  );
};
