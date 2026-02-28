
import React from 'react';
import { ChefHat, Utensils, BrainCircuit } from 'lucide-react';
import { Input, Badge, Textarea, Label } from '@/shared/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { useAuthContext } from '@/entities/user/model/AuthContext';
import { DIETARY_LIST, APPLIANCE_LIST } from '@/shared/config/app';
import { cn } from '@/shared/lib/utils';

export const ProfileSettings: React.FC = () => {
  const { profile, updateProfile } = useAuthContext();

  const toggleArrayItem = (field: 'appliances' | 'dietary', value: string) => {
    const list = profile[field];
    const next = list.includes(value) ? list.filter(i => i !== value) : [...list, value];
    updateProfile({ [field]: next });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            The Chef
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Units</Label>
              <div className="flex bg-muted rounded-lg p-1 border">
                 {['metric', 'imperial'].map(u => (
                   <button
                     key={u}
                     onClick={() => updateProfile({ measurements: u as any })}
                     className={cn(
                       "flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all",
                       profile.measurements === u
                        ? "bg-background text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     {u}
                   </button>
                 ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Servings</Label>
              <Input
                type="number"
                value={profile.defaultServings}
                onChange={(e) => updateProfile({ defaultServings: parseInt(e.target.value) || 2 })}
              />
            </div>
          </div>

          <div className="space-y-3">
             <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dietary Restrictions</Label>
             <div className="flex flex-wrap gap-2">
                {DIETARY_LIST.map(diet => (
                  <Badge
                    key={diet}
                    label={diet}
                    variant={profile.dietary.includes(diet) ? 'primary' : 'neutral'}
                    onClick={() => toggleArrayItem('dietary', diet)}
                  />
                ))}
             </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dislikes & Allergies</Label>
            <Input
              placeholder="e.g. No cilantro, peanut allergy..."
              value={profile.dislikes}
              onChange={(e) => updateProfile({ dislikes: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            The Kitchen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Appliances</Label>
            <div className="flex flex-wrap gap-2">
                {APPLIANCE_LIST.map(app => (
                  <Badge
                    key={app}
                    label={app}
                    variant={profile.appliances.includes(app) ? 'primary' : 'neutral'}
                    onClick={() => toggleArrayItem('appliances', app)}
                  />
                ))}
            </div>
          </div>

          <div className="space-y-2">
             <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skill Level</Label>
             <div className="flex bg-muted rounded-lg p-1 border">
               {['beginner', 'pro'].map(level => (
                 <button
                   key={level}
                   onClick={() => updateProfile({ skillLevel: level as any })}
                   className={cn(
                     "flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all",
                     profile.skillLevel === level
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                   )}
                 >
                   {level}
                 </button>
               ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            Custom Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[120px] resize-none"
            placeholder="Any other rules for the AI? (e.g. 'I love spicy food', 'Prefer quick meals')"
            value={profile.customInstructions}
            onChange={(e) => updateProfile({ customInstructions: e.target.value })}
          />
        </CardContent>
      </Card>
    </div>
  );
};
