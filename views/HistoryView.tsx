
import React from 'react';
import { Search, ShoppingCart, Check, CookingPot } from 'lucide-react';
import { Recipe } from '../types';
import { ViewHeader, Input, EmptyState, Card, Badge, RecipeSkeleton, PageLayout, GridList } from '../components/UI';
import { useChefContext } from '../context/ChefContext';

export const HistoryView: React.FC = () => {
  const { 
    searchTerm, setSearchTerm, filteredRecipes, recipesLoading: loading,
    setActiveRecipe, setIsEditing, setScalingFactor,
    shoppingCart, addToCart, removeFromCart
  } = useChefContext();

  const [placeholder, setPlaceholder] = React.useState('Search recipes...');

  React.useEffect(() => {
    const updatePlaceholder = () => {
      setPlaceholder(window.innerWidth < 640 ? 'Search' : 'Search recipes...');
    };
    updatePlaceholder();
    window.addEventListener('resize', updatePlaceholder);
    return () => window.removeEventListener('resize', updatePlaceholder);
  }, []);

  const handleCartClick = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    const cartItem = shoppingCart.find(item => item.recipeId === recipe.id);
    if (cartItem) {
      removeFromCart(cartItem.id);
    } else {
      addToCart(recipe, 1);
    }
  };

  const handleCardClick = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    setIsEditing(false);
    setScalingFactor(1);
  };

  return (
    <PageLayout>
      <ViewHeader 
        title="Cookbook" 
        subtitle="Your personal recipe collection."
        actions={
          <div className="relative w-32 sm:w-64 transition-all duration-300">
            <Input 
              startIcon={<Search className="w-4 h-4" />}
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      />
      {loading ? (
        <GridList>
           {[...Array(8)].map((_, i) => <RecipeSkeleton key={i} />)}
        </GridList>
      ) : filteredRecipes.length > 0 ? (
        <GridList>
          {filteredRecipes.map(recipe => {
            const isInCart = shoppingCart.some(item => item.recipeId === recipe.id);
            
            return (
              <Card 
                key={recipe.id}
                noPadding
                className="group cursor-pointer hover:ring-2 hover:ring-primary/50 dark:hover:ring-primary-dark/50 transition-all active:scale-[0.98] flex flex-col h-full overflow-hidden"
                onClick={() => handleCardClick(recipe)}
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] bg-surface-variant dark:bg-surface-variant-dark overflow-hidden">
                  {recipe.coverImage ? (
                    <img 
                      src={recipe.coverImage} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt={recipe.title}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-content-tertiary dark:text-content-tertiary-dark">
                      <span className="text-6xl select-none">{recipe.emoji || '🥘'}</span>
                    </div>
                  )}

                  <button
                    onClick={(e) => handleCartClick(e, recipe)}
                    className={`absolute bottom-3 right-3 p-2.5 rounded-full shadow-lg transition-transform active:scale-90 flex items-center justify-center ${
                      isInCart 
                        ? 'bg-success text-white' 
                        : 'bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark hover:bg-primary-container dark:hover:bg-primary-container-dark'
                    }`}
                  >
                    {isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-content dark:text-content-dark google-sans line-clamp-1 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-xs text-content-secondary dark:text-content-secondary-dark line-clamp-2 leading-relaxed">
                      {recipe.summary}
                    </p>
                  </div>

                  <div className="mt-auto pt-3 border-t border-outline/50 dark:border-outline-dark/50 relative">
                    <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
                      {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                        <Badge 
                          key={idx} 
                          variant="neutral" 
                          label={ing.name} 
                          className="max-w-[100px] truncate shrink-0"
                        />
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <span className="text-2xs font-bold text-content-tertiary dark:text-content-tertiary-dark self-center px-1 shrink-0">
                          +{recipe.ingredients.length - 3}
                        </span>
                      )}
                    </div>
                    {/* Fade overlay for truncation */}
                    <div className="absolute top-3 right-0 bottom-0 w-12 bg-gradient-to-l from-surface to-transparent dark:from-surface-dark pointer-events-none" />
                  </div>
                </div>
              </Card>
            );
          })}
        </GridList>
      ) : (
        <EmptyState 
          icon={<CookingPot />}
          title="Cookbook is Empty"
          description={searchTerm ? `No recipes found matching "${searchTerm}"` : "Add recipes to start building your cookbook."}
          className="py-12"
        />
      )}
    </PageLayout>
  );
};
