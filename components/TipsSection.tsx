
import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { PromptInput, SectionCard, ListRow, EditableList, Typewriter } from './UI';
import { useRecipeContext } from '../context/RecipeContext';
import { useAuthContext } from '../context/AuthContext';

export const TipsSection: React.FC = () => {
  const { 
    activeRecipe: recipe, setActiveRecipe: setRecipe, isEditing, 
    refining, refinePrompt, setRefinePrompt, handleRefineAction: refine, refineError 
  } = useRecipeContext();
  const { isAIEnabled } = useAuthContext();

  if (!recipe) return null;

  const updateTip = (idx: number, val: string) => {
    const updated = [...(recipe.extractedTips || [])];
    updated[idx] = val;
    setRecipe(p => p ? ({ ...p, extractedTips: updated }) : null);
  };
  const removeTip = (idx: number) => setRecipe(p => p ? ({ ...p, extractedTips: p.extractedTips.filter((_, i) => i !== idx) }) : null);
  const addTip = () => setRecipe(p => p ? ({ ...p, extractedTips: [...(p.extractedTips || []), ''] }) : null);

  return (
    <div className="space-y-6">
      {(isEditing || (recipe.extractedTips && recipe.extractedTips.length > 0)) && (
        <SectionCard title="Tips" icon={<Info />} noPadding={true}>
          <EditableList
            items={recipe.extractedTips || []}
            isEditing={isEditing}
            onAdd={addTip}
            addButtonLabel="Add Tip"
            renderItem={(tip: string, idx: number, editing: boolean) => (
              <ListRow
                key={idx}
                leading={<Info className="w-4 h-4 text-content-tertiary dark:text-content-tertiary-dark" />}
                content={tip}
                isEditing={editing}
                onChange={(val: string) => updateTip(idx, val)}
                onDelete={() => removeTip(idx)}
                placeholder="Add a helpful tip..."
              />
            )}
          />
        </SectionCard>
      )}

      {(recipe.aiSuggestions && recipe.aiSuggestions.length > 0) && (
        <SectionCard title="AI tips" icon={<Sparkles />} noPadding={true}>
          <div>
            {(recipe.aiSuggestions || []).map((tip, idx) => (
               <ListRow 
                  key={idx} 
                  leading={<Sparkles className="w-4 h-4 text-primary dark:text-primary-dark" />} 
                  content={<Typewriter text={tip} speed={20} animate={!recipe.id} />} 
                  isEditing={false} 
                />
            ))}
          </div>
        </SectionCard>
      )}

      {!isEditing && isAIEnabled && (
        <PromptInput 
           value={refinePrompt} 
           onChange={setRefinePrompt}
           onSubmit={refine}
           loading={refining}
           placeholder="Ask AI for new tips or adjustments..."
           error={refineError}
        />
      )}
    </div>
  );
};
    