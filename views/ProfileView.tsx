
import React, { useEffect, useRef } from 'react';
import { Save, Moon, Sun, Settings2, BrainCircuit, Key, CheckCircle, ExternalLink, ChefHat, Utensils, Database, Trash2, Smartphone, Hand, Eye, Bot, RefreshCw, AlertTriangle, Globe2, Download, Upload, FileJson, FileSpreadsheet, HardDrive } from 'lucide-react';
import { ViewHeader, Switch, Textarea, SectionCard, Button, PageLayout, Badge, Input, ConfirmButton } from '../components/UI';
import { useAuthContext } from '../context/AuthContext';
import { useUIContext } from '../context/UIContext';
import { useBackupRestore } from '../hooks/useBackupRestore';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { APPLIANCE_LIST, DIETARY_LIST } from '../types';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, saveProfile, isAIEnabled, openKeySelector, aiHealth, aiErrorMsg, checkHealth } = useAuthContext();
  const { darkMode, setDarkMode } = useUIContext();
  const { processing, status, exportCookbook, restoreCookbook, exportTracker, restoreTracker } = useBackupRestore();

  const [passValue, setPassValue] = React.useState(() => {
    return localStorage.getItem('chefai_pass') || '';
  });

  // Update localStorage whenever passValue changes
  useEffect(() => {
    localStorage.setItem('chefai_pass', passValue);
  }, [passValue]);

  const recipeFileRef = useRef<HTMLInputElement>(null);
  const trackerFileRef = useRef<HTMLInputElement>(null);

  // Lazy health check: Only validate connection if we don't know the status yet.
  // This allows the background idle check in App.tsx to handle the primary validation,
  // preventing double-checks when navigating here.
  useEffect(() => {
    if (aiHealth === 'unknown') {
      checkHealth();
    }
  }, [checkHealth, aiHealth]);

  const toggleArrayItem = (field: 'appliances' | 'dietary', value: string) => {
    const list = profile[field];
    const next = list.includes(value) ? list.filter(i => i !== value) : [...list, value];
    updateProfile({ [field]: next });
  };

  const getStatusBadge = () => {
    if (profile.aiEnabled === false) return <Badge label="Disabled" variant="neutral" />;
    
    switch (aiHealth) {
      case 'checking': return <Badge label="Checking..." variant="neutral" icon={<RefreshCw className="w-3 h-3 animate-spin" />} />;
      case 'healthy': return <Badge label="Active" variant="success" />;
      case 'region_restricted': return <Badge label="Geo-Restricted" variant="warning" icon={<Globe2 className="w-3 h-3" />} />;
      case 'unhealthy': return <Badge label="Error" variant="warning" icon={<AlertTriangle className="w-3 h-3" />} />;
      default: return <Badge label="Unknown" variant="neutral" />;
    }
  };

  const handleRecipeImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      restoreCookbook(e.target.files[0]);
      e.target.value = ''; // Reset
    }
  };

  const handleTrackerImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      restoreTracker(e.target.files[0]);
      e.target.value = ''; // Reset
    }
  };

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <ViewHeader 
          title="Chef Identity" 
          subtitle="Customize your AI kitchen companion." 
          actions={<Button onClick={saveProfile} icon={<Save className="w-4 h-4" />}>Save Changes</Button>}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* LEFT COLUMN: CONTEXT */}
          <div className="space-y-6">
            
            {/* 1. THE CHEF */}
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

            {/* 2. THE KITCHEN */}
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

            {/* 3. CUSTOM INSTRUCTIONS */}
            <SectionCard title="Custom Instructions" icon={<BrainCircuit />}>
              <Textarea 
                className="h-32 bg-surface-variant dark:bg-surface-variant-dark resize-none"
                placeholder="Any other rules for the AI? (e.g. 'I love spicy food', 'Prefer quick meals')"
                value={profile.customInstructions}
                onChange={(e) => updateProfile({ customInstructions: e.target.value })}
              />
            </SectionCard>
          </div>

          {/* RIGHT COLUMN: SETTINGS */}
          <div className="space-y-6">
            
            {/* 4. STUDIO SETTINGS */}
            <SectionCard title="Studio Settings" icon={<Settings2 />}>
              <div className="space-y-1 divide-y divide-outline/30 dark:divide-outline-dark/30">
                <div onClick={() => updateProfile({ aiEnabled: !profile.aiEnabled })} className="flex items-center justify-between py-3 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full transition-colors ${profile.aiEnabled ? 'bg-primary-container dark:bg-primary-container-dark text-primary dark:text-primary-dark' : 'bg-surface-variant dark:bg-surface-variant-dark text-content-tertiary'}`}>
                       <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-content dark:text-content-dark">AI Features</div>
                      <div className="text-xs text-content-secondary dark:text-content-secondary-dark">Enable Generative AI capabilities</div>
                    </div>
                  </div>
                  <Switch checked={profile.aiEnabled ?? true} onChange={(v) => updateProfile({ aiEnabled: v })} />
                </div>

                <div onClick={() => setDarkMode(!darkMode)} className="flex items-center justify-between py-3 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-primary-dark/20 text-primary-dark' : 'bg-warning/20 text-warning'}`}>
                       {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-content dark:text-content-dark">Dark Mode</div>
                      <div className="text-xs text-content-secondary dark:text-content-secondary-dark">High contrast interface</div>
                    </div>
                  </div>
                  <Switch checked={darkMode} onChange={setDarkMode} />
                </div>

                <div onClick={() => updateProfile({ haptics: !profile.haptics })} className="flex items-center justify-between py-3 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-surface-variant dark:bg-surface-variant-dark text-content-secondary dark:text-content-secondary-dark">
                       <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-content dark:text-content-dark">Haptics</div>
                      <div className="text-xs text-content-secondary dark:text-content-secondary-dark">Vibration feedback on interaction</div>
                    </div>
                  </div>
                  <Switch checked={profile.haptics} onChange={(v) => updateProfile({ haptics: v })} />
                </div>

                <div onClick={() => updateProfile({ autoWakeLock: !profile.autoWakeLock })} className="flex items-center justify-between py-3 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-surface-variant dark:bg-surface-variant-dark text-content-secondary dark:text-content-secondary-dark">
                       <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-content dark:text-content-dark">Auto Wake Lock</div>
                      <div className="text-xs text-content-secondary dark:text-content-secondary-dark">Keep screen on during cooking</div>
                    </div>
                  </div>
                  <Switch checked={profile.autoWakeLock} onChange={(v) => updateProfile({ autoWakeLock: v })} />
                </div>

                <div onClick={() => updateProfile({ airGestures: !profile.airGestures })} className="flex items-center justify-between py-3 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-surface-variant dark:bg-surface-variant-dark text-content-secondary dark:text-content-secondary-dark">
                       <Hand className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-content dark:text-content-dark">Air Gestures</div>
                      <div className="text-xs text-content-secondary dark:text-content-secondary-dark">Enable camera gestures by default</div>
                    </div>
                  </div>
                  <Switch checked={profile.airGestures} onChange={(v) => updateProfile({ airGestures: v })} />
                </div>
              </div>
            </SectionCard>

            {/* 5. BACKUP & RESTORE */}
            <SectionCard title="Data Management" icon={<HardDrive />}>
              <div className="space-y-4">
                {/* Inputs hidden, triggered by buttons */}
                <input type="file" ref={recipeFileRef} onChange={handleRecipeImport} accept="application/json" className="hidden" />
                <input type="file" ref={trackerFileRef} onChange={handleTrackerImport} accept=".csv" className="hidden" />
                
                {status && (
                   <div className="p-3 bg-primary-container/20 text-primary text-xs font-bold rounded-lg border border-primary/20 flex items-center gap-2 animate-in fade-in">
                      {processing && <RefreshCw className="w-3 h-3 animate-spin" />}
                      {status}
                   </div>
                )}

                <div className="p-4 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline dark:border-outline-dark space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-white dark:bg-surface-dark rounded-lg shadow-sm"><FileJson className="w-5 h-5 text-warning" /></div>
                     <div>
                       <div className="text-sm font-bold text-content dark:text-content-dark">Cookbook Backup</div>
                       <div className="text-xs text-content-secondary dark:text-content-secondary-dark">Save recipes as JSON</div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button size="sm" variant="secondary" onClick={exportCookbook} disabled={processing} icon={<Download className="w-3 h-3" />}>Export</Button>
                    <Button size="sm" variant="ghost" onClick={() => recipeFileRef.current?.click()} disabled={processing} icon={<Upload className="w-3 h-3" />}>Restore</Button>
                  </div>
                </div>

                <div className="p-4 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline dark:border-outline-dark space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-white dark:bg-surface-dark rounded-lg shadow-sm"><FileSpreadsheet className="w-5 h-5 text-success" /></div>
                     <div>
                       <div className="text-sm font-bold text-content dark:text-content-dark">Tracker Backup</div>
                       <div className="text-xs text-content-secondary dark:text-content-secondary-dark">Save history as CSV</div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <Button size="sm" variant="secondary" onClick={exportTracker} disabled={processing} icon={<Download className="w-3 h-3" />}>Export</Button>
                     <Button size="sm" variant="ghost" onClick={() => trackerFileRef.current?.click()} disabled={processing} icon={<Upload className="w-3 h-3" />}>Restore</Button>
                  </div>
                </div>

              </div>
            </SectionCard>

            {/* 6. DATA & CONNECTIVITY */}
            <SectionCard title="Data & Connectivity" icon={<Database />}>
               <div className="space-y-6">
                  {/* API KEY */}
                  <div className="p-4 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline dark:border-outline-dark">
                    <div className="flex items-start justify-between gap-4">
                       <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${isAIEnabled ? 'bg-success-container text-success' : (aiHealth === 'unhealthy' || aiHealth === 'region_restricted' ? 'bg-warning-container text-warning' : 'bg-danger-container text-danger')}`}>
                            {(aiHealth === 'unhealthy' || aiHealth === 'region_restricted') ? <AlertTriangle className="w-5 h-5" /> : (isAIEnabled ? <CheckCircle className="w-5 h-5" /> : <Key className="w-5 h-5" />)}
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-content dark:text-content-dark flex items-center gap-2">Gemini API {getStatusBadge()}</h4>
                             <p className="text-xs text-content-secondary dark:text-content-secondary-dark mt-1">
                               {aiErrorMsg ? aiErrorMsg : "Required for Recipe Processing and Genie."}
                             </p>
                          </div>
                       </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                       <Button size="sm" fullWidth onClick={openKeySelector} variant={isAIEnabled ? 'secondary' : 'primary'} icon={<Key className="w-3 h-3" />}>
                         {isAIEnabled ? 'Change Key' : 'Connect Key'}
                       </Button>
                       {(aiHealth === 'unhealthy' || aiHealth === 'region_restricted') && (
                         <Button size="sm" variant="ghost" icon={<RefreshCw className="w-3 h-3" />} onClick={checkHealth}>Retry</Button>
                       )}
                       <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button size="sm" fullWidth variant="ghost" icon={<ExternalLink className="w-3 h-3" />}>Billing</Button>
                       </a>
                    </div>
                    <div className="mt-4 pt-4 border-t border-outline/10">
                        <Input 
                            value={passValue}
                            onChange={(e) => setPassValue(e.target.value)}
                            placeholder="pass"
                            className="bg-surface dark:bg-surface-dark"
                            startIcon={<Key className="w-4 h-4 text-content-tertiary" />}
                        />
                    </div>
                  </div>
                  
                  {/* DANGER ZONE */}
                  <div>
                    <label className="text-2xs font-bold text-danger uppercase tracking-widest mb-2 block">Danger Zone</label>
                    <ConfirmButton 
                      fullWidth
                      variant="ghost"
                      confirmVariant="danger"
                      className="border border-danger/20 text-danger hover:bg-danger-container/10 justify-start px-4"
                      icon={<Trash2 className="w-4 h-4" />}
                      label="Clear Local Cache"
                      confirmLabel="Confirm Clear?"
                      onConfirm={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                    />
                  </div>
               </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
