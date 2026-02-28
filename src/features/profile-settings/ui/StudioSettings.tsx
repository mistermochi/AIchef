
import React from 'react';
import { Settings2, Download, Bot, Moon, Sun, Smartphone, Eye } from 'lucide-react';
import { Button, Switch, Label } from '@/shared/ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { useAuthContext } from '@/entities/user/model/AuthContext';
import { useUIContext } from '@/app/providers/UIContext';
import { usePWA } from '@/shared/lib/hooks/usePWA';

export const StudioSettings: React.FC = () => {
  const { profile, updateProfile } = useAuthContext();
  const { darkMode, setDarkMode } = useUIContext();
  const { isInstallable, install } = usePWA();

  const settingsItems = [
    {
      id: 'ai-features',
      title: 'AI Features',
      description: 'Enable Generative AI capabilities',
      icon: <Bot className="w-4 h-4" />,
      checked: profile.aiEnabled ?? true,
      onCheckedChange: (v: boolean) => updateProfile({ aiEnabled: v }),
    },
    {
      id: 'dark-mode',
      title: 'Dark Mode',
      description: 'High contrast interface',
      icon: darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
      checked: darkMode,
      onCheckedChange: setDarkMode,
    },
    {
      id: 'haptics',
      title: 'Haptics',
      description: 'Vibration feedback on interaction',
      icon: <Smartphone className="w-4 h-4" />,
      checked: profile.haptics,
      onCheckedChange: (v: boolean) => updateProfile({ haptics: v }),
    },
    {
      id: 'auto-wake-lock',
      title: 'Auto Wake Lock',
      description: 'Keep screen on during cooking',
      icon: <Eye className="w-4 h-4" />,
      checked: profile.autoWakeLock,
      onCheckedChange: (v: boolean) => updateProfile({ autoWakeLock: v }),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Studio Settings
          </CardTitle>
          <CardDescription>Configure your application experience.</CardDescription>
        </div>
        {isInstallable && (
          <Button variant="outline" size="sm" onClick={install} className="gap-2">
            <Download className="w-4 h-4" />
            Install
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid gap-6">
        {settingsItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-muted rounded-full text-muted-foreground">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <Label htmlFor={item.id} className="text-sm font-medium leading-none cursor-pointer">
                  {item.title}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            <Switch
              id={item.id}
              checked={item.checked}
              onCheckedChange={item.onCheckedChange}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
