import React, { useState } from 'react';
import { RecipeHeader } from './RecipeHeader';
import { MetaSection } from './MetaSection';
import { IngredientsSection } from './IngredientsSection';
import { InstructionsSection } from './InstructionsSection';
import { TipsSection } from './TipsSection';
import { MakeView } from './MakeView';
import { Recipe, ShoppingListItem } from '../types';

interface RecipeModalProps {
  recipe: Recipe;
  setRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  close: () => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  scalingFactor: number;
  setScalingFactor: (v: number) => void;
  saveRecipe: () => Promise<void>;
  updateRecipe: () => Promise<void>;
  saving: boolean;
  saveError?: string;
  refine: () => Promise<void>;
  refining: boolean;
  refinePrompt: string;
  setRefinePrompt: (v: string) => void;
  refineError?: string;
  shoppingCart: ShoppingListItem[];
  onAddToCart: (r: Recipe, f: number) => void;
  onRemoveFromCart: (id: string) => void;
}

const RecipeModal: React.FC<RecipeModalProps> = (props) => {
  const [isHandsFree, setIsHandsFree] = useState(false);
  const isInCart = !!props.shoppingCart.find(i => i.recipeId === props.recipe.id);

  const handleCartToggle = () => {
    if (isInCart) {
      const item = props.shoppingCart.find(i => i.recipeId === props.recipe.id);
      if (item) props.onRemoveFromCart(item.id);
    } else props.onAddToCart(props.recipe, props.scalingFactor);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={props.close}></div>
      <div className="relative bg-[#f8f9fa] dark:bg-[#0f1114] w-full max-w-7xl h-[94vh] sm:h-[90vh] sm:rounded-xl overflow-hidden flex flex-col border border-[#dadce0] dark:border-[#3c4043] shadow-2xl transition-colors">
        <RecipeHeader 
          recipe={props.recipe} isEditing={props.isEditing} isHandsFree={isHandsFree}
          setIsHandsFree={setIsHandsFree} setIsEditing={props.setIsEditing}
          isInCart={isInCart} handleCartToggle={handleCartToggle}
          onCommit={() => props.recipe.id ? props.updateRecipe() : props.saveRecipe()}
          saving={props.saving} close={props.close}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
          {props.saveError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs py-2 px-4 border-b border-red-100 dark:border-red-900/30 text-center font-bold uppercase tracking-wider">
              {props.saveError}
            </div>
          )}

          {isHandsFree ? (
            <MakeView recipe={props.recipe} scalingFactor={props.scalingFactor} />
          ) : (
            <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
              <div className="lg:col-span-5 space-y-6">
                <MetaSection recipe={props.recipe} setRecipe={props.setRecipe} isEditing={props.isEditing} />
                <IngredientsSection recipe={props.recipe} setRecipe={props.setRecipe} isEditing={props.isEditing} scalingFactor={props.scalingFactor} setScalingFactor={props.setScalingFactor} />
              </div>
              <div className="lg:col-span-7 space-y-6">
                <InstructionsSection recipe={props.recipe} setRecipe={props.setRecipe} isEditing={props.isEditing} />
                <TipsSection 
                  recipe={props.recipe} setRecipe={props.setRecipe} isEditing={props.isEditing} 
                  refining={props.refining} refinePrompt={props.refinePrompt} 
                  setRefinePrompt={props.setRefinePrompt} onRefine={props.refine} 
                  refineError={props.refineError}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;