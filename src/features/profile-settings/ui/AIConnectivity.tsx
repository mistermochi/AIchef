
import React, { useEffect } from 'react';
import { Database, AlertTriangle, CheckCircle, Key, RefreshCw, ExternalLink, Trash2 } from 'lucide-react';
import { SectionCard, Badge, Button, Input, ConfirmButton } from '../../../shared/ui';
import { useAuthContext } from '../../../entities/user/model/AuthContext';

export const AIConnectivity: React.FC = () => {
  const {
    isAIEnabled, aiHealth, aiErrorMsg, checkHealth, openKeySelector, profile, updateProfile
  } = useAuthContext();

  const [geminiKey, setGeminiKey] = React.useState(() => {
    return localStorage.getItem('chefai_pass') || '';
  });

  const [mistralKey, setMistralKey] = React.useState(() => {
    return localStorage.getItem('mistral_api_key') || '';
  });

  useEffect(() => {
    localStorage.setItem('chefai_pass', geminiKey);
  }, [geminiKey]);

  useEffect(() => {
    localStorage.setItem('mistral_api_key', mistralKey);
  }, [mistralKey]);

  useEffect(() => {
    if (aiHealth === 'unknown') {
      checkHealth();
    }
  }, [checkHealth, aiHealth]);

  const getStatusBadge = () => {
    if (profile.aiEnabled === false) return <Badge label="Disabled" variant="neutral" />;

    switch (aiHealth) {
      case 'checking': return <Badge label="Checking..." variant="neutral" icon={<RefreshCw className="w-3 h-3 animate-spin" />} />;
      case 'healthy': return <Badge label="Active" variant="success" />;
      case 'region_restricted': return <Badge label="Geo-Restricted" variant="warning" icon={<RefreshCw className="w-3 h-3" />} />;
      case 'unhealthy': return <Badge label="Error" variant="warning" icon={<AlertTriangle className="w-3 h-3" />} />;
      default: return <Badge label="Unknown" variant="neutral" />;
    }
  };

  return (
    <SectionCard title="Data & Connectivity" icon={<Database />}>
       <div className="space-y-6">
          <div className="p-4 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline dark:border-outline-dark">
            <div className="flex items-start justify-between gap-4">
               <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${isAIEnabled ? 'bg-success-container text-success' : (aiHealth === 'unhealthy' || aiHealth === 'region_restricted' ? 'bg-warning-container text-warning' : 'bg-danger-container text-danger')}`}>
                    {(aiHealth === 'unhealthy' || aiHealth === 'region_restricted') ? <AlertTriangle className="w-5 h-5" /> : (isAIEnabled ? <CheckCircle className="w-5 h-5" /> : <Key className="w-5 h-5" />)}
                  </div>
                  <div>
                     <h4 className="text-sm font-bold text-content dark:text-content-dark flex items-center gap-2">
                       {profile.aiProvider === 'gemini' ? 'Gemini API' : 'Mistral API'} {getStatusBadge()}
                     </h4>
                     <p className="text-xs text-content-secondary dark:text-content-secondary-dark mt-1">
                       {aiErrorMsg ? aiErrorMsg : "Required for Recipe Processing and Genie."}
                     </p>
                  </div>
               </div>
            </div>
            <div className="mt-4 space-y-3">
               <div className="flex gap-2">
                 <Button
                   size="sm"
                   variant={profile.aiProvider === 'gemini' ? 'primary' : 'ghost'}
                   className="flex-1"
                   onClick={() => updateProfile({ aiProvider: 'gemini' })}
                 >
                   Gemini
                 </Button>
                 <Button
                   size="sm"
                   variant={profile.aiProvider === 'mistral' ? 'primary' : 'ghost'}
                   className="flex-1"
                   onClick={() => updateProfile({ aiProvider: 'mistral' })}
                 >
                   Mistral
                 </Button>
               </div>

               <div className="flex gap-3">
                  <Button size="sm" fullWidth onClick={openKeySelector} variant={isAIEnabled ? 'secondary' : 'primary'} icon={<Key className="w-3 h-3" />}>
                    {isAIEnabled ? 'Change Key' : 'Connect Key'}
                  </Button>
                  {(aiHealth === 'unhealthy' || aiHealth === 'region_restricted') && (
                    <Button size="sm" variant="ghost" icon={<RefreshCw className="w-3 h-3" />} onClick={checkHealth}>Retry</Button>
                  )}
                  {profile.aiProvider === 'gemini' && (
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex-1">
                       <Button size="sm" fullWidth variant="ghost" icon={<ExternalLink className="w-3 h-3" />}>Billing</Button>
                    </a>
                  )}
                  {profile.aiProvider === 'mistral' && (
                    <a href="https://console.mistral.ai/billing/" target="_blank" rel="noopener noreferrer" className="flex-1">
                       <Button size="sm" fullWidth variant="ghost" icon={<ExternalLink className="w-3 h-3" />}>Billing</Button>
                    </a>
                  )}
               </div>
            </div>
            <div className="mt-4 pt-4 border-t border-outline/10">
                <Input
                    label={profile.aiProvider === 'gemini' ? "Gemini API Key" : "Mistral API Key"}
                    value={profile.aiProvider === 'gemini' ? geminiKey : mistralKey}
                    onChange={(e) => profile.aiProvider === 'gemini' ? setGeminiKey(e.target.value) : setMistralKey(e.target.value)}
                    placeholder={profile.aiProvider === 'gemini' ? "Enter Gemini key" : "Enter Mistral key"}
                    type="password"
                    className="bg-surface dark:bg-surface-dark"
                    startIcon={<Key className="w-4 h-4 text-content-tertiary" />}
                />
            </div>
          </div>

          <div>
            <label className="text-2xs font-bold text-danger uppercase tracking-widest mb-2 block">Danger Zone</label>
            <ConfirmButton
              variant="ghost"
              confirmVariant="danger"
              className="w-full border border-danger/20 text-danger hover:bg-danger-container/10 justify-start px-4"
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
  );
};
