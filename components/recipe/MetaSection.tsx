
import React, { useRef } from 'react';
import { UploadCloud, Trash2, Link as LinkIcon } from 'lucide-react';
import { Recipe } from '../../types';
import { Input, Textarea } from '../UI';
import { compressImage } from '../../utils/helpers';
import { useRecipeSessionContext } from '../../context/RecipeSessionContext';

interface MetaSectionProps {
  readOnly?: boolean;
  overrideTitle?: string;
  overrideSummary?: React.ReactNode;
  overrideImage?: string | null;
  overrideEmoji?: string;
}

export const MetaSection: React.FC<MetaSectionProps> = ({ 
  readOnly, 
  overrideTitle, 
  overrideSummary, 
  overrideImage, 
  overrideEmoji 
}) => {
  // If readonly, we don't use the context at all
  const context = !readOnly ? useRecipeSessionContext() : null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = readOnly ? false : context?.isEditing;
  
  // Construct a display object. 
  const data = readOnly ? {
    title: overrideTitle || '',
    summary: overrideSummary,
    coverImage: overrideImage,
    emoji: overrideEmoji,
    sourceUrl: null
  } : context?.recipe;

  if (!data) return null;

  const updateField = (field: keyof Recipe, value: any) => {
    if (readOnly || !context) return;
    context.setRecipe(prev => prev ? ({ ...prev, [field]: value }) : null);
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
    <div className="flex flex-col gap-2">
      <div 
        className={`w-24 h-24 sm:w-32 sm:h-32 bg-surface-variant dark:bg-surface-variant-dark rounded-lg border border-outline dark:border-outline-dark overflow-hidden flex items-center justify-center relative cursor-pointer group shrink-0 transition-all ${isEditing ? 'hover:border-primary dark:hover:border-primary-dark focus:ring-2 focus:ring-primary/20 outline-none' : ''}`}
        tabIndex={isEditing ? 0 : -1}
        title={isEditing ? "Click to upload or Paste image" : undefined}
        onClick={() => {
          if (isEditing) {
            if (data.coverImage) updateField('coverImage', null);
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
        {data.coverImage ? (
          <img src={data.coverImage} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-40 dark:opacity-60 text-content dark:text-content-dark text-center px-1">
            <span className="text-3xl sm:text-4xl">{data.emoji || '🥘'}</span>
            {isEditing && <span className="text-[8px] font-bold uppercase tracking-tighter">Upload or Paste</span>}
          </div>
        )}
        {isEditing && (
          <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] ${data.coverImage ? 'bg-black/40' : 'bg-black/30'}`}>
            {data.coverImage ? <Trash2 className="text-white w-6 h-6" /> : <UploadCloud className="text-white w-6 h-6" />}
          </div>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
      </div>
    </div>
  );

  return (
    <div className="flex bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-2xl shadow-sm overflow-hidden p-4 md:p-6 flex-row gap-4 items-center transition-colors outline-none ring-offset-2 focus-within:ring-2 ring-primary/20 dark:ring-primary-dark/20" onPaste={handlePaste}>
       <div className="shrink-0">{MediaSlot}</div>
       <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
             <div className="space-y-2 flex-1 min-w-0">
                <div className="text-xl md:text-2xl font-bold text-content dark:text-content-dark google-sans leading-tight">
                   {isEditing ? (
                    <Input 
                      value={data.title} onChange={(e) => updateField('title', e.target.value)}
                      className="font-bold" placeholder="Title"
                    />
                  ) : data.title}
                </div>
                <div className="text-sm text-content-secondary dark:text-content-secondary-dark leading-relaxed">
                   {isEditing ? (
                    <Textarea 
                      value={typeof data.summary === 'string' ? data.summary : ''} 
                      onChange={(e) => updateField('summary', e.target.value)}
                      className="text-sm bg-surface-variant dark:bg-surface-variant-dark min-h-[80px]" 
                      placeholder="Description..."
                    />
                  ) : data.summary}
                </div>
             </div>
          </div>
          {(isEditing || (data as Recipe).sourceUrl) && (
            <div className="mt-2 pt-3 border-t border-outline/50 dark:border-outline-dark/50">
               {isEditing ? (
                <Input 
                  value={(data as Recipe).sourceUrl || ''} onChange={(e) => updateField('sourceUrl', e.target.value)}
                  startIcon={<LinkIcon />} className="text-xs bg-surface-variant dark:bg-surface-variant-dark font-mono py-1.5" placeholder="Source URL (optional)"
                />
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-primary dark:text-primary-dark hover:underline truncate px-1 transition-colors w-full">
                  <LinkIcon className="w-3 h-3 shrink-0" />
                  <a href={(data as Recipe).sourceUrl!.startsWith('http') ? (data as Recipe).sourceUrl : `https://${(data as Recipe).sourceUrl}`} target="_blank" rel="noopener noreferrer" className="truncate flex-1">{(data as Recipe).sourceUrl}</a>
                </div>
              )}
            </div>
          )}
       </div>
    </div>
  );
};
