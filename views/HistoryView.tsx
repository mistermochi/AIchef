
import React from 'react';
import { Search, ShoppingCart, Check, BookOpen, Clock, CookingPot } from 'lucide-react';
import { Recipe, ShoppingListItem } from '../types';

interface HistoryViewProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredRecipes: Recipe[];
  setActiveRecipe: (recipe: Recipe) => void;
  setIsEditing: (val: boolean) => void;
  setScalingFactor: (val: number) => void;
  handleDeleteRecipeAction: (id: string, e: React.MouseEvent) => void;
  shoppingCart: ShoppingListItem[];
  addToCart: (recipe: Recipe, factor: number) => void;
  removeFromCart: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  searchTerm, setSearchTerm, filteredRecipes,
  setActiveRecipe, setIsEditing, setScalingFactor,
  shoppingCart, addToCart, removeFromCart
}) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-24 md:pb-4">
      {/* Refined Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans">Cookbook</h2>
          <p className="text-[13px] text-[#444746] dark:text-[#c4c7c5]">Access and manage your adapted recipe models.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e918f] dark:text-[#5f6368]" />
          <input 
            className="w-full bg-white dark:bg-[#1b1b1b] border border-[#dadce0] dark:border-[#3c4043] rounded-lg pl-10 pr-4 py-2 text-[13px] outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#0b57d0] dark:focus:ring-[#8ab4f8] transition-all placeholder:text-[#bdc1c6] dark:placeholder:text-[#5f6368] shadow-sm text-[#1f1f1f] dark:text-[#e3e3e3]"
            placeholder="Search by name or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1">
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => {
              const cartItem = shoppingCart.find(item => item.recipeId === recipe.id);
              const isInCart = !!cartItem;

              const handleCartToggle = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (isInCart && cartItem) {
                  removeFromCart(cartItem.id);
                } else {
                  addToCart(recipe, 1);
                }
              };

              return (
                <div 
                  key={recipe.id}
                  onClick={() => { setActiveRecipe(recipe); setIsEditing(false); setScalingFactor(1); }}
                  className="studio-card group flex flex-col hover:border-[#0b57d0] dark:hover:border-[#8ab4f8] transition-all cursor-pointer overflow-hidden animate-in zoom-in-95 duration-200"
                >
                  {/* Media Header */}
                  <div className="relative h-44 w-full bg-[#f8f9fa] dark:bg-[#0f1114] shrink-0 border-b border-[#dadce0] dark:border-[#3c4043] overflow-hidden">
                    {recipe.coverImage ? (
                      <img src={recipe.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <span className="text-5xl">{recipe.emoji || '🥘'}</span>
                      </div>
                    )}
                    
                    <button
                      onClick={handleCartToggle}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all active:scale-90 ${
                        isInCart 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white dark:bg-[#1b1b1b] text-[#0b57d0] dark:text-[#8ab4f8] hover:bg-[#e8f0fe] dark:hover:bg-[#2d2e30] border border-transparent dark:border-[#3c4043]'
                      }`}
                    >
                      {isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans line-clamp-1 group-hover:text-[#0b57d0] dark:group-hover:text-[#8ab4f8] transition-colors mb-1">
                      {recipe.title}
                    </h3>
                    
                    <p className="text-[12px] text-[#444746] dark:text-[#c4c7c5] leading-relaxed line-clamp-2 italic mb-4">
                      {recipe.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-[#f1f3f4] dark:border-[#3c4043]">
                      {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                        <span key={idx} className="text-[10px] font-bold uppercase bg-[#f1f3f4] dark:bg-[#2d2e30] px-2 py-0.5 rounded text-[#444746] dark:text-[#c4c7c5] tracking-tight">
                          {ing.name}
                        </span>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <span className="text-[10px] font-bold text-[#8e918f] dark:text-[#5f6368] self-center">
                          +{recipe.ingredients.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-[#f1f3f4] dark:bg-[#2d2e30] rounded-2xl flex items-center justify-center mb-4 transition-colors">
              <CookingPot className="w-8 h-8 text-[#bdc1c6] dark:text-[#5f6368]" />
            </div>
            <h3 className="text-sm font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans uppercase tracking-wider">No Adapters Found</h3>
            <p className="text-[13px] text-[#8e918f] dark:text-[#5f6368] mt-1">
              {searchTerm ? "No matches for current query." : "Cookbook is currently empty."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
