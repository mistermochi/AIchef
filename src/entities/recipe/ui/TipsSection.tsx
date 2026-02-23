
import React, { useState } from 'react';
import { Info, Sparkles } from 'lucide-react';
import { PromptInput, SectionCard, ListRow, EditableList, Typewriter } from '../../../shared/ui';
import { useRecipeSessionContext } from '../model/RecipeSessionContext';
import { useAuthContext } from '../../../entities/user/model/AuthContext';
import { useRecipeAI } from '../../../entities/recipe/api/useRecipeAI';

export const TipsSection: React.FC = () => {
  const { recipe, setRecipe, isEditing } = useRecipeSessionContext();
  const { isAIEnabled } = useAuthContext();
  const { refineRecipe, loading, error } = useRecipeAI();
  
  const [refinePrompt, setRefinePrompt] = useState('');

  if (!recipe) return null;

  const updateTip = (idx: number, val: string) => {
    const updated = [...(recipe.extractedTips || [])];
    updated[idx] = val;
    setRecipe(p => p ? ({ ...p, extractedTips: updated }) : null);
  };
  const removeTip = (idx: number) => setRecipe(p => p ? ({ ...p, extractedTips: p.extractedTips.filter((_, i) => i !== idx) }) : null);
  const addTip = () => setRecipe(p => p ? ({ ...p, extractedTips: [...(p.extractedTips || []), ''] }) : null);

  const handleRefine = async () => {
      const suggestions = await refineRecipe(recipe, refinePrompt);
      if (suggestions.length > 0) {
          setRecipe(p => p ? ({ ...p, aiSuggestions: [...(p.aiSuggestions || []), ...suggestions] }) : null);
          setRefinePrompt('');
      }
  };

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
           onSubmit={handleRefine}
           loading={loading}
           placeholder="Ask AI for new tips or adjustments..."
           error={error}
        />
      )}
    </div>
  );
};
