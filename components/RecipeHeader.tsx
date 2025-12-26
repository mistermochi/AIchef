import React from 'react';
import { Check, Edit3, X, ShoppingCart, Play, Minimize2 } from 'lucide-react';
import { HeaderAction, HeaderActionSeparator, ActionBar } from './UI';
import { useChefContext } from '../context/ChefContext';

export const RecipeHeader: React.FC<{ close: () => void }> = ({ close }) => {
  const { 
    activeRecipe: recipe, isEditing, isHandsFree, setIsHandsFree, setIsEditing, 
    handleSaveRecipeAction, handleUpdateRecipeAction, saving,
    shoppingCart, addToCart, removeFromCart, scalingFactor
  } = useChefContext();

  if (!recipe) return null;

  const isInCart = !!shoppingCart.find(i => i.recipeId === recipe.id);
  const onCommit = recipe.id ? handleUpdateRecipeAction : handleSaveRecipeAction;

  const handleCartToggle = () => {
    if (isInCart) {
      const item = shoppingCart.find(i => i.recipeId === recipe.id);
      if (item) removeFromCart(item.id);
    } else {
      addToCart(recipe, scalingFactor);
    }
  };

  return (
    <header className="h-14 border-b border-outline dark:border-outline-dark bg-surface dark:bg-surface-dark flex items-center justify-between px-6 shrink-0 z-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="hidden md:inline text-sm text-content-secondary dark:text-content-secondary-dark font-medium">Cookbook</span>
        <span className="hidden md:inline text-outline dark:text-content-tertiary-dark text-sm">/</span>
        <span className="text-sm font-bold text-content dark:text-content-dark truncate google-sans">
          {recipe.title || 'Untitled Adapter'}
        </span>
      </div>

      <ActionBar>
        {!isEditing && (
          <HeaderAction 
            label={isHandsFree ? 'Exit' : 'Make'}
            icon={isHandsFree ? <Minimize2 /> : <Play />}
            isActive={isHandsFree}
            onClick={() => setIsHandsFree(!isHandsFree)}
          />
        )}

        {!isEditing && !isHandsFree && (
          <HeaderAction 
            label={isInCart ? 'In Cart' : 'Shop'}
            icon={isInCart ? <Check /> : <ShoppingCart />}
            isActive={isInCart}
            activeColor="success"
            onClick={handleCartToggle}
          />
        )}

        {!isHandsFree && (
          <HeaderAction 
            label={isEditing ? 'Save' : 'Edit'}
            icon={isEditing ? <Check /> : <Edit3 />}
            isActive={isEditing}
            onClick={() => isEditing ? onCommit() : setIsEditing(true)}
            loading={saving}
          />
        )}

        <HeaderActionSeparator />
        
        <button 
          onClick={close} 
          className="p-2 hover:bg-danger-container dark:hover:bg-danger-container-dark hover:text-danger dark:hover:text-danger-dark rounded-lg transition-all text-content-secondary dark:text-content-secondary-dark"
        >
          <X className="w-5 h-5" />
        </button>
      </ActionBar>
    </header>
  );
};