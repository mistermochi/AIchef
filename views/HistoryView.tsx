
import React, { useState, useEffect } from 'react';
import { Search, CookingPot, Loader2, Plus, PlusCircle, Key, ExternalLink, Info, Check, ShoppingCart, Bot } from 'lucide-react';
import { Recipe } from '../types';
import { ViewHeader, Input, EmptyState, RecipeSkeleton, PageLayout, GridList, Button, Modal, ModalHeader, ModalContent, PromptInput, Card, CardMedia, CardContent, CardTitle, CardDescription, CardFooter, CardFloatingAction, IngredientBadges } from '../components/UI';
import { GlobalFAB } from '../components/layout/GlobalFAB';
import { useRecipeContext } from '../context/RecipeContext';
import { useCartContext } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import { useUIContext } from '../context/UIContext';
import { useRecipeAI } from '../hooks/useRecipeAI';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export const HistoryView: React.FC = () => {
  const { 
    searchTerm, setSearchTerm, filteredRecipes, recipesLoading: loading,
    setActiveRecipe, loadMore, hasMore
  } = useRecipeContext();

  const { processRecipe, loading: aiLoading, error: aiError } = useRecipeAI();
  const { cart: shoppingCart, addToCart, removeFromCart } = useCartContext();
  const { isAIEnabled, openKeySelector, profile } = useAuthContext();
  const { setView } = useUIContext();

  const [placeholder, setPlaceholder] = useState('Search recipes...');
  const [showAddModal, setShowAddModal] = useState(false);
  const [recipeInput, setRecipeInput] = useState('');
  
  // ⚡ Optimization: Use unified infinite scroll for local virtualization and remote loading.
  // This reduces DOM weight by only rendering a subset of recipes at a time.
  const { displayLimit, observerTarget } = useInfiniteScroll(
    filteredRecipes,
    12,
    hasMore ? loadMore : undefined
  );

  useEffect(() => {
    const updatePlaceholder = () => setPlaceholder(window.innerWidth < 640 ? 'Search' : 'Search recipes...');
    updatePlaceholder();
    window.addEventListener('resize', updatePlaceholder);
    return () => window.removeEventListener('resize', updatePlaceholder);
  }, []);

  const handleCartClick = (_: React.MouseEvent, recipe: Recipe) => {
    const cartItem = shoppingCart.find(item => item.recipeId === recipe.id);
    if (cartItem) removeFromCart(cartItem.id);
    else addToCart(recipe, 1);
  };

  const handleCardClick = (recipe: Recipe) => {
    setActiveRecipe(recipe);
  };

  const handleCreate = async () => {
    const result = await processRecipe(recipeInput);
    if (result) {
        setActiveRecipe(result);
        setShowAddModal(false);
        setRecipeInput('');
    }
  };

  const handleManual = () => {
    setActiveRecipe({ 
        title:'New Recipe', 
        emoji:'🥘', 
        summary:'', 
        ingredients:[{name:'',quantity:1,unit:'g'}], 
        instructions:[''], 
        extractedTips:[], 
        aiSuggestions:[] 
    } as Recipe);
    setShowAddModal(false);
  };

  // We simply render whatever filteredRecipes contains. 
  // The list size is now controlled by the backend limit in RecipeRepository.
  return (
    <PageLayout>
      <ViewHeader 
        title="Cookbook" 
        subtitle="Your personal recipe collection."
        actions={
          <div className="flex items-center gap-2">
            <div className="relative w-32 sm:w-64 transition-all duration-300">
              <Input 
                startIcon={<Search className="w-4 h-4" />}
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
              />
            </div>
            {/* Desktop Add Button */}
            <div className="hidden md:block">
              <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
                 Add Recipe
              </Button>
            </div>
          </div>
        }
      />

      {loading && filteredRecipes.length === 0 ? (
        <GridList>
           {[...Array(6)].map((_, i) => <RecipeSkeleton key={i} />)}
        </GridList>
      ) : filteredRecipes.length > 0 ? (
        <>
          <GridList>
            {filteredRecipes.slice(0, displayLimit).map((recipe, idx) => {
              const isInCart = shoppingCart.some(item => item.recipeId === recipe.id);
              
              return (
                <Card 
                  key={recipe.id}
                  onClick={() => handleCardClick(recipe)}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both h-full"
                  style={{ animationDelay: `${(idx % 12) * 40}ms` }}
                >
                  <CardMedia src={recipe.coverImage} fallbackEmoji={recipe.emoji}>
                    <CardFloatingAction 
                      onClick={(e) => handleCartClick(e, recipe)}
                      active={isInCart}
                      icon={isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    />
                  </CardMedia>
                  
                  <CardContent>
                    <div className="space-y-1">
                      <CardTitle>{recipe.title}</CardTitle>
                      <CardDescription>{recipe.summary}</CardDescription>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <IngredientBadges ingredients={recipe.ingredients} limit={3} />
                  </CardFooter>
                </Card>
              );
            })}
          </GridList>

          {/* Loading Trigger / Footer */}
          <div ref={observerTarget} className="p-12 flex justify-center items-center">
            {hasMore ? (
              <div className="flex items-center gap-3 text-content-tertiary">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Loading More...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-30">
                 <div className="w-8 h-1 bg-outline dark:bg-outline-dark rounded-full" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">End of Cookbook</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <EmptyState 
          icon={<CookingPot />}
          title="Cookbook is Empty"
          description={searchTerm ? `No recipes found matching "${searchTerm}"` : "Add recipes to start building your cookbook."}
          className="py-12"
          action={<Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>Add Your First Recipe</Button>}
        />
      )}

      {/* Global FAB for Add Recipe */}
      <GlobalFAB 
        icon={<Plus />} 
        label="New Recipe" 
        onClick={() => setShowAddModal(true)} 
      />

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} size="lg">
          <ModalHeader title="New Recipe" onClose={() => setShowAddModal(false)} />
          
          <ModalContent>
             <div className="max-w-2xl mx-auto space-y-6 w-full">
                {!isAIEnabled ? (
                  profile.aiEnabled === false ? (
                     <div className="p-8 bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-3xl flex flex-col items-center text-center gap-6 shadow-sm">
                       <div className="w-16 h-16 bg-surface-variant dark:bg-surface-variant-dark rounded-full flex items-center justify-center text-content-tertiary">
                         <Bot className="w-8 h-8 opacity-50" />
                       </div>
                       <div className="space-y-2">
                         <h3 className="text-xl font-bold text-content dark:text-content-dark">Manual Mode Active</h3>
                         <p className="text-sm text-content-secondary dark:text-content-secondary-dark max-w-sm">
                           AI features are disabled. Create your recipe from scratch.
                         </p>
                       </div>
                       <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                         <Button fullWidth onClick={handleManual} icon={<PlusCircle className="w-4 h-4" />}>
                           Create Manually
                         </Button>
                         <Button fullWidth variant="ghost" onClick={() => { setShowAddModal(false); setView('profile'); }} icon={<Bot className="w-4 h-4" />}>
                           Enable AI
                         </Button>
                       </div>
                     </div>
                  ) : (
                    <div className="p-8 bg-surface dark:bg-surface-dark border-2 border-dashed border-primary/20 dark:border-primary-dark/20 rounded-3xl flex flex-col items-center text-center gap-6 shadow-sm">
                      <div className="w-16 h-16 bg-primary-container dark:bg-primary-container-dark rounded-full flex items-center justify-center text-primary dark:text-primary-dark">
                        <Key className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-content dark:text-content-dark">Bring Your Own AI Power</h3>
                        <p className="text-sm text-content-secondary dark:text-content-secondary-dark max-w-sm">
                          ChefAI uses your own Google Gemini API key to process recipes securely.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                        <Button fullWidth onClick={openKeySelector} icon={<Key className="w-4 h-4" />}>Select API Key</Button>
                        <Button fullWidth variant="ghost" onClick={handleManual} icon={<PlusCircle className="w-4 h-4" />}>Manual Create</Button>
                      </div>
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary dark:text-primary-dark hover:underline flex items-center gap-1.5">
                        Learn about billing and project setup <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="text-center space-y-2 mb-6">
                         <h3 className="text-xl font-bold text-content dark:text-content-dark google-sans">What are we cooking?</h3>
                         <p className="text-sm text-content-secondary dark:text-content-secondary-dark">Turn any text or URL into a clear recipe.</p>
                      </div>
                      
                      <PromptInput 
                        autoFocus
                        value={recipeInput} 
                        onChange={setRecipeInput} 
                        onSubmit={handleCreate}
                        loading={aiLoading}
                        error={aiError}
                        placeholder="Paste a recipe URL, list ingredients, or describe a dish..."
                        className="text-lg shadow-xl"
                      />

                      <div className="flex items-center justify-center gap-4 pt-4">
                         <span className="text-xs font-bold text-content-tertiary uppercase tracking-widest">OR</span>
                      </div>
                      
                      <Button fullWidth variant="secondary" onClick={handleManual} icon={<PlusCircle className="w-4 h-4" />}>Create Manually</Button>

                      <div className="mt-4 p-4 bg-primary-container/30 dark:bg-primary-container-dark/10 rounded-xl border border-primary/10 dark:border-primary-dark/10 flex gap-4 items-start text-left">
                          <div className="p-2 bg-surface dark:bg-surface-dark rounded-full shrink-0 text-primary dark:text-primary-dark shadow-sm">
                              <Info className="w-4 h-4" />
                          </div>
                          <div>
                              <h4 className="text-sm font-bold text-content dark:text-content-dark mb-1">How it works</h4>
                              <p className="text-xs text-content-secondary dark:text-content-secondary-dark leading-relaxed">
                                  ChefAI extracts ingredients and steps, then formats them to match your cooking style.
                              </p>
                          </div>
                      </div>
                    </div>
                  </>
                )}
             </div>
          </ModalContent>
        </Modal>
      )}
    </PageLayout>
  );
};
