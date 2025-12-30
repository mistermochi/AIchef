import { useState, useCallback } from 'react';
import { extractReceiptData } from '../services/geminiService';
import { compressImage } from '../utils/helpers';

export interface ScanResult {
  store?: string;
  date?: string;
  items?: any[];
  analysis_steps?: string;
}

export function useReceiptScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [aiReasoning, setAiReasoning] = useState('');

  const scanReceipt = useCallback(async (file: File): Promise<ScanResult | null> => {
    setIsScanning(true);
    setScanError('');
    setAiReasoning('');
    
    try {
      const base64 = await new Promise<string>((res) => { 
        const r = new FileReader(); 
        r.onload = (ev) => res(ev.target?.result as string); 
        r.readAsDataURL(file); 
      });
      
      const compressed = await compressImage(base64);
      const data = await extractReceiptData(compressed, 'image/jpeg');
      
      if (data.analysis_steps) setAiReasoning(data.analysis_steps);
      
      return data;
    } catch (err: any) {
      setScanError(err.message || 'Failed to scan receipt');
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearError = useCallback(() => setScanError(''), []);

  return { 
    isScanning, 
    scanError, 
    aiReasoning, 
    scanReceipt,
    clearError 
  };
}