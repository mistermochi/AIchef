
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useChefAI } from './hooks/useChefAI';
import { Navigation } from './components/Navigation';
import { HomeView } from './views/HomeView';
import { HistoryView } from './views/HistoryView';
import { ShoppingView } from './views/ShoppingView';
import { ProfileView } from './views/ProfileView';
import { GenieView } from './views/GenieView';
import RecipeModal from './components/RecipeModal';

export default function ChefAIApp() {
  const {
    user,
    view,
    setView,
    preferences,
    setPreferences,
    recipeInput,
    setRecipeInput,
    genieInput,
    setGenieInput,
    genieIdeas,
    genieLoading,
    generateGenieIdeasAction,
    selectGenieIdea,
    orchestrationPlan,
    orchestrationLoading,
    generateOrchestrationAction,
    loading,
    error,
    activeRecipe,
    setActiveRecipe,
    isEditing,
    setIsEditing,
    scalingFactor,
    setScalingFactor,
    refining,
    refinePrompt,
    setRefinePrompt,
    refineError,
    saving,
    saveError,
    savedRecipes,
    searchTerm,
    setSearchTerm,
    shoppingCart,
    setShoppingCart,
    checkedIngredients,
    setCheckedIngredients,
    savePreferences,
    processRecipeAction,
    handleRefineAction,
    handleSaveRecipeAction,
    handleUpdateRecipeAction,
    handleDeleteRecipeAction,
    addToCart,
    removeFromCart,
    updateCartItemFactor,
    clearCart,
    consolidatedList,
    toBuyCount,
    doneCount,
    toggleIngredientCheck,
    filteredRecipes,
    darkMode,
    setDarkMode
  } = useChefAI();

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#0f1114] text-[#0b57d0] gap-4 transition-colors">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-medium text-lg dark:text-white">Initializing ChefAI Studio...</p>
      </div>
    );
  }

  const getBreadcrumb = () => {
    const views = {
      home: 'New Adapter',
      genie: 'Kitchen Genie',
      cookbook: 'Cookbook',
      shopping: 'Shopping List',
      profile: 'Preferences'
    };
    return views[view] || view;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8f9fa] dark:bg-[#0f1114] transition-colors">
      {/* Fixed Sidebar */}
      <Navigation view={view} setView={setView} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] dark:bg-[#0f1114] relative transition-colors">
        {/* Unified Header Bar */}
        <header className="h-12 border-b border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#1b1b1b] flex items-center px-6 shrink-0 z-10 transition-colors">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#444746] dark:text-[#c4c7c5]">
            <span>ChefAI Studio</span>
            <span className="text-[#bdc1c6] dark:text-[#5f6368] text-sm font-normal">/</span>
            <span className="text-[#1f1f1f] dark:text-[#e3e3e3]">{getBreadcrumb()}</span>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-6xl mx-auto h-full">
            {view === 'home' && (
              <HomeView 
                recipeInput={recipeInput}
                setRecipeInput={setRecipeInput}
                preferences={preferences}
                setPreferences={setPreferences}
                savePreferences={savePreferences}
                processRecipeAction={processRecipeAction}
                loading={loading}
                error={error}
              />
            )}

            {view === 'genie' && (
              <GenieView 
                genieInput={genieInput}
                setGenieInput={setGenieInput}
                genieIdeas={genieIdeas}
                genieLoading={genieLoading}
                generateGenieIdeasAction={generateGenieIdeasAction}
                selectGenieIdea={selectGenieIdea}
                loadingRecipe={loading}
                error={error}
              />
            )}

            {view === 'cookbook' && (
              <HistoryView 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredRecipes={filteredRecipes}
                setActiveRecipe={setActiveRecipe}
                setIsEditing={setIsEditing}
                setScalingFactor={setScalingFactor}
                handleDeleteRecipeAction={handleDeleteRecipeAction}
                shoppingCart={shoppingCart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            )}

            {view === 'shopping' && (
              <ShoppingView 
                shoppingCart={shoppingCart}
                clearCart={clearCart}
                removeFromCart={removeFromCart}
                updateCartItemFactor={updateCartItemFactor}
                toBuyCount={toBuyCount}
                doneCount={doneCount}
                consolidatedList={consolidatedList}
                toggleIngredientCheck={toggleIngredientCheck}
                checkedIngredients={checkedIngredients}
                setView={setView}
                orchestrationPlan={orchestrationPlan}
                orchestrationLoading={orchestrationLoading}
                generateOrchestrationAction={generateOrchestrationAction}
              />
            )}

            {view === 'profile' && (
              <ProfileView 
                preferences={preferences}
                setPreferences={setPreferences}
                savePreferences={savePreferences}
                recipeCount={savedRecipes.length}
                cartCount={shoppingCart.length}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            )}
          </div>
        </main>
      </div>

      {activeRecipe && (
        <RecipeModal 
          recipe={activeRecipe}
          setRecipe={setActiveRecipe}
          close={() => setActiveRecipe(null)}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          scalingFactor={scalingFactor}
          setScalingFactor={setScalingFactor}
          saveRecipe={handleSaveRecipeAction}
          updateRecipe={handleUpdateRecipeAction}
          saving={saving}
          saveError={saveError}
          refine={handleRefineAction}
          refining={refining}
          refinePrompt={refinePrompt}
          setRefinePrompt={setRefinePrompt}
          refineError={refineError}
          shoppingCart={shoppingCart}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
        />
      )}
    </div>
  );
}
