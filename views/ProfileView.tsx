
import React from 'react';
import { User, Save, Moon, Sun, Settings2, BrainCircuit } from 'lucide-react';

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
  preferences, setPreferences, savePreferences, darkMode, setDarkMode
}) => (
  <div className="flex flex-col gap-6 animate-in fade-in duration-300 max-w-4xl mx-auto pb-24 md:pb-12">
    <div className="flex items-center gap-4 px-2">
      <div className="w-12 h-12 bg-[#0b57d0] dark:bg-[#0b57d0] rounded-xl flex items-center justify-center shadow-sm transition-colors">
        <User className="w-6 h-6 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans">Preferences</h2>
        <p className="text-sm text-[#444746] dark:text-[#c4c7c5]">Configure the default behavior of your AI adapters.</p>
      </div>
    </div>

    <div className="space-y-6">
      {/* Appearance Section */}
      <section className="studio-card flex flex-col overflow-hidden bg-white dark:bg-[#1b1b1b]">
        <div className="h-10 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center px-4 bg-[#f8f9fa] dark:bg-[#1b1b1b] shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-wider">
            <Settings2 className="w-3.5 h-3.5 text-[#0b57d0]" />
            <span>Appearance</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1b1b1b] border border-[#dadce0] dark:border-[#3c4043] flex items-center justify-center shadow-sm">
                {darkMode ? <Moon className="w-5 h-5 text-[#8ab4f8]" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <div className="text-sm font-bold text-[#1f1f1f] dark:text-[#e3e3e3]">Dark Mode</div>
                <div className="text-[11px] text-[#444746] dark:text-[#8e918f]">Toggle high-contrast dark interface</div>
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
      </section>

      {/* AI Recipe Logic Section */}
      <section className="studio-card flex flex-col overflow-hidden bg-white dark:bg-[#1b1b1b]">
        <div className="h-10 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center px-4 bg-[#f8f9fa] dark:bg-[#1b1b1b] shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-wider">
            <BrainCircuit className="w-3.5 h-3.5 text-[#0b57d0]" />
            <span>AI Recipe Logic</span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-[#1f1f1f] dark:text-[#e3e3e3]">Default Adaptation Persona</label>
            <p className="text-xs text-[#8e918f] dark:text-[#5f6368] leading-relaxed">
              These instructions guide the Gemini model during recipe extraction and refinement. Describe your dietary needs, measurement preferences, or culinary focus.
            </p>
          </div>
          
          <textarea 
            className="w-full h-40 bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-xl p-4 text-[14px] outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#0b57d0] dark:focus:ring-[#8ab4f8] leading-relaxed text-[#1f1f1f] dark:text-[#e3e3e3] placeholder:text-[#bdc1c6] dark:placeholder:text-[#5f6368] transition-all resize-none font-normal"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="e.g. 'Always use metric units', 'I am lactose intolerant', 'Prefer seasonal ingredients', 'Highlight potential allergens'..."
          />
          
          <div className="flex justify-end pt-2">
            <button 
              onClick={savePreferences}
              className="bg-[#0b57d0] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0842a0] transition-all flex items-center gap-2 shadow-md active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Instructions
            </button>
          </div>
        </div>
      </section>
    </div>

    {/* Footer Detail */}
    <div className="px-2 pt-4">
      <p className="text-[11px] text-[#8e918f] dark:text-[#5f6368] text-center italic">
        Settings are synced to your anonymous profile and persists across workspace sessions.
      </p>
    </div>
  </div>
);
