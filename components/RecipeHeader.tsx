
import React from 'react';
import { Check, Edit3, ShoppingCart, Play, Minimize2 } from 'lucide-react';
import { HeaderAction, ModalHeader } from './UI';
import { useRecipeContext } from '../context/RecipeContext';
import { useCartContext } from '../context/CartContext';

export const RecipeHeader: React.FC<{ close: () => void }> = ({ close }) => {
  const { 
    activeRecipe: recipe, isEditing, isHandsFree, setIsHandsFree, setIsEditing, 
    handleSaveRecipeAction, handleUpdateRecipeAction, saving, scalingFactor
  } = useRecipeContext();

  const { cart: shoppingCart, addToCart, removeFromCart } = useCartContext();

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

  const titleNode = (
    <div className="flex items-center gap-3">
      <span className="hidden md:inline text-sm text-content-secondary dark:text-content-secondary-dark font-medium">Cookbook</span>
      <span className="hidden md:inline text-outline dark:text-content-tertiary-dark text-sm">/</span>
      <span className="text-sm font-bold text-content dark:text-content-dark truncate google-sans">
        {recipe.title || 'Untitled Adapter'}
      </span>
    </div>
  );

  const actionsNode = (
    <>
      {!isEditing && (
        <HeaderAction 
          label={isHandsFree ? 'Exit' : 'Make'}
          icon={isHandsFree ? <Minimize2 /> : <Play />}
          active={isHandsFree}
          onClick={() => setIsHandsFree(!isHandsFree)}
        />
      )}
      {!isEditing && !isHandsFree && (
        <HeaderAction 
          label={isInCart ? 'In Cart' : 'Shop'}
          icon={isInCart ? <Check /> : <ShoppingCart />}
          active={isInCart}
          activeColor="success"
          onClick={handleCartToggle}
        />
      )}
      {!isHandsFree && (
        <HeaderAction 
          label={isEditing ? 'Save' : 'Edit'}
          icon={isEditing ? <Check /> : <Edit3 />}
          active={isEditing}
          onClick={() => isEditing ? onCommit() : setIsEditing(true)}
          loading={saving}
        />
      )}
    </>
  );

  return <ModalHeader title={titleNode} actions={actionsNode} onClose={close} />;
};
