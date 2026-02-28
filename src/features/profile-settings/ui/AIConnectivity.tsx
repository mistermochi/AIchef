import React, { useEffect } from 'react';
import { Database, AlertTriangle, CheckCircle, Key, RefreshCw, ExternalLink, Trash2 } from 'lucide-react';
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ConfirmButton } from '../../../shared/ui';
import { useAuthContext } from '../../../entities/user/model/AuthContext';

/**
 * @component AIConnectivity
 * @description Manages AI provider settings, API keys, and service health.
 */
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
    if (profile.aiEnabled === false) return <Badge variant="secondary">Disabled</Badge>;

    switch (aiHealth) {
      case 'checking':
        return (
          <Badge variant="outline" className="gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
          </Badge>
        );
      case 'healthy':
        return <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">Active</Badge>;
      case 'region_restricted':
        return (
          <Badge variant="outline" className="text-warning border-warning gap-1">
            <RefreshCw className="w-3 h-3" /> Geo-Restricted
          </Badge>
        );
      case 'unhealthy':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" /> Error
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 gap-2 pb-4">
        <Database className="w-5 h-5 text-muted-foreground" />
        <CardTitle className="text-lg font-bold">Data & Connectivity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${isAIEnabled ? 'bg-success/20 text-success' : (aiHealth === 'unhealthy' || aiHealth === 'region_restricted' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive')}`}>
                {(aiHealth === 'unhealthy' || aiHealth === 'region_restricted') ? <AlertTriangle className="w-5 h-5" /> : (isAIEnabled ? <CheckCircle className="w-5 h-5" /> : <Key className="w-5 h-5" />)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold">
                    {profile.aiProvider === 'gemini' ? 'Gemini API' : 'Mistral API'}
                  </h4>
                  {getStatusBadge()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {aiErrorMsg ? aiErrorMsg : "Required for Recipe Processing and Genie."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={profile.aiProvider === 'gemini' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => updateProfile({ aiProvider: 'gemini' })}
              >
                Gemini
              </Button>
              <Button
                size="sm"
                variant={profile.aiProvider === 'mistral' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => updateProfile({ aiProvider: 'mistral' })}
              >
                Mistral
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                className="flex-1"
                onClick={openKeySelector}
                variant={isAIEnabled ? 'secondary' : 'default'}
              >
                <Key className="w-3 h-3 mr-2" />
                {isAIEnabled ? 'Change Key' : 'Connect Key'}
              </Button>

              {(aiHealth === 'unhealthy' || aiHealth === 'region_restricted') && (
                <Button size="sm" variant="ghost" onClick={checkHealth}>
                  <RefreshCw className="w-3 h-3 mr-2" /> Retry
                </Button>
              )}

              {profile.aiProvider === 'gemini' && (
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button size="sm" className="w-full" variant="ghost">
                    <ExternalLink className="w-3 h-3 mr-2" /> Billing
                  </Button>
                </a>
              )}
              {profile.aiProvider === 'mistral' && (
                <a href="https://console.mistral.ai/billing/" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button size="sm" className="w-full" variant="ghost">
                    <ExternalLink className="w-3 h-3 mr-2" /> Billing
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {profile.aiProvider === 'gemini' ? "Gemini API Key" : "Mistral API Key"}
              </label>
              <Input
                value={profile.aiProvider === 'gemini' ? geminiKey : mistralKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => profile.aiProvider === 'gemini' ? setGeminiKey(e.target.value) : setMistralKey(e.target.value)}
                placeholder={profile.aiProvider === 'gemini' ? "Enter Gemini key" : "Enter Mistral key"}
                type="password"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-destructive uppercase tracking-[0.2em] block">Danger Zone</label>
          <ConfirmButton
            variant="ghost"
            confirmVariant="danger"
            className="w-full border border-destructive/20 text-destructive hover:bg-destructive/10 justify-start px-4 h-10"
            icon={<Trash2 className="w-4 h-4 mr-2" />}
            label="Clear Local Cache"
            confirmLabel="Confirm Clear?"
            onConfirm={() => {
              localStorage.clear();
              window.location.reload();
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
