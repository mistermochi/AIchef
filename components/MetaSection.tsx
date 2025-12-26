import React, { useRef } from 'react';
import { UploadCloud, Trash2, Link as LinkIcon } from 'lucide-react';
import { Recipe } from '../types';

interface MetaSectionProps {
  recipe: Recipe;
  setRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  isEditing: boolean;
}

const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      let width = img.width;
      let height = img.height;
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};

export const MetaSection: React.FC<MetaSectionProps> = ({ recipe, setRecipe, isEditing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof Recipe, value: any) => {
    setRecipe(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const compressed = await compressImage(ev.target.result as string);
          updateField('coverImage', compressed);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="studio-card p-4 bg-white dark:bg-[#1b1b1b] flex flex-row gap-4 items-start border-[#dadce0] dark:border-[#3c4043] transition-colors">
      <div 
        className="w-24 h-24 sm:w-32 sm:h-32 bg-[#f1f3f4] dark:bg-[#0f1114] rounded-lg border border-[#dadce0] dark:border-[#3c4043] overflow-hidden flex items-center justify-center relative cursor-pointer group shrink-0"
        onClick={() => {
          if (isEditing) {
            if (recipe.coverImage) updateField('coverImage', null);
            else fileInputRef.current?.click();
          }
        }}
      >
        {recipe.coverImage ? (
          <img src={recipe.coverImage} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-40 dark:opacity-60">
            <span className="text-3xl sm:text-4xl">{recipe.emoji || '🥘'}</span>
          </div>
        )}
        {isEditing && (
          <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] ${recipe.coverImage ? 'bg-black/40' : 'bg-black/30'}`}>
            {recipe.coverImage ? <Trash2 className="text-white w-6 h-6" /> : <UploadCloud className="text-white w-6 h-6" />}
          </div>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        {isEditing ? (
          <input 
            value={recipe.title} onChange={(e) => updateField('title', e.target.value)}
            className="text-base font-bold w-full bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-lg px-3 py-1.5 focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] outline-none google-sans text-[#1f1f1f] dark:text-white"
            placeholder="Adapter Title"
          />
        ) : (
          <h2 className="text-lg font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans px-1 leading-tight truncate">{recipe.title}</h2>
        )}
        
        {isEditing ? (
          <textarea 
            value={recipe.summary} onChange={(e) => updateField('summary', e.target.value)}
            className="text-[12px] w-full bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-lg p-2.5 outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] text-[#1f1f1f] dark:text-white resize-none"
            rows={2} placeholder="Describe this adaptation..."
          />
        ) : (
          <p className="text-[12px] text-[#444746] dark:text-[#c4c7c5] leading-relaxed italic border-l-2 border-[#0b57d0] dark:border-[#8ab4f8] pl-3 py-0.5 line-clamp-3 transition-colors">
            {recipe.summary}
          </p>
        )}

        {isEditing ? (
          <div className="relative group/url">
            <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#bdc1c6] dark:text-[#5f6368]" />
            <input 
              value={recipe.sourceUrl || ''} 
              onChange={(e) => updateField('sourceUrl', e.target.value)}
              className="text-[11px] w-full bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] font-mono text-[#1f1f1f] dark:text-white"
              placeholder="Source URL (optional)"
            />
          </div>
        ) : recipe.sourceUrl && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#0b57d0] dark:text-[#8ab4f8] hover:underline truncate px-1 transition-colors">
            <LinkIcon className="w-3 h-3 shrink-0" />
            <a href={recipe.sourceUrl.startsWith('http') ? recipe.sourceUrl : `https://${recipe.sourceUrl}`} target="_blank" rel="noopener noreferrer" className="truncate">{recipe.sourceUrl}</a>
          </div>
        )}
      </div>
    </div>
  );
};