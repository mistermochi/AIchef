import React from 'react';
import { Check, Edit3, X, ShoppingCart, Play, Minimize2, Loader2 } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeHeaderProps {
  recipe: Recipe;
  isEditing: boolean;
  isHandsFree: boolean;
  setIsHandsFree: (v: boolean) => void;
  setIsEditing: (v: boolean) => void;
  isInCart: boolean;
  handleCartToggle: () => void;
  onCommit: () => void;
  saving: boolean;
  close: () => void;
}

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  recipe, isEditing, isHandsFree, setIsHandsFree, setIsEditing,
  isInCart, handleCartToggle, onCommit, saving, close
}) => (
  <header className="h-14 border-b border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#1b1b1b] flex items-center justify-between px-6 shrink-0 z-50 transition-colors">
    <div className="flex items-center gap-3 min-w-0">
      <span className="hidden md:inline text-[13px] text-[#444746] dark:text-[#8e918f] font-medium">Cookbook</span>
      <span className="hidden md:inline text-[#bdc1c6] dark:text-[#5f6368] text-sm">/</span>
      <span className="text-[15px] font-bold text-[#1f1f1f] dark:text-[#e3e3e3] truncate google-sans">
        {recipe.title || 'Untitled Adapter'}
      </span>
    </div>

    <div className="flex items-center gap-2">
      {!isEditing && (
        <button 
          onClick={() => setIsHandsFree(!isHandsFree)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
            isHandsFree ? 'text-[#0b57d0] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#2d2e30]' : 'text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2e30]'
          }`}
        >
          {isHandsFree ? <Minimize2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="hidden sm:inline">{isHandsFree ? 'Exit' : 'Make'}</span>
        </button>
      )}

      {!isEditing && !isHandsFree && (
        <button 
          onClick={handleCartToggle}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
            isInCart ? 'text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40' : 'text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2e30] border border-transparent dark:border-[#3c4043]'
          }`}
        >
          {isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          <span className="hidden sm:inline">{isInCart ? 'In Cart' : 'Shop'}</span>
        </button>
      )}

      {!isHandsFree && (
        <button 
          onClick={() => isEditing ? onCommit() : setIsEditing(true)}
          disabled={saving}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
            isEditing ? 'text-[#0b57d0] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#2d2e30] border border-[#d2e3fc] dark:border-[#3c4043]' : 'text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2e30] border border-transparent'
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isEditing ? 'Commit' : 'Edit'}</span>
        </button>
      )}

      <div className="w-px h-6 bg-[#dadce0] dark:bg-[#3c4043] mx-1"></div>
      <button onClick={close} className="p-2 hover:bg-[#ffdad6] dark:hover:bg-red-900/30 hover:text-[#ba1a1a] dark:hover:text-[#ffb4ab] rounded-lg transition-all text-[#444746] dark:text-[#c4c7c5]">
        <X className="w-5 h-5" />
      </button>
    </div>
  </header>
);