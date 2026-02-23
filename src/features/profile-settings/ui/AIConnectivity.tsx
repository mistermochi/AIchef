
import React, { useEffect } from 'react';
import { Database, AlertTriangle, CheckCircle, Key, RefreshCw, ExternalLink, Trash2 } from 'lucide-react';
import { SectionCard, Badge, Button, Input, ConfirmButton } from '../../../shared/ui';
import { useAuthContext } from '../../../entities/user/model/AuthContext';

export const AIConnectivity: React.FC = () => {
  const {
    isAIEnabled, aiHealth, aiErrorMsg, checkHealth, openKeySelector, profile
  } = useAuthContext();

  const [passValue, setPassValue] = React.useState(() => {
    return localStorage.getItem('chefai_pass') || '';
  });

  useEffect(() => {
    localStorage.setItem('chefai_pass', passValue);
  }, [passValue]);

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
  );
};
