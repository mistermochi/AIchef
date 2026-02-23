
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, LogOut, AlertTriangle, CheckCircle, Edit2, Check, X } from 'lucide-react';
import { Input, Button } from '../../../shared/ui';
import { useAuthContext } from '../../../entities/user/model/AuthContext';

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
    <div className="flex flex-col gap-4">
        {authError && (
          <div className="p-3 bg-danger-container/20 text-danger text-xs font-bold rounded-lg border border-danger/20 flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {authError}
          </div>
        )}
        {authMessage && (
          <div className="p-3 bg-success-container/20 text-success text-xs font-bold rounded-lg border border-success/20 flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {authMessage}
          </div>
        )}
        <div className="flex items-center gap-4 p-4 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline dark:border-outline-dark">
            <div className="w-12 h-12 bg-primary dark:bg-primary-dark rounded-full flex items-center justify-center text-white text-xl font-bold">
                {chefUser?.email ? chefUser.email[0].toUpperCase() : 'G'}
            </div>
            <div className="flex-1 min-w-0">
                {isEditingName ? (
                    <div className="flex items-center gap-2">
                        <input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            className="font-bold text-content dark:text-content-dark bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded px-2 py-1 text-sm w-full outline-none focus:border-primary"
                            autoFocus
                            placeholder="Display Name"
                        />
                        <button onClick={handleSaveName} className="p-1.5 bg-success-container text-success-dark rounded-md hover:bg-success-container/80 transition-colors"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setIsEditingName(false)} className="p-1.5 bg-danger-container text-danger-dark rounded-md hover:bg-danger-container/80 transition-colors"><X className="w-3 h-3" /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group">
                        <div className="font-bold text-content dark:text-content-dark truncate">
                            {displayName}
                        </div>
                        {!chefUser?.isAnonymous && (
                            <button
                                onClick={() => { setTempName(chefUser?.displayName || ''); setIsEditingName(true); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-content-tertiary hover:text-primary hover:bg-surface dark:hover:bg-surface-dark rounded"
                                title="Edit Name"
                            >
                                <Edit2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                )}
                <div className="text-xs text-content-secondary dark:text-content-secondary-dark truncate mt-0.5">
                    {displayEmail}
                </div>
            </div>
        </div>

        {chefUser?.isAnonymous ? (
            <div className="space-y-4 pt-2">
                <div className="flex flex-col gap-3">
                    <div className="flex rounded-lg bg-surface-variant dark:bg-surface-variant-dark p-1 border border-outline dark:border-outline-dark">
                       <button
                         onClick={() => setIsRegisterMode(false)}
                         className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!isRegisterMode ? 'bg-surface dark:bg-surface-dark shadow-sm text-primary dark:text-primary-dark' : 'text-content-tertiary'}`}
                       >
                         Sign In
                       </button>
                       <button
                         onClick={() => setIsRegisterMode(true)}
                         className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${isRegisterMode ? 'bg-surface dark:bg-surface-dark shadow-sm text-primary dark:text-primary-dark' : 'text-content-tertiary'}`}
                       >
                         Register
                       </button>
                    </div>

                    <Input
                        type="email"
                        placeholder="Email Address"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        startIcon={<Mail className="w-4 h-4" />}
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={passInput}
                        onChange={(e) => setPassInput(e.target.value)}
                        startIcon={<Lock className="w-4 h-4" />}
                        onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
                    />
                    <Button
                        fullWidth
                        onClick={handleAuthSubmit}
                        disabled={!emailInput || !passInput || authLoading}
                        loading={authLoading}
                        icon={isRegisterMode ? <UserIcon className="w-4 h-4"/> : <LogOut className="w-4 h-4 rotate-180"/>}
                    >
                        {isRegisterMode ? 'Create Account' : 'Sign In'}
                    </Button>
                </div>
                <p className="text-xs text-center text-content-tertiary">
                    {isRegisterMode ? 'Create an account to sync your data.' : 'Sign in to access your cloud data.'}
                </p>
            </div>
        ) : (
            <Button fullWidth variant="ghost" onClick={logout} icon={<LogOut className="w-4 h-4"/>}>
                Sign Out
            </Button>
        )}
    </div>
  );
};
