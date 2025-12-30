
import React from 'react';
import { ChefHat } from 'lucide-react';
import { SectionCard, ListRow, EditableList } from './UI';
import { useRecipeContext } from '../context/RecipeContext';

export const InstructionsSection: React.FC = () => {
  const { activeRecipe: recipe, setActiveRecipe: setRecipe, isEditing } = useRecipeContext();

  if (!recipe) return null;

  const updateStep = (idx: number, val: string) => {
    const updated = [...recipe.instructions];
    updated[idx] = val;
    setRecipe(p => p ? ({ ...p, instructions: updated }) : null);
  };
  const removeStep = (idx: number) => setRecipe(p => p ? ({ ...p, instructions: p.instructions.filter((_, i) => i !== idx) }) : null);
  const addStep = () => setRecipe(p => p ? ({ ...p, instructions: [...p.instructions, ''] }) : null);

  return (
    <SectionCard title="Steps" icon={<ChefHat />} noPadding={true}>
      <EditableList
        items={recipe.instructions}
        isEditing={isEditing}
        onAdd={addStep}
        addButtonLabel="Add Step"
        renderItem={(step: string, i: number, editing: boolean) => (
          <ListRow
            key={i}
            leading={<span className="font-mono font-bold text-xs">{String(i + 1).padStart(2, '0')}</span>}
            content={step}
            isEditing={editing}
            onChange={(val: string) => updateStep(i, val)}
            onDelete={() => removeStep(i)}
            placeholder="Describe this step..."
          />
        )}
      />
    </SectionCard>
  );
};
    