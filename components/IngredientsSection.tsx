import React, { useState } from 'react';
import { ShoppingBasket, Scale, ArrowRightLeft } from 'lucide-react';
import { SectionCard, IngredientItem, Badge, EditableList } from './UI';
import { formatQty } from '../utils/helpers';
import { useChefContext } from '../context/ChefContext';
import { Ingredient } from '../types';

export const IngredientsSection: React.FC = () => {
  const { activeRecipe: recipe, setActiveRecipe: setRecipe, isEditing, scalingFactor, setScalingFactor } = useChefContext();
  const [activeScaleIndex, setActiveScaleIndex] = useState<number | null>(null);
  const [tempScaleValue, setTempScaleValue] = useState<string>('');

  if (!recipe) return null;

  const updateIng = (idx: number, field: string, val: any) => {
    const updated = [...recipe.ingredients];
    updated[idx] = { ...updated[idx], [field]: val };
    setRecipe(p => p ? ({ ...p, ingredients: updated }) : null);
  };

  const handleProportionalScale = (idx: number, newVal: string) => {
    setTempScaleValue(newVal);
    const originalQty = recipe.ingredients[idx].quantity;
    const parsedVal = parseFloat(newVal);
    if (!isNaN(parsedVal) && originalQty > 0) setScalingFactor(parsedVal / originalQty);
  };

  const removeIng = (idx: number) => setRecipe(p => p ? ({ ...p, ingredients: p.ingredients.filter((_, i) => i !== idx) }) : null);
  const addIng = () => setRecipe(p => p ? ({ ...p, ingredients: [...p.ingredients, { name: '', quantity: 1, unit: 'g' }] }) : null);

  return (
    <SectionCard
      title="Ingredients"
      icon={<ShoppingBasket />}
      action={!isEditing && <Badge variant="primary" icon={<Scale />} label={`${formatQty(scalingFactor)}x`} />}
    >
      {!isEditing && (
        <div className="px-5 py-2 bg-surface-variant dark:bg-surface-variant-dark border-b border-outline dark:border-outline-dark flex items-center gap-2 transition-colors">
          <ArrowRightLeft className="w-3 h-3 text-primary dark:text-primary-dark" />
          <span className="text-2xs font-bold text-content-tertiary dark:text-content-tertiary-dark uppercase tracking-tight">Click quantity to scale</span>
        </div>
      )}
      
      <EditableList<Ingredient>
        className="divide-y divide-outline/30 dark:divide-outline-dark/30"
        items={recipe.ingredients}
        isEditing={isEditing}
        onAdd={addIng}
        addButtonLabel="Add Line Item"
        renderItem={(ing, idx, editing) => (
          <IngredientItem
            key={idx}
            name={ing.name}
            quantity={ing.quantity}
            unit={ing.unit}
            scalingFactor={scalingFactor}
            isEditing={editing}
            onChange={(field, val) => updateIng(idx, field, val)}
            onDelete={() => removeIng(idx)}
            scalingMode={activeScaleIndex === idx ? 'input' : 'display'}
            scaleInputValue={tempScaleValue}
            onScaleClick={() => {
               setActiveScaleIndex(idx);
               setTempScaleValue(formatQty(ing.quantity * scalingFactor).toString());
            }}
            onScaleChange={(val) => handleProportionalScale(idx, val)}
            onScaleBlur={() => setActiveScaleIndex(null)}
          />
        )}
      />
    </SectionCard>
  );
};