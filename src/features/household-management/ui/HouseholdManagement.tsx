
import React, { useState } from 'react';
import { Home, Users, Crown, CheckCircle, Copy, AlertTriangle, Plus, Link as LinkIcon } from 'lucide-react';
import { Input, Button, Label } from '@/shared/ui';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/shared/ui/card';
import { useAuthContext } from '@/entities/user/model/AuthContext';
import { cn } from '@/shared/lib/utils';

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
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Household Management
            </CardTitle>
            <CardDescription>Collaborate with your family members.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Home Name Banner */}
        <div className="p-4 bg-muted/50 rounded-xl border relative overflow-hidden">
           <div className="relative z-10">
              <Label className="text-[10px] font-bold text-primary dark:text-primary-dark uppercase tracking-widest mb-1.5 block">Current Workspace</Label>
              <div className="text-xl font-bold text-foreground leading-tight google-sans">
                 {currentHome?.name || 'Loading...'}
              </div>
           </div>
           <Home className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/5 -rotate-12" />
        </div>

        {/* Members List */}
        <div className="space-y-3">
           <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Members ({homeMembers.length})
           </Label>
           <div className="rounded-lg border divide-y overflow-hidden">
              {homeMembers.map(member => (
                 <div key={member.uid} className="flex items-center justify-between p-3 bg-muted/20">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {member.displayName.substring(0, 2).toUpperCase()}
                       </div>
                       <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-foreground flex items-center gap-1.5 truncate">
                             {member.displayName}
                             {member.isOwner && <Crown className="w-3 h-3 text-warning fill-warning shrink-0" />}
                          </span>
                          {member.email && member.email !== 'anonymous' && (
                             <span className="text-xs text-muted-foreground truncate">{member.email}</span>
                          )}
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Invite Code */}
        <div className="p-4 bg-muted/30 rounded-xl border border-dashed flex items-center justify-between gap-4">
           <div className="min-w-0">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Invite Code</Label>
              <div className="font-mono text-sm font-bold text-foreground break-all leading-tight">
                 {currentHomeId || '...'}
              </div>
           </div>
           <Button
             size="sm"
             variant="outline"
             onClick={copyHomeId}
             className={cn("shrink-0", copyFeedback && "border-success text-success")}
           >
              {copyFeedback ? <CheckCircle className="w-4 h-4 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>}
              {copyFeedback ? 'Copied' : 'Copy'}
           </Button>
        </div>

        {/* Switch / Create Interface */}
        {!isSwitchingHome ? (
           <Button fullWidth variant="ghost" onClick={() => setIsSwitchingHome(true)} className="text-xs text-muted-foreground hover:text-foreground">
             Switch or Join Another Household
           </Button>
        ) : (
           <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-4 border-t">
              <div className="space-y-3">
                 <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5" />
                    New Household
                 </Label>
                 <div className="flex gap-2">
                    <Input
                       placeholder="Name (e.g. Vacation Home)"
                       value={createName}
                       onChange={(e) => setCreateName(e.target.value)}
                    />
                    <Button onClick={handleCreateHome} disabled={!createName.trim()}>Create</Button>
                 </div>
              </div>

              <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                 </div>
                 <div className="relative flex justify-center text-2xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-bold">OR</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <LinkIcon className="w-3.5 h-3.5" />
                    Join Existing
                 </Label>
                 {joinError && (
                   <div className="text-xs text-destructive font-bold flex items-center gap-1 animate-in fade-in">
                     <AlertTriangle className="w-3 h-3" /> {joinError}
                   </div>
                 )}
                 <div className="flex gap-2">
                    <Input
                       placeholder="Enter Invite Code"
                       value={joinId}
                       onChange={(e) => { setJoinId(e.target.value); setJoinError(''); }}
                       className={cn(joinError && "border-destructive focus-visible:ring-destructive")}
                    />
                    <Button onClick={handleJoinHome} disabled={!joinId.trim() || isJoining} loading={isJoining}>Join</Button>
                 </div>
              </div>

              <Button fullWidth variant="ghost" size="sm" onClick={() => setIsSwitchingHome(false)}>
                Cancel
              </Button>
           </div>
        )}
      </CardContent>
    </Card>
  );
};
