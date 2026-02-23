
import React from 'react';
import { Check, Edit3, ShoppingCart, Play, Minimize2, Trash2 } from 'lucide-react';
import { HeaderAction, ConfirmButton } from '../../../shared/ui';
import { useRecipeSessionContext } from '../../../entities/recipe/model/RecipeSessionContext';
import { useCartContext } from '../../shopping-cart/model/CartContext';
import { RecipeEntityHeader } from '../../../entities/recipe/ui/RecipeEntityHeader';

export const CookbookRecipeHeader: React.FC<{ close: () => void }> = ({ close }) => {
  const { 
    recipe, isEditing, isHandsFree, setIsHandsFree, setIsEditing, 
    save, remove, saving, scalingFactor
  } = useRecipeSessionContext();

  const { cart: shoppingCart, addToCart, removeFromCart } = useCartContext();

  if (!recipe) return null;

  const isInCart = !!shoppingCart.find(i => i.recipeId === recipe.id);

  const handleCartToggle = () => {
    if (isInCart) {
      const item = shoppingCart.find(i => i.recipeId === recipe.id);
      if (item) removeFromCart(item.id);
    } else {
      addToCart(recipe, scalingFactor);
    }
  };

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
        <>
          {isEditing && recipe.id && (
            <ConfirmButton 
              isHeaderAction
              label="Delete"
              confirmLabel="Confirm?"
              icon={<Trash2 />} 
              confirmVariant="danger"
              onConfirm={remove}
              loading={saving}
            />
          )}
          <HeaderAction 
            label={isEditing ? 'Save' : 'Edit'}
            icon={isEditing ? <Check /> : <Edit3 />}
            active={isEditing}
            onClick={() => isEditing ? save() : setIsEditing(true)}
            loading={saving}
          />
        </>
      )}
    </>
  );

  return (
    <RecipeEntityHeader
      title={recipe.title}
      actions={actionsNode}
      onClose={close}
      breadcrumb="Cookbook"
    />
  );
};
