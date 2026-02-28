
import React, { useRef } from 'react';
import { HardDrive, RefreshCw, Wand2, FileJson, Download, Upload, FileSpreadsheet, Database, ArrowRight } from 'lucide-react';
import { Button, Label } from '@/shared/ui';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/shared/ui/card';
import { useBackupRestore } from '@/features/data-management/model/useBackupRestore';
import { useDataMigration } from '@/features/data-migration/model/useDataMigration';
import { useAuthContext } from '@/entities/user/model/AuthContext';

export const DataManagement: React.FC = () => {
  const { restoreCookbook, restoreTracker, exportCookbook, exportTracker, processing, status } = useBackupRestore();
  const { runMigration, migrating, progress, total, status: migrationStatus } = useDataMigration();
  const { isAIEnabled } = useAuthContext();

  const recipeFileRef = useRef<HTMLInputElement>(null);
  const trackerFileRef = useRef<HTMLInputElement>(null);

  const handleRecipeImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      restoreCookbook(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleTrackerImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      restoreTracker(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-primary" />
          Data Management
        </CardTitle>
        <CardDescription>Backup and migrate your culinary data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input type="file" ref={recipeFileRef} onChange={handleRecipeImport} accept="application/json" className="hidden" />
        <input type="file" ref={trackerFileRef} onChange={handleTrackerImport} accept=".csv" className="hidden" />

        {status && (
           <div className="p-3 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/20 flex items-center gap-2 animate-in fade-in">
              {processing && <RefreshCw className="w-3 h-3 animate-spin" />}
              {status}
           </div>
        )}
        {migrationStatus && (
           <div className="p-3 bg-accent/5 text-accent dark:text-accent-dark text-xs font-bold rounded-lg border border-accent/20 dark:border-accent-dark/20 flex flex-col gap-2 animate-in fade-in">
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

        <div className="grid gap-4">
          <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-background rounded-lg shadow-sm border"><FileJson className="w-5 h-5 text-amber-500" /></div>
               <div className="space-y-0.5">
                 <Label className="text-sm font-bold text-foreground">Cookbook Backup</Label>
                 <p className="text-xs text-muted-foreground">Save recipes as JSON</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={exportCookbook} disabled={processing} icon={<Download className="w-3 h-3" />}>Export</Button>
              <Button size="sm" variant="ghost" onClick={() => recipeFileRef.current?.click()} disabled={processing} icon={<Upload className="w-3 h-3" />}>Restore</Button>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-background rounded-lg shadow-sm border"><FileSpreadsheet className="w-5 h-5 text-emerald-500" /></div>
               <div className="space-y-0.5">
                 <Label className="text-sm font-bold text-foreground">Tracker Backup</Label>
                 <p className="text-xs text-muted-foreground">Save history as CSV</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
               <Button size="sm" variant="outline" onClick={exportTracker} disabled={processing} icon={<Download className="w-3 h-3" />}>Export</Button>
               <Button size="sm" variant="ghost" onClick={() => trackerFileRef.current?.click()} disabled={processing} icon={<Upload className="w-3 h-3" />}>Restore</Button>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-background rounded-lg shadow-sm border"><Database className="w-5 h-5 text-primary" /></div>
               <div className="space-y-0.5">
                 <Label className="text-sm font-bold text-foreground">Smart Data Remigration</Label>
                 <p className="text-xs text-muted-foreground">Fix legacy price data & re-classify names</p>
               </div>
            </div>
            <Button
              fullWidth
              size="sm"
              variant="ghost"
              onClick={runMigration}
              disabled={migrating || !isAIEnabled}
              icon={migrating ? <Wand2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
              className="text-muted-foreground hover:text-foreground"
            >
              Scan & Remigrate All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
