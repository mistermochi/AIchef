
import React from 'react';
import { RecipeHeader } from './RecipeHeader';
import { MetaSection } from './MetaSection';
import { IngredientsSection } from './IngredientsSection';
import { InstructionsSection } from './InstructionsSection';
import { TipsSection } from './TipsSection';
import { MakeView } from './MakeView';
import { Modal, ModalContent } from '../UI';
import { useRecipeContext } from '../../context/RecipeContext';
import { RecipeSessionProvider, useRecipeSessionContext } from '../../context/RecipeSessionContext';

// Inner component that consumes the session context
const RecipeModalContent: React.FC<{ close: () => void }> = ({ close }) => {
  const { recipe, isHandsFree, saveError } = useRecipeSessionContext();

  if (!recipe) return null;

  if (isHandsFree) {
    return <MakeView />;
  }

  return (
    <Modal onClose={close} size="xl" className="h-[94vh] sm:h-[90vh]">
        <RecipeHeader close={close} />
        
        {saveError && (
          <div className="bg-danger-container dark:bg-danger-container-dark text-danger dark:text-danger-dark text-xs py-2 px-4 border-b border-danger/20 text-center font-bold uppercase tracking-wider shrink-0">
            {saveError}
          </div>
        )}

        <ModalContent>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            <div className="lg:col-span-5 space-y-6">
              <MetaSection />
              <IngredientsSection />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <InstructionsSection />
              <TipsSection />
            </div>
          </div>
        </ModalContent>
    </Modal>
  );
};

/**
 * @component RecipeModal
 * @description The main modal for viewing, editing, and cooking a recipe.
 * It uses the `RecipeSessionProvider` to manage local state for the recipe session.
 *
 * Features:
 * - Recipe View: Structured display of recipe meta, ingredients, and instructions.
 * - Hands-Free Mode: Switches to `MakeView` for voice-controlled cooking.
 * - Persistence: Integrates with `RecipeSessionContext` for saving and deleting recipes.
 *
 * Interactions:
 * - {@link useRecipeContext}: For accessing and closing the active recipe.
 * - {@link RecipeSessionProvider}: Provides the session-specific state to child components.
 */
const RecipeModal: React.FC = () => {
  const { activeRecipe, setActiveRecipe } = useRecipeContext();

  if (!activeRecipe) return null;
  const close = () => setActiveRecipe(null);

  return (
    <RecipeSessionProvider initialRecipe={activeRecipe}>
      <RecipeModalContent close={close} />
    </RecipeSessionProvider>
  );
};

export default RecipeModal;
