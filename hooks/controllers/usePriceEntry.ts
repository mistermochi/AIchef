
import { useState, useEffect, useCallback } from 'react';
import { getCategory, fmtDateInput, STORES } from '../../utils/tracker';
import { LineItem } from '../../components/tracker/types';
import { Product } from '../../types';
import { useReceiptScanner } from '../useReceiptScanner';

interface UsePriceEntryProps {
  products: Product[];
  initialData?: any;
  mode: 'create' | 'edit';
  onSubmit: (data: any) => void;
  onValidationChange?: (isValid: boolean) => void;
  autoScanFile?: File;
  externalSubmitTrigger?: number;
}

export function usePriceEntry({
  initialData,
  mode,
  onSubmit,
  onValidationChange,
  autoScanFile,
  externalSubmitTrigger
}: UsePriceEntryProps) {
  const { isScanning, scanError, aiReasoning, scanReceipt } = useReceiptScanner();
  const [showReasoning, setShowReasoning] = useState(false);

  const resolveStore = (name: string) => {
    if (!name) return { store: '', customStore: '' };
    const match = STORES.find(s => s.toLowerCase() === name.trim().toLowerCase() && s !== 'Other');
    return match ? { store: match, customStore: '' } : { store: 'Other', customStore: name };
  };

  const [metadata, setMetadata] = useState(() => {
    const { store, customStore } = resolveStore(initialData?.store || '');
    return { date: fmtDateInput(initialData?.date), store, customStore };
  });

  const [items, setItems] = useState<LineItem[]>(() => {
    if (mode === 'edit' && initialData) {
      return [{
        id: initialData.id,
        name: initialData.productName || '',
        category: initialData.category || 'General',
        price: initialData.price?.toString() || '',
        unit: initialData.unit || 'g',
        singleQty: initialData.singleQty?.toString() || '',
        count: initialData.count?.toString() || '1',
        comment: initialData.comment || ''
      }];
    }
    return [{ id: Math.random().toString(36).substring(2, 9), name: '', category: 'General', price: '', unit: 'g', singleQty: '', count: '1', comment: '' }];
  });

  // Validation
  useEffect(() => {
    const isMetadataValid = !!metadata.store && (metadata.store !== 'Other' || !!metadata.customStore.trim());
    const areItemsValid = items.length > 0 && items.every(i => !!i.name.trim() && !!i.price && !isNaN(parseFloat(i.price)));
    onValidationChange?.(isMetadataValid && areItemsValid);
  }, [metadata, items, onValidationChange]);

  const handleSubmit = useCallback(() => {
    const finalStore = metadata.store === 'Other' ? metadata.customStore : metadata.store;
    
    const process = (it: LineItem) => {
      const p = parseFloat(it.price) || 0;
      const sQty = parseFloat(it.singleQty) || 0;
      const cnt = parseFloat(it.count) || 1;
      const totalQty = sQty * cnt;
      const normalizedPrice = totalQty > 0 ? p / totalQty : p; 

      const { id: _, ...rest } = it; 

      return {
        ...rest,
        date: new Date(metadata.date),
        price: p,
        quantity: totalQty,
        singleQty: sQty,
        count: cnt,
        normalizedPrice,
        store: finalStore,
        productName: it.name
      };
    };

    if (mode === 'edit') {
      onSubmit(process(items[0]));
    } else {
      onSubmit(items.map(process));
    }
  }, [metadata, items, mode, onSubmit]);

  // External Submit Trigger
  useEffect(() => {
    if (externalSubmitTrigger) handleSubmit();
  }, [externalSubmitTrigger, handleSubmit]);

  const processFile = async (file: File) => {
    const data = await scanReceipt(file);
    if (!data) return;

    setMetadata(prev => {
      const next = { ...prev };
      if (data.date) next.date = data.date;
      if (data.store) {
         const { store, customStore } = resolveStore(data.store);
         next.store = store;
         next.customStore = customStore;
      }
      return next;
    });
    
    if (data.items && Array.isArray(data.items)) {
      setItems(data.items.map((it: any) => ({ 
        id: Math.random().toString(36).substring(2, 9), 
        name: it.name || '', 
        category: it.category || getCategory(it.name), 
        price: it.price?.toString() || '', 
        unit: it.unit || 'pcs', 
        singleQty: it.quantity?.toString() || '1', 
        count: it.count?.toString() || '1', 
        comment: it.note || '' 
      })));
    }
  };

  // Auto Scan
  useEffect(() => {
    if (autoScanFile) {
      processFile(autoScanFile);
    }
  }, [autoScanFile]);

  // Actions
  const updateMetadata = (key: string, value: string) => setMetadata(m => ({ ...m, [key]: value }));
  const addItem = () => setItems(prev => [...prev, { 
    id: Math.random().toString(36).substring(2, 9), 
    name: '', 
    category: 'General', 
    price: '', 
    unit: 'g', 
    singleQty: '', 
    count: '1', 
    comment: '' 
  }]);
  const updateItem = (id: string, updates: Partial<LineItem>) => setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return {
    metadata,
    items,
    actions: { updateMetadata, addItem, updateItem, removeItem, setShowReasoning },
    scanState: { isScanning, scanError, aiReasoning },
    uiState: { showReasoning }
  };
}
