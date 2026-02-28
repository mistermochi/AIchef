import React, { useState } from 'react';
import { User as UserIcon, LogOut, AlertTriangle, CheckCircle, Edit2, Check, X, RefreshCw } from 'lucide-react';
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { useAuthContext } from '../../../entities/user/model/AuthContext';

/**
 * @component AuthForm
 * @description Handles user authentication (login, register, logout) and profile identity.
 */
export const AuthForm: React.FC = () => {
  const {
    chefUser, login, register, logout, authError, authMessage, updateUserDisplayName
  } = useAuthContext();

  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleAuthSubmit = async () => {
    if (!emailInput || !passInput) return;
    setAuthLoading(true);
    try {
      if (isRegisterMode) {
        await register(emailInput, passInput);
      } else {
        await login(emailInput, passInput);
      }
      setPassInput('');
    } catch (e) {}
    finally { setAuthLoading(false); }
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await updateUserDisplayName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const displayName = chefUser?.displayName || (chefUser?.isAnonymous ? 'Guest Chef' : 'Chef');
  const displayEmail = chefUser?.isAnonymous ? 'Sign in to sync' : chefUser?.email;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold">Chef Identity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {authError && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs font-bold rounded-lg border border-destructive/20 flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {authError}
          </div>
        )}
        {authMessage && (
          <div className="p-3 bg-success/10 text-success text-xs font-bold rounded-lg border border-success/20 flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {authMessage}
          </div>
        )}

        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
            {chefUser?.email ? chefUser.email[0].toUpperCase() : 'G'}
          </div>
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempName(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSaveName()}
                  className="h-8 text-sm"
                  autoFocus
                  placeholder="Display Name"
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={handleSaveName}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setIsEditingName(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <div className="font-bold truncate text-foreground">
                  {displayName}
                </div>
                {!chefUser?.isAnonymous && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => { setTempName(chefUser?.displayName || ''); setIsEditingName(true); }}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {displayEmail}
              {chefUser?.isAnonymous && (
                <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4">Guest</Badge>
              )}
            </div>
          </div>
        </div>

        {chefUser?.isAnonymous ? (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col gap-3">
              <div className="flex rounded-lg bg-muted p-1 border border-border">
                <button
                  onClick={() => setIsRegisterMode(false)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!isRegisterMode ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsRegisterMode(true)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${isRegisterMode ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                >
                  Register
                </button>
              </div>

              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={emailInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailInput(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={passInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAuthSubmit()}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleAuthSubmit}
                disabled={!emailInput || !passInput || authLoading}
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  isRegisterMode ? <UserIcon className="w-4 h-4 mr-2"/> : <LogOut className="w-4 h-4 mr-2 rotate-180"/>
                )}
                {isRegisterMode ? 'Create Account' : 'Sign In'}
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {isRegisterMode ? 'Create an account to sync your data.' : 'Sign in to access your cloud data.'}
            </p>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2"/>
            Sign Out
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
