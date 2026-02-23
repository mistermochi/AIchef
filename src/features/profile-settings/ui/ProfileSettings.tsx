
import React from 'react';
import { ChefHat, Utensils, BrainCircuit } from 'lucide-react';
import { SectionCard, Input, Badge, Textarea } from '../../../shared/ui';
import { useAuthContext } from '../../../entities/user/model/AuthContext';
import { DIETARY_LIST, APPLIANCE_LIST } from '../../../shared/config/app';

export const ProfileSettings: React.FC = () => {
  const { profile, updateProfile } = useAuthContext();

  const toggleArrayItem = (field: 'appliances' | 'dietary', value: string) => {
    const list = profile[field];
    const next = list.includes(value) ? list.filter(i => i !== value) : [...list, value];
    updateProfile({ [field]: next });
  };

  return (
    <>
      <SectionCard title="The Chef" icon={<ChefHat />}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Units</label>
              <div className="flex bg-surface-variant dark:bg-surface-variant-dark rounded-lg p-1 border border-outline dark:border-outline-dark">
                 {['metric', 'imperial'].map(u => (
                   <button key={u} onClick={() => updateProfile({ measurements: u as any })} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${profile.measurements === u ? 'bg-white dark:bg-primary-dark text-primary dark:text-surface shadow-sm' : 'text-content-tertiary'}`}>
                     {u}
                   </button>
                 ))}
              </div>
            </div>
            <div>
              <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Default Servings</label>
              <Input
                type="number"
                value={profile.defaultServings}
                onChange={(e) => updateProfile({ defaultServings: parseInt(e.target.value) || 2 })}
                className="h-[38px]"
              />
            </div>
          </div>

          <div>
             <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Dietary Restrictions</label>
             <div className="flex flex-wrap gap-2">
                {DIETARY_LIST.map(diet => (
                  <Badge
                    key={diet}
                    label={diet}
                    variant={profile.dietary.includes(diet) ? 'primary' : 'neutral'}
                    className="cursor-pointer select-none"
                    onClick={() => toggleArrayItem('dietary', diet)}
                  />
                ))}
             </div>
          </div>

          <div>
            <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Dislikes & Allergies</label>
            <Input
              placeholder="e.g. No cilantro, peanut allergy..."
              value={profile.dislikes}
              onChange={(e) => updateProfile({ dislikes: e.target.value })}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="The Kitchen" icon={<Utensils />}>
         <div className="space-y-6">
            <div>
              <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Available Appliances</label>
              <div className="flex flex-wrap gap-2">
                  {APPLIANCE_LIST.map(app => (
                    <Badge
                      key={app}
                      label={app}
                      variant={profile.appliances.includes(app) ? 'primary' : 'neutral'}
                      className="cursor-pointer select-none"
                      onClick={() => toggleArrayItem('appliances', app)}
                    />
                  ))}
              </div>
            </div>

            <div>
               <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Skill Level</label>
               <div className="flex bg-surface-variant dark:bg-surface-variant-dark rounded-lg p-1 border border-outline dark:border-outline-dark">
                 {['beginner', 'pro'].map(level => (
                   <button key={level} onClick={() => updateProfile({ skillLevel: level as any })} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${profile.skillLevel === level ? 'bg-white dark:bg-primary-dark text-primary dark:text-surface shadow-sm' : 'text-content-tertiary'}`}>
                     {level}
                   </button>
                 ))}
              </div>
            </div>
         </div>
      </SectionCard>

      <SectionCard title="Custom Instructions" icon={<BrainCircuit />}>
        <Textarea
          className="h-32 bg-surface-variant dark:bg-surface-variant-dark resize-none"
          placeholder="Any other rules for the AI? (e.g. 'I love spicy food', 'Prefer quick meals')"
          value={profile.customInstructions}
          onChange={(e) => updateProfile({ customInstructions: e.target.value })}
        />
      </SectionCard>
    </>
  );
};
