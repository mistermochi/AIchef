import React from 'react';
import { Store, Calendar, ChevronDown } from 'lucide-react';
import { STORES } from '../../../entities/tracker/config';
import { Input, SectionCard } from '../../../components/UI';

interface MetadataProps {
  store: string;
  customStore: string;
  date: string;
  onUpdate: (key: string, value: string) => void;
}

export const PriceFormMetadata: React.FC<MetadataProps> = ({ store, customStore, date, onUpdate }) => (
  <SectionCard title="Vendor & Date" icon={<Store />}>
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 space-y-2">
        <label className="text-2xs font-bold text-content-tertiary uppercase px-1 tracking-widest">Store</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <select value={store} onChange={(e) => onUpdate('store', e.target.value)} className="w-full bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-xl py-2.5 pl-3 pr-10 text-sm font-medium outline-none focus:ring-1 focus:ring-primary shadow-sm appearance-none">
              <option value="">Select Store...</option>
              {STORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary pointer-events-none" />
          </div>
          {store === 'Other' && <Input placeholder="Store Name" value={customStore} onChange={(e) => onUpdate('customStore', e.target.value)} className="flex-1" startIcon={<Store />} />}
        </div>
      </div>
      <div className="w-full md:w-56 space-y-2">
        <label className="text-2xs font-bold text-content-tertiary uppercase px-1 tracking-widest">Date</label>
        <Input type="date" value={date} onChange={(e) => onUpdate('date', e.target.value)} startIcon={<Calendar />} />
      </div>
    </div>
  </SectionCard>
);