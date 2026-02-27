

import { useState, useCallback } from 'react';
import { extractReceiptData } from '../shared/api/ai';
import { compressImage } from '../utils/helpers';
import { useAuthContext } from '../context/AuthContext';
// @ts-ignore
import heic2any from 'heic2any';

export interface ScannedReceipt {
  store: string;
  date: string;
  items: Array<{
    name: string;
    generic_name: string;
    category: string;
    price: number;
    quantity?: number;
    unit?: string;
    count?: number;
    note?: string;
  }>;
  subtotal: number;
}

/**
 * @hook useReceiptScanner
 * @description Hook to handle receipt image processing and OCR extraction.
 */
export function useReceiptScanner() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAIEnabled, reportError } = useAuthContext();

  const scanReceipt = useCallback(async (file: File): Promise<ScannedReceipt | null> => {
    if (!isAIEnabled) return null;
    
    setScanning(true);
    setError(null);

    try {
      let processFile = file;

      // 1. Handle HEIC conversion if needed
      if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
         const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.7 });
         processFile = new File([blob as Blob], 'receipt.jpg', { type: 'image/jpeg' });
      }

      // 2. Compress image for AI payload (max 1MB)
      const compressedBase64 = await compressImage(processFile, 0.8, 1600);
      
      // 3. Extract data via AI
      const data = await extractReceiptData(compressedBase64, 'image/jpeg');
      
      if (!data || !data.items) {
        throw new Error("No data extracted from receipt.");
      }

      return {
        store: data.store || 'Unknown Store',
        date: data.date || new Date().toISOString().split('T')[0],
        items: data.items,
        subtotal: data.subtotal_detected || 0
      };

    } catch (err: any) {
      console.error("Receipt Scan Error:", err);
      const msg = err.message || "Failed to process receipt.";
      setError(msg);
      reportError('unhealthy', msg);
      return null;
    } finally {
      setScanning(false);
    }
  }, [isAIEnabled, reportError]);

  return { scanReceipt, scanning, error };
}
