
import React from 'react';
import { RecipeHeader } from './RecipeHeader';
import { MetaSection } from './MetaSection';
import { IngredientsSection } from './IngredientsSection';
import { InstructionsSection } from './InstructionsSection';
import { TipsSection } from './TipsSection';
import { MakeView } from './MakeView';
import { Modal, ModalContent } from './UI';
import { useRecipeContext } from '../context/RecipeContext';

const RecipeModal: React.FC = () => {
  const { activeRecipe, setActiveRecipe, saveError, isHandsFree } = useRecipeContext();

  if (!activeRecipe) return null;
  const close = () => setActiveRecipe(null);

  return (
    <Modal onClose={close} size="xl" className="h-[94vh] sm:h-[90vh]">
        <RecipeHeader close={close} />
        
        {saveError && (
          <div className="bg-danger-container dark:bg-danger-container-dark text-danger dark:text-danger-dark text-xs py-2 px-4 border-b border-danger/20 text-center font-bold uppercase tracking-wider shrink-0">
            {saveError}
          </div>
        )}

        {isHandsFree ? (
          <ModalContent noPadding>
            <MakeView />
          </ModalContent>
        ) : (
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
        )}
    </Modal>
  );
};

export default RecipeModal;
