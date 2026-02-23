
import React from 'react';
import { ModalHeader } from '../../../shared/ui';

interface RecipeEntityHeaderProps {
  title: string;
  actions?: React.ReactNode;
  onClose: () => void;
  breadcrumb?: string;
}

export const RecipeEntityHeader: React.FC<RecipeEntityHeaderProps> = ({
  title,
  actions,
  onClose,
  breadcrumb = "Recipe"
}) => {
  const titleNode = (
    <div className="flex items-center gap-3">
      <span className="hidden md:inline text-sm text-content-secondary dark:text-content-secondary-dark font-medium">{breadcrumb}</span>
      <span className="hidden md:inline text-outline dark:text-content-tertiary-dark text-sm">/</span>
      <span className="text-sm font-bold text-content dark:text-content-dark truncate google-sans">
        {title || 'Untitled'}
      </span>
    </div>
  );

  return <ModalHeader title={titleNode} actions={actions} onClose={onClose} />;
};
