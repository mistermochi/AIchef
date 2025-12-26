import React, { useRef } from 'react';
import { UploadCloud, Trash2, Link as LinkIcon } from 'lucide-react';
import { Recipe } from '../types';
import { Input, Textarea, SummaryCard } from './UI';
import { compressImage } from '../utils/helpers';
import { useChefContext } from '../context/ChefContext';

export const MetaSection: React.FC = () => {
  const { activeRecipe: recipe, setActiveRecipe: setRecipe, isEditing } = useChefContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!recipe) return null;

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

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (!isEditing) return;
    const items = e.clipboardData.items;
    let imagePasted = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          imagePasted = true;
          const reader = new FileReader();
          reader.onload = async (event) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
              const compressed = await compressImage(result);
              updateField('coverImage', compressed);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
    if (imagePasted && e.target instanceof HTMLDivElement) e.preventDefault();
  };

  const MediaSlot = (
    <div 
      className={`w-24 h-24 sm:w-32 sm:h-32 bg-surface-variant dark:bg-surface-variant-dark rounded-lg border border-outline dark:border-outline-dark overflow-hidden flex items-center justify-center relative cursor-pointer group shrink-0 transition-all ${isEditing ? 'hover:border-primary dark:hover:border-primary-dark focus:ring-2 focus:ring-primary/20 outline-none' : ''}`}
      tabIndex={isEditing ? 0 : -1}
      title={isEditing ? "Click to upload or Paste image" : undefined}
      onClick={() => {
        if (isEditing) {
          if (recipe.coverImage) updateField('coverImage', null);
          else fileInputRef.current?.click();
        }
      }}
      onKeyDown={(e) => {
        if (isEditing && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
    >
      {recipe.coverImage ? (
        <img src={recipe.coverImage} className="w-full h-full object-cover" alt="Recipe cover" />
      ) : (
        <div className="flex flex-col items-center gap-1 opacity-40 dark:opacity-60 text-content dark:text-content-dark">
          <span className="text-3xl sm:text-4xl">{recipe.emoji || '🥘'}</span>
          {isEditing && <span className="text-[8px] font-bold uppercase tracking-tighter">Paste Image</span>}
        </div>
      )}
      {isEditing && (
        <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] ${recipe.coverImage ? 'bg-black/40' : 'bg-black/30'}`}>
          {recipe.coverImage ? <Trash2 className="text-white w-6 h-6" /> : <UploadCloud className="text-white w-6 h-6" />}
        </div>
      )}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
    </div>
  );

  return (
    <SummaryCard 
      className="transition-colors outline-none ring-offset-2 focus-within:ring-2 ring-primary/20 dark:ring-primary-dark/20"
      onPaste={handlePaste}
      media={MediaSlot}
      title={isEditing ? (
        <Input 
          value={recipe.title} onChange={(e) => updateField('title', e.target.value)}
          className="font-bold" placeholder="Recipe Title"
        />
      ) : recipe.title}
      description={isEditing ? (
        <Textarea 
          value={recipe.summary} onChange={(e) => updateField('summary', e.target.value)}
          className="text-sm bg-surface-variant dark:bg-surface-variant-dark min-h-[80px]" placeholder="Description..."
        />
      ) : recipe.summary}
      footer={(isEditing || !!recipe.sourceUrl) && (
        isEditing ? (
          <Input 
            value={recipe.sourceUrl || ''} onChange={(e) => updateField('sourceUrl', e.target.value)}
            startIcon={<LinkIcon />} className="text-xs bg-surface-variant dark:bg-surface-variant-dark font-mono py-1.5" placeholder="Source URL (optional)"
          />
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-primary dark:text-primary-dark hover:underline truncate px-1 transition-colors w-full">
            <LinkIcon className="w-3 h-3 shrink-0" />
            <a href={recipe.sourceUrl!.startsWith('http') ? recipe.sourceUrl : `https://${recipe.sourceUrl}`} target="_blank" rel="noopener noreferrer" className="truncate flex-1">{recipe.sourceUrl}</a>
          </div>
        )
      )}
    />
  );
};