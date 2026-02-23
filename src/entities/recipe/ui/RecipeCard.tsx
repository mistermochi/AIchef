
import React from 'react';
import { Badge, BaseCard } from '../../../shared/ui';
import { Ingredient } from '../model/types';

/**
 * @component IngredientBadges
 * @description Renders a list of ingredient badges for a recipe card, with a 'more' count if they exceed the limit.
 */
export const IngredientBadges: React.FC<{ ingredients: Ingredient[]; limit?: number }> = ({ ingredients, limit = 3 }) => (
   <>
    <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
      {ingredients.slice(0, limit).map((ing, idx) => (
        <Badge key={idx} variant="neutral" label={ing.name} className="max-w-[100px] truncate shrink-0" />
      ))}
      {ingredients.length > limit && (
        <span className="text-2xs font-bold text-content-tertiary dark:text-content-tertiary-dark self-center px-1 shrink-0">
          +{ingredients.length - limit}
        </span>
      )}
    </div>
    <div className="absolute top-3 right-0 bottom-0 w-12 bg-gradient-to-l from-surface to-transparent dark:from-surface-dark pointer-events-none" />
   </>
);

/**
 * @component RecipeSkeleton
 * @description A skeleton loading state for a recipe card.
 */
export const RecipeSkeleton = () => (
  <BaseCard noPadding className="h-full border-outline/50 dark:border-outline-dark/50">
    <div className="aspect-[4/3] bg-surface-variant/80 dark:bg-surface-variant-dark/80 animate-pulse" />
    <div className="p-4 flex flex-col gap-3 flex-1">
      <div className="space-y-2">
        <div className="h-5 bg-surface-variant dark:bg-surface-variant-dark rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-surface-variant/50 dark:bg-surface-variant-dark/50 rounded w-full animate-pulse" />
      </div>
      <div className="mt-auto pt-3 border-t border-outline/30 dark:border-outline-dark/30 flex gap-2">
         <div className="h-5 w-16 bg-surface-variant/50 dark:bg-surface-variant-dark/50 rounded animate-pulse" />
      </div>
    </div>
  </BaseCard>
);
