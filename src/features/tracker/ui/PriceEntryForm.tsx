
import React from 'react';
import { Layers, Loader2, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import { fmtCurrency } from '../../../shared/lib/format';
import { SectionCard, EditableList } from '../../../components/UI';
import { LineItem, PriceEntryFormProps } from './types';
import { TrackerLogItem } from './TrackerLogItem';
import { PriceFormMetadata } from './PriceFormMetadata';
import { usePriceEntry } from '../model/usePriceEntry';

export const PriceEntryForm: React.FC<PriceEntryFormProps> = (props) => {
  const { 
    metadata, 
    items, 
    actions, 
    scanState, 
    uiState 
  } = usePriceEntry(props);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PriceFormMetadata 
        store={metadata.store} 
        customStore={metadata.customStore} 
        date={metadata.date} 
        onUpdate={actions.updateMetadata} 
      />
      
      {scanState.scanError && (
        <div className="p-4 bg-danger-container/20 text-danger text-xs font-bold rounded-xl border border-danger/20 animate-in fade-in">
          {scanState.scanError}
        </div>
      )}

      {scanState.isScanning && (
        <div className="p-6 bg-primary-container/20 rounded-2xl flex items-center justify-center gap-4 animate-pulse">
          <Loader2 className="animate-spin text-primary" />
          <span className="text-sm font-bold text-primary tracking-widest uppercase">AI Scanning Receipt...</span>
        </div>
      )}
      
      <SectionCard 
        title={props.mode === 'edit' ? "Product Details" : `Line Items (${items.length})`} 
        icon={<Layers />} 
        noPadding={true}
        footer={props.mode === 'create' && (
          <div className="flex flex-col">
            <div className="px-6 py-4 flex justify-between bg-primary-container/10 border-b border-outline/10">
              <span className="text-xs font-bold text-content-tertiary">Total</span>
              <span className="text-xl font-bold text-primary">
                {fmtCurrency(items.reduce((s, i) => s + (parseFloat(i.price) || 0), 0))}
              </span>
            </div>
            {scanState.aiReasoning && (
              <div className="p-4 border-t border-outline/10">
                <button 
                  onClick={() => actions.setShowReasoning(!uiState.showReasoning)} 
                  className="w-full flex justify-between items-center text-2xs font-bold uppercase text-content-tertiary hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-3.5 h-3.5" /> 
                    <span>AI Reasoning Breakdown</span>
                  </div>
                  {uiState.showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {uiState.showReasoning && (
                  <div className="mt-3 p-4 bg-surface-variant dark:bg-surface-variant-dark rounded-xl font-mono text-[10px] whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar border border-outline/20">
                    {scanState.aiReasoning}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      >
        <EditableList 
          items={items} 
          isEditing={props.mode === 'create'} 
          addButtonLabel="Add Another Item"
          onAdd={actions.addItem} 
          renderItem={(item: LineItem, idx: number) => (
            <TrackerLogItem 
              key={item.id} 
              item={item} 
              products={props.products} 
              onUpdate={(u) => actions.updateItem(item.id, u)} 
              onDelete={() => actions.removeItem(item.id)} 
              isLast={idx === items.length - 1}
              hideDelete={props.mode === 'edit'} 
            />
          )} 
        />
      </SectionCard>
    </div>
  );
};
