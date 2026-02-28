
import React from 'react';
import { Settings2, Download, Bot, Moon, Sun, Smartphone, Eye } from 'lucide-react';
import { SectionCard, Button, Switch } from '../../../shared/ui';
import { useAuthContext } from '../../../entities/user/model/AuthContext';
import { useUIContext } from '../../../app/providers/UIContext';
import { usePWA } from '../../../shared/lib/hooks/usePWA';

export const StudioSettings: React.FC = () => {
  const { profile, updateProfile } = useAuthContext();
  const { darkMode, setDarkMode } = useUIContext();
  const { isInstallable, install } = usePWA();

  return (
    <SectionCard title="Studio Settings" icon={<Settings2 />}>
      <div className="space-y-1 divide-y divide-outline/30 dark:divide-outline-dark/30">
        {isInstallable && (
            <div onClick={install} className="flex items-center justify-between py-3 cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary-container dark:bg-primary-container-dark text-primary dark:text-primary-dark">
                   <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-content dark:text-content-dark">Install App</div>
                  <div className="text-xs text-content-secondary dark:text-content-secondary-dark">Add to Home Screen</div>
                </div>
              </div>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); install(); }}>Install</Button>
            </div>
        )}

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
          <Switch checked={profile.aiEnabled ?? true} onCheckedChange={(v) => updateProfile({ aiEnabled: v })} />
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
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
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
          <Switch checked={profile.haptics} onCheckedChange={(v) => updateProfile({ haptics: v })} />
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
          <Switch checked={profile.autoWakeLock} onCheckedChange={(v) => updateProfile({ autoWakeLock: v })} />
        </div>
      </div>
    </SectionCard>
  );
};
