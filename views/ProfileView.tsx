
import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, User as UserIcon, ChefHat, Utensils, BrainCircuit, Home, 
  Users, Crown, Copy, AlertTriangle, CheckCircle, Mail, Lock, LogOut, 
  RefreshCw, Globe2, FileJson, FileSpreadsheet, HardDrive, Download, Upload,
  Wand2, ArrowRight, Database, Trash2, Smartphone, Eye, Bot, Key, ExternalLink,
  Edit2, Check, X, Moon, Sun, Settings2
} from 'lucide-react';
import { 
  PageLayout, ViewHeader, Button, SectionCard, Input, Badge, Textarea, Switch, ConfirmButton 
} from '../components/UI';
import { useAuthContext } from '../context/AuthContext';
import { useBackupRestore } from '../hooks/useBackupRestore';
import { useUIContext } from '../context/UIContext';
import { useDataMigration } from '../hooks/useDataMigration';
import { DIETARY_LIST, APPLIANCE_LIST } from '../types';

export const ProfileView: React.FC = () => {
  const { 
    chefUser, profile, updateProfile, saveProfile, updateUserDisplayName,
    currentHomeId, currentHome, homeMembers, createHome, joinHome,
    login, register, logout, authError, authMessage, openKeySelector,
    isAIEnabled, aiHealth, aiErrorMsg, checkHealth 
  } = useAuthContext();
  
  const { restoreCookbook, restoreTracker, exportCookbook, exportTracker, processing, status } = useBackupRestore();
  const { runMigration, migrating, progress, total, status: migrationStatus } = useDataMigration();
  const { setView, darkMode, setDarkMode } = useUIContext();

  const recipeFileRef = useRef<HTMLInputElement>(null);
  const trackerFileRef = useRef<HTMLInputElement>(null);

  const [passValue, setPassValue] = React.useState(() => {
    return localStorage.getItem('chefai_pass') || '';
  });

  // Update localStorage whenever passValue changes
  useEffect(() => {
    localStorage.setItem('chefai_pass', passValue);
  }, [passValue]);

  // Household Local State
  const [joinId, setJoinId] = useState('');
  const [createName, setCreateName] = useState('');
  const [isSwitchingHome, setIsSwitchingHome] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  // Auth Local State
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Name Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Lazy health check
  useEffect(() => {
    if (aiHealth === 'unknown') {
      checkHealth();
    }
  }, [checkHealth, aiHealth]);

  const toggleArrayItem = (field: 'appliances' | 'dietary', value: string) => {
    const list = profile[field];
    const next = list.includes(value) ? list.filter(i => i !== value) : [...list, value];
    updateProfile({ [field]: next });
  };

  const getStatusBadge = () => {
    if (profile.aiEnabled === false) return <Badge label="Disabled" variant="neutral" />;
    
    switch (aiHealth) {
      case 'checking': return <Badge label="Checking..." variant="neutral" icon={<RefreshCw className="w-3 h-3 animate-spin" />} />;
      case 'healthy': return <Badge label="Active" variant="success" />;
      case 'region_restricted': return <Badge label="Geo-Restricted" variant="warning" icon={<Globe2 className="w-3 h-3" />} />;
      case 'unhealthy': return <Badge label="Error" variant="warning" icon={<AlertTriangle className="w-3 h-3" />} />;
      default: return <Badge label="Unknown" variant="neutral" />;
    }
  };

  const handleRecipeImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      restoreCookbook(e.target.files[0]);
      e.target.value = ''; // Reset
    }
  };

  const handleTrackerImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      restoreTracker(e.target.files[0]);
      e.target.value = ''; // Reset
    }
  };

  const copyHomeId = () => {
    if (currentHomeId) {
      navigator.clipboard.writeText(currentHomeId);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleCreateHome = async () => {
    if (!createName.trim()) return;
    await createHome(createName);
    setCreateName('');
    setIsSwitchingHome(false);
  };

  const handleJoinHome = async () => {
    if (!joinId.trim()) return;
    setJoinError('');
    setIsJoining(true);
    try {
      await joinHome(joinId.trim());
      setJoinId('');
      setIsSwitchingHome(false);
    } catch (e: any) {
      setJoinError(e.message || "Failed to join home.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleAuthSubmit = async () => {
    if (!emailInput || !passInput) return;
    setAuthLoading(true);
    try {
      if (isRegisterMode) {
        await register(emailInput, passInput);
      } else {
        await login(emailInput, passInput);
      }
      setPassInput(''); // Clear password on success
    } catch (e) {
      // Error handled in context
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await updateUserDisplayName(tempName.trim());
      setIsEditingName(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <ViewHeader 
          title="Chef Identity" 
          subtitle="Customize your AI kitchen companion." 
          actions={<Button onClick={saveProfile} icon={<Save className="w-4 h-4" />}>Save Changes</Button>}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* LEFT COLUMN: CONTEXT */}
          <div className="space-y-6">
            
            {/* 0. ACCOUNT */}
            <SectionCard title="Account" icon={<UserIcon />}>
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
                                        {chefUser?.isAnonymous ? 'Guest User' : (chefUser?.displayName || 'Chef')}
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
                                {chefUser?.isAnonymous ? 'Data saved locally' : chefUser?.email}
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
            </SectionCard>

            {/* 1. THE CHEF */}
            <SectionCard title="The Chef" icon={<ChefHat />}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Units</label>
                    <div className="flex bg-surface-variant dark:bg-surface-variant-dark rounded-lg p-1 border border-outline dark:border-outline-dark">
                       {['metric', 'imperial'].map(u => (
                         <button key={u} onClick={() => updateProfile({ measurements: u as any })} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${profile.measurements === u ? 'bg-white dark:bg-primary-dark text-primary dark:text-surface shadow-sm' : 'text-content-tertiary'}`}>
                           {u}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Default Servings</label>
                    <Input 
                      type="number" 
                      value={profile.defaultServings} 
                      onChange={(e) => updateProfile({ defaultServings: parseInt(e.target.value) || 2 })} 
                      className="h-[38px]"
                    />
                  </div>
                </div>

                <div>
                   <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Dietary Restrictions</label>
                   <div className="flex flex-wrap gap-2">
                      {DIETARY_LIST.map(diet => (
                        <Badge 
                          key={diet} 
                          label={diet} 
                          variant={profile.dietary.includes(diet) ? 'primary' : 'neutral'} 
                          className="cursor-pointer select-none"
                          onClick={() => toggleArrayItem('dietary', diet)}
                        />
                      ))}
                   </div>
                </div>

                <div>
                  <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Dislikes & Allergies</label>
                  <Input 
                    placeholder="e.g. No cilantro, peanut allergy..." 
                    value={profile.dislikes} 
                    onChange={(e) => updateProfile({ dislikes: e.target.value })}
                  />
                </div>
              </div>
            </SectionCard>

            {/* 2. THE KITCHEN */}
            <SectionCard title="The Kitchen" icon={<Utensils />}>
               <div className="space-y-6">
                  <div>
                    <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Available Appliances</label>
                    <div className="flex flex-wrap gap-2">
                        {APPLIANCE_LIST.map(app => (
                          <Badge 
                            key={app} 
                            label={app} 
                            variant={profile.appliances.includes(app) ? 'primary' : 'neutral'} 
                            className="cursor-pointer select-none"
                            onClick={() => toggleArrayItem('appliances', app)}
                          />
                        ))}
                    </div>
                  </div>

                  <div>
                     <label className="text-2xs font-bold text-content-tertiary uppercase tracking-widest mb-2 block">Skill Level</label>
                     <div className="flex bg-surface-variant dark:bg-surface-variant-dark rounded-lg p-1 border border-outline dark:border-outline-dark">
                       {['beginner', 'pro'].map(level => (
                         <button key={level} onClick={() => updateProfile({ skillLevel: level as any })} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${profile.skillLevel === level ? 'bg-white dark:bg-primary-dark text-primary dark:text-surface shadow-sm' : 'text-content-tertiary'}`}>
                           {level}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
            </SectionCard>

            {/* 3. CUSTOM INSTRUCTIONS */}
            <SectionCard title="Custom Instructions" icon={<BrainCircuit />}>
              <Textarea 
                className="h-32 bg-surface-variant dark:bg-surface-variant-dark resize-none"
                placeholder="Any other rules for the AI? (e.g. 'I love spicy food', 'Prefer quick meals')"
                value={profile.customInstructions}
                onChange={(e) => updateProfile({ customInstructions: e.target.value })}
              />
            </SectionCard>
          </div>

          {/* RIGHT COLUMN: SETTINGS */}
          <div className="space-y-6">
            
            {/* 0. HOUSEHOLD */}
            <SectionCard title="Household" icon={<Home />}>
               <div className="space-y-5">
                  {/* Home Name Banner */}
                  <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary-dark/20 dark:to-primary-dark/10 rounded-2xl border border-primary/20 dark:border-primary-dark/20 relative overflow-hidden">
                     <div className="relative z-10">
                        <div className="text-xs font-bold text-primary dark:text-primary-dark uppercase tracking-widest mb-1.5">Current Workspace</div>
                        <div className="text-2xl font-bold text-content dark:text-content-dark leading-tight google-sans">
                           {currentHome?.name || 'Loading...'}
                        </div>
                     </div>
                     <Home className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/10 dark:text-primary-dark/10 -rotate-12" />
                  </div>

                  {/* Members List */}
                  <div>
                     <div className="flex items-center gap-2 mb-3 px-1">
                        <Users className="w-4 h-4 text-content-secondary" />
                        <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">Members ({homeMembers.length})</span>
                     </div>
                     <div className="bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline dark:border-outline-dark divide-y divide-outline/50 dark:divide-outline-dark/50">
                        {homeMembers.map(member => (
                           <div key={member.uid} className="flex items-center justify-between p-3">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-primary-dark/20 text-primary dark:text-primary-dark flex items-center justify-center font-bold text-xs">
                                    {member.displayName.substring(0, 2).toUpperCase()}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-content dark:text-content-dark flex items-center gap-1.5">
                                       {member.displayName}
                                       {member.isOwner && <Crown className="w-3 h-3 text-warning fill-warning" />}
                                    </span>
                                    {member.email && member.email !== 'anonymous' && (
                                       <span className="text-xs text-content-tertiary">{member.email}</span>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Invite Code */}
                  <div className="p-4 bg-surface-variant/50 dark:bg-surface-variant-dark/50 rounded-xl border border-dashed border-outline dark:border-outline-dark">
                     <div className="flex justify-between items-end gap-4">
                        <div className="min-w-0">
                           <div className="text-[10px] font-bold text-content-tertiary uppercase tracking-widest mb-1">Invite Code</div>
                           <div className="font-mono text-base font-bold text-content dark:text-content-dark break-all leading-tight">
                              {currentHomeId || '...'}
                           </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          icon={copyFeedback ? <CheckCircle className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} 
                          className={copyFeedback ? "!bg-success-container !text-success-dark" : ""}
                          onClick={copyHomeId} 
                        >
                           {copyFeedback ? 'Copied' : 'Copy'}
                        </Button>
                     </div>
                  </div>

                  {/* Switch / Create Interface */}
                  {!isSwitchingHome ? (
                     <Button fullWidth variant="ghost" onClick={() => setIsSwitchingHome(true)}>Switch or Join Another</Button>
                  ) : (
                     <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-2 border-t border-outline/30 dark:border-outline-dark/30">
                        {/* Create */}
                        <div className="space-y-2">
                           <div className="text-xs font-bold text-content-secondary dark:text-content-secondary-dark uppercase tracking-wider">New Household</div>
                           <div className="flex gap-2">
                              <Input 
                                 placeholder="Name (e.g. Vacation Home)" 
                                 value={createName} 
                                 onChange={(e) => setCreateName(e.target.value)}
                                 className="bg-surface dark:bg-surface-dark"
                              />
                              <Button onClick={handleCreateHome} disabled={!createName.trim()}>Create</Button>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                           <div className="h-px bg-outline dark:bg-outline-dark flex-1" />
                           <span className="text-2xs text-content-tertiary uppercase font-bold">OR</span>
                           <div className="h-px bg-outline dark:bg-outline-dark flex-1" />
                        </div>

                        {/* Join */}
                        <div className="space-y-2">
                           <div className="text-xs font-bold text-content-secondary dark:text-content-secondary-dark uppercase tracking-wider">Join Existing</div>
                           {joinError && <div className="text-xs text-danger font-bold flex items-center gap-1 animate-in fade-in"><AlertTriangle className="w-3 h-3" /> {joinError}</div>}
                           <div className="flex gap-2">
                              <Input 
                                 placeholder="Enter Invite Code" 
                                 value={joinId} 
                                 onChange={(e) => { setJoinId(e.target.value); setJoinError(''); }}
                                 className={`bg-surface dark:bg-surface-dark ${joinError ? 'border-danger' : ''}`} 
                              />
                              <Button onClick={handleJoinHome} disabled={!joinId.trim() || isJoining} loading={isJoining}>Join</Button>
                           </div>
                        </div>
                        
                        <Button fullWidth variant="ghost" size="sm" onClick={() => setIsSwitchingHome(false)}>Cancel</Button>
                     </div>
                  )}
               </div>
            </SectionCard>

            {/* 4. STUDIO SETTINGS */}
            <SectionCard title="Studio Settings" icon={<Settings2 />}>
              <div className="space-y-1 divide-y divide-outline/30 dark:divide-outline-dark/30">
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
                  <Switch checked={profile.aiEnabled ?? true} onChange={(v) => updateProfile({ aiEnabled: v })} />
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
                  <Switch checked={darkMode} onChange={setDarkMode} />
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
                  <Switch checked={profile.haptics} onChange={(v) => updateProfile({ haptics: v })} />
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
                  <Switch checked={profile.autoWakeLock} onChange={(v) => updateProfile({ autoWakeLock: v })} />
                </div>
              </div>
            </SectionCard>

            {/* 5. BACKUP & RESTORE */}
            <SectionCard title="Data Management" icon={<HardDrive />}>
              <div className="space-y-4">
                {/* Inputs hidden, triggered by buttons */}
                <input type="file" ref={recipeFileRef} onChange={handleRecipeImport} accept="application/json" className="hidden" />
                <input type="file" ref={trackerFileRef} onChange={handleTrackerImport} accept=".csv" className="hidden" />
                
                {/* Status Banners */}
                {status && (
                   <div className="p-3 bg-primary-container/20 text-primary text-xs font-bold rounded-lg border border-primary/20 flex items-center gap-2 animate-in fade-in">
                      {processing && <RefreshCw className="w-3 h-3 animate-spin" />}
                      {status}
                   </div>
                )}
                {migrationStatus && (
                   <div className="p-3 bg-accent-container/20 text-accent dark:text-accent-dark text-xs font-bold rounded-lg border border-accent/20 dark:border-accent-dark/20 flex flex-col gap-2 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        {migrating && <Wand2 className="w-3 h-3 animate-pulse" />}
                        {migrationStatus}
                      </div>
                      {migrating && total > 0 && (
                        <div className="w-full h-1 bg-accent/20 rounded-full overflow-hidden">
                           <div className="h-full bg-accent dark:bg-accent-dark transition-all duration-300" style={{ width: `${(progress / total) * 100}%` }} />
                        </div>
                      )}
                   </div>
                )}

                <div className="p-4 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline dark:border-outline-dark space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-white dark:bg-surface-dark rounded-lg shadow-sm"><FileJson className="w-5 h-5 text-warning" /></div>
                     <div>
                       <div className="text-sm font-bold text-content dark:text-content-dark">Cookbook Backup</div>
                       <div className="text-xs text-content-secondary dark:text-content-secondary-dark">Save recipes as JSON</div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button size="sm" variant="secondary" onClick={exportCookbook} disabled={processing} icon={<Download className="w-3 h-3" />}>Export</Button>
                    <Button size="sm" variant="ghost" onClick={() => recipeFileRef.current?.click()} disabled={processing} icon={<Upload className="w-3 h-3" />}>Restore</Button>
                  </div>
                </div>

                <div className="p-4 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline dark:border-outline-dark space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-white dark:bg-surface-dark rounded-lg shadow-sm"><FileSpreadsheet className="w-5 h-5 text-success" /></div>
                     <div>
                       <div className="text-sm font-bold text-content dark:text-content-dark">Tracker Backup</div>
                       <div className="text-xs text-content-secondary dark:text-content-secondary-dark">Save history as CSV</div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <Button size="sm" variant="secondary" onClick={exportTracker} disabled={processing} icon={<Download className="w-3 h-3" />}>Export</Button>
                     <Button size="sm" variant="ghost" onClick={() => trackerFileRef.current?.click()} disabled={processing} icon={<Upload className="w-3 h-3" />}>Restore</Button>
                  </div>
                </div>

                {/* Legacy Data Migration */}
                <div className="p-4 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline dark:border-outline-dark space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-white dark:bg-surface-dark rounded-lg shadow-sm"><Database className="w-5 h-5 text-primary dark:text-primary-dark" /></div>
                     <div>
                       <div className="text-sm font-bold text-content dark:text-content-dark">Smart Data Remigration</div>
                       <div className="text-xs text-content-secondary dark:text-content-secondary-dark">Fix legacy price data & re-classify names</div>
                     </div>
                  </div>
                  <Button 
                    fullWidth 
                    size="sm" 
                    variant="ghost" 
                    onClick={runMigration} 
                    disabled={migrating || !isAIEnabled} 
                    icon={migrating ? <Wand2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                  >
                    Scan & Remigrate All
                  </Button>
                </div>

              </div>
            </SectionCard>

            {/* 6. DATA & CONNECTIVITY */}
            <SectionCard title="Data & Connectivity" icon={<Database />}>
               <div className="space-y-6">
                  {/* API KEY */}
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
                  
                  {/* DANGER ZONE */}
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
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
