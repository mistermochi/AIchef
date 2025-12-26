import React from 'react';
import { RecipeHeader } from './RecipeHeader';
import { MetaSection } from './MetaSection';
import { IngredientsSection } from './IngredientsSection';
import { InstructionsSection } from './InstructionsSection';
import { TipsSection } from './TipsSection';
import { MakeView } from './MakeView';
import { Modal } from './UI';
import { useChefContext } from '../context/ChefContext';

const RecipeModal: React.FC = () => {
  const { 
    activeRecipe, setActiveRecipe,
    saveError, isHandsFree
  } = useChefContext();

  if (!activeRecipe) return null;

  const close = () => setActiveRecipe(null);

  return (
    <Modal onClose={close} size="xl" className="h-[94vh] sm:h-[90vh]">
        <RecipeHeader close={close} />

        <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col bg-surface-variant dark:bg-surface-variant-dark">
          {saveError && (
            <div className="bg-danger-container dark:bg-danger-container-dark text-danger dark:text-danger-dark text-xs py-2 px-4 border-b border-danger/20 text-center font-bold uppercase tracking-wider">
              {saveError}
            </div>
          )}

          {isHandsFree ? (
            <MakeView />
          ) : (
            <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
              <div className="lg:col-span-5 space-y-6">
                <MetaSection />
                <IngredientsSection />
              </div>
              <div className="lg:col-span-7 space-y-6">
                <InstructionsSection />
                <TipsSection />
              </div>
            </div>
          )}
        </div>
    </Modal>
  );
};

export default RecipeModal;