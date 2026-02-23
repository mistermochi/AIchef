
import React, { useRef } from 'react';
import { HardDrive, RefreshCw, Wand2, FileJson, Download, Upload, FileSpreadsheet, Database, ArrowRight } from 'lucide-react';
import { SectionCard, Button } from '../../../shared/ui';
import { useBackupRestore } from '../../data-management/model/useBackupRestore';
import { useDataMigration } from '../../data-migration/model/useDataMigration';
import { useAuthContext } from '../../../entities/user/model/AuthContext';

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
    <SectionCard title="Data Management" icon={<HardDrive />}>
      <div className="space-y-4">
        <input type="file" ref={recipeFileRef} onChange={handleRecipeImport} accept="application/json" className="hidden" />
        <input type="file" ref={trackerFileRef} onChange={handleTrackerImport} accept=".csv" className="hidden" />

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
  );
};
