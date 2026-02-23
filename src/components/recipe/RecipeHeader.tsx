
import React from 'react';
import { Check, Edit3, ShoppingCart, Play, Minimize2, Trash2 } from 'lucide-react';
import { HeaderAction, ModalHeader, ConfirmButton } from '../UI';
import { useRecipeSessionContext } from '../../context/RecipeSessionContext';
import { useCartContext } from '../../context/CartContext';

export const RecipeHeader: React.FC<{ close: () => void }> = ({ close }) => {
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

  return <ModalHeader title={titleNode} actions={actionsNode} onClose={close} />;
};
