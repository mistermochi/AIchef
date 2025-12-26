import React, { useState } from 'react';
import { Save, Moon, Sun, Settings2, BrainCircuit, Key } from 'lucide-react';
import { ViewHeader, Switch, Textarea, SectionCard, Button, PageLayout, Input } from '../components/UI';
import { useChefContext } from '../context/ChefContext';

export const ProfileView: React.FC = () => {
  const { 
    preferences, setPreferences, savePreferences, 
    darkMode, setDarkMode, 
    customApiKey, setCustomApiKey 
  } = useChefContext();
  
  const [showKey, setShowKey] = useState(false);

  return (
    <PageLayout>
      <div className="flex flex-col gap-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
        
        <ViewHeader 
          title="Preferences" 
          subtitle="Customize how AI processes your recipes."
        />

        <div className="space-y-6">
          {/* API Key Section - Always visible to allow overriding or setting */}
          <SectionCard 
            title="Gemini API Key" 
            icon={<Key />}
            noPadding={false}
          >
             <div className="space-y-3">
               <div className="space-y-1">
                 <label className="text-sm font-bold text-content dark:text-content-dark">Custom API Key</label>
                 <p className="text-xs text-content-tertiary dark:text-content-tertiary-dark leading-relaxed">
                    Required if the app is not running in the Studio environment. The key is stored locally in your browser.
                 </p>
               </div>
               <div className="flex gap-2">
                 <Input 
                   type={showKey ? "text" : "password"}
                   value={customApiKey}
                   onChange={(e) => setCustomApiKey(e.target.value)}
                   placeholder="Enter your Gemini API Key..."
                   className="font-mono"
                 />
                 <Button variant="secondary" onClick={() => setShowKey(!showKey)}>
                   {showKey ? 'Hide' : 'Show'}
                 </Button>
               </div>
               {!process.env.API_KEY && !customApiKey && (
                 <p className="text-xs text-danger dark:text-danger-dark font-medium">
                   ⚠️ No environment key detected. Please add a key to enable AI features.
                 </p>
               )}
             </div>
          </SectionCard>

          {/* Appearance Section */}
          <SectionCard 
            title="Appearance" 
            icon={<Settings2 />}
            noPadding={false}
          >
            <div 
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center justify-between p-4 bg-surface-variant dark:bg-surface-variant-dark border border-outline dark:border-outline-dark rounded-xl transition-all cursor-pointer hover:bg-surface-variant/80 dark:hover:bg-surface-variant-dark/80"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark flex items-center justify-center shadow-sm">
                  {darkMode ? <Moon className="w-5 h-5 text-primary-dark" /> : <Sun className="w-5 h-5 text-warning" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-content dark:text-content-dark">Dark Mode</div>
                  <div className="text-xs text-content-secondary dark:text-content-secondary-dark">Toggle high-contrast dark interface</div>
                </div>
              </div>
              <Switch checked={darkMode} onChange={setDarkMode} />
            </div>
          </SectionCard>

          {/* AI Recipe Logic Section */}
          <SectionCard 
            title="AI Instructions" 
            icon={<BrainCircuit />}
            noPadding={false}
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-content dark:text-content-dark">Cooking Preferences</label>
                <p className="text-xs text-content-tertiary dark:text-content-tertiary-dark leading-relaxed">
                  Define your dietary needs (e.g., 'Vegan', 'Metric units', 'No spicy food').
                </p>
              </div>
              
              <Textarea 
                className="h-40 bg-surface-variant dark:bg-surface-variant-dark"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g. 'Always use metric units', 'I am lactose intolerant', 'Prefer seasonal ingredients', 'Highlight potential allergens'..."
              />
              
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={savePreferences}
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Instructions
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Footer Detail */}
        <div className="px-2 pt-4">
          <p className="text-xs text-content-tertiary dark:text-content-tertiary-dark text-center italic">
            Settings are synced to your anonymous profile and persists across workspace sessions.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};