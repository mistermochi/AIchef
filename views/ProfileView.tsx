import React from 'react';
import { User, Save, Database, History, Moon, Sun, Monitor } from 'lucide-react';

interface ProfileViewProps {
  preferences: string;
  setPreferences: (val: string) => void;
  savePreferences: () => void;
  recipeCount: number;
  cartCount: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  preferences, setPreferences, savePreferences, recipeCount, cartCount, darkMode, setDarkMode
}) => (
  <div className="h-full flex flex-col gap-6 animate-in fade-in duration-300">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-[#0b57d0] dark:bg-[#0b57d0] rounded-xl flex items-center justify-center shadow-sm transition-colors">
        <User className="w-6 h-6 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans">Preferences</h2>
        <p className="text-sm text-[#444746] dark:text-[#c4c7c5]">Configure the default behavior of your AI adapters.</p>
      </div>
    </div>

    <div className="flex-1 flex flex-col md:flex-row gap-6">
      <div className="flex-1 studio-card flex flex-col overflow-hidden">
        <div className="h-10 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center px-4 bg-[#f8f9fa] dark:bg-[#1b1b1b] shrink-0">
           <span className="text-[11px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-wider">System-wide Settings</span>
        </div>
        <div className="p-8 space-y-8">
           {/* Appearance Toggle */}
           <div className="space-y-4">
              <label className="text-sm font-medium text-[#1f1f1f] dark:text-[#e3e3e3]">Appearance</label>
              <div className="flex items-center justify-between p-4 bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-xl">
                 <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="w-5 h-5 text-[#8ab4f8]" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div>
                       <div className="text-sm font-bold text-[#1f1f1f] dark:text-[#e3e3e3]">Dark Mode</div>
                       <div className="text-[11px] text-[#444746] dark:text-[#8e918f]">Switch between light and dark themes</div>
                    </div>
                 </div>
                 <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${darkMode ? 'bg-[#0b57d0]' : 'bg-[#dadce0]'}`}
                 >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                 </button>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-sm font-medium text-[#1f1f1f] dark:text-[#e3e3e3]">Default Adaptation Logic</label>
              <p className="text-xs text-[#8e918f] mb-3">These instructions are injected into every recipe prompt to ensure consistency.</p>
              <textarea 
                className="w-full h-48 bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-xl p-6 text-sm outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] leading-relaxed text-[#1f1f1f] dark:text-[#e3e3e3] placeholder:text-[#bdc1c6] dark:placeholder:text-[#5f6368]"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g. 'Always use metric units', 'Prefer organic ingredients', 'Highlight potential allergens'..."
              />
           </div>
           <button 
            onClick={savePreferences}
            className="bg-[#0b57d0] dark:bg-[#0b57d0] text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0842a0] transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>

      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="studio-card">
           <div className="h-10 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center px-4 bg-[#f8f9fa] dark:bg-[#1b1b1b] shrink-0">
             <span className="text-[11px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-wider">Usage Statistics</span>
           </div>
           <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-[#e8f0fe] dark:bg-[#2d2e30] rounded-lg flex items-center justify-center text-[#0b57d0] dark:text-[#8ab4f8]">
                    <History className="w-5 h-5" />
                 </div>
                 <div>
                    <div className="text-xl font-bold text-[#1f1f1f] dark:text-[#e3e3e3]">{recipeCount}</div>
                    <div className="text-[10px] font-bold text-[#8e918f] uppercase">Total Adapters</div>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-[#e8f0fe] dark:bg-[#2d2e30] rounded-lg flex items-center justify-center text-[#0b57d0] dark:text-[#8ab4f8]">
                    <Database className="w-5 h-5" />
                 </div>
                 <div>
                    <div className="text-xl font-bold text-[#1f1f1f] dark:text-[#e3e3e3]">{cartCount}</div>
                    <div className="text-[10px] font-bold text-[#8e918f] uppercase">Cart Payload</div>
                 </div>
              </div>
           </div>
        </div>

        <div className="studio-card p-6 bg-[#0b57d0] dark:bg-[#0b57d0] text-white">
           <h3 className="font-bold text-sm mb-2">Workspace Info</h3>
           <p className="text-xs text-white/70 leading-relaxed">
             All recipe adaptations are stored in your private library. Your system instructions help guide the Gemini model in personalizing your results.
           </p>
        </div>
      </div>
    </div>
  </div>
);