
import React, { useState } from 'react';
import { Home, Users, Crown, CheckCircle, Copy, AlertTriangle } from 'lucide-react';
import { Input, Button } from '../../../shared/ui';
import { useAuthContext } from '../../../entities/user/model/AuthContext';

export const HouseholdManagement: React.FC = () => {
  const {
    currentHomeId, currentHome, homeMembers, createHome, joinHome
  } = useAuthContext();

  const [joinId, setJoinId] = useState('');
  const [createName, setCreateName] = useState('');
  const [isSwitchingHome, setIsSwitchingHome] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

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

  return (
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
  );
};
