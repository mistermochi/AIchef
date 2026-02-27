
import { useState, useCallback } from 'react';
import { getAIService } from '../../../shared/api/aiServiceFactory';
import { compressImage } from '../../../shared/lib/helpers';
import { useAuthContext } from '../../../entities/user/model/AuthContext';
// @ts-ignore
import heic2any from 'heic2any';

export interface ScanResult {
  store?: string;
  date?: string;
  items?: any[];
  analysis_steps?: string;
}

export function useReceiptScanner() {
  const { reportError, profile } = useAuthContext();
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [aiReasoning, setAiReasoning] = useState('');

  const scanReceipt = useCallback(async (file: File): Promise<ScanResult | null> => {
    setIsScanning(true);
    setScanError('');
    setAiReasoning('');
    
    try {
      let imageFile = file;

      // Detect and convert HEIC files
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic' || file.type === 'image/heif') {
         try {
           const convertedBlob = await heic2any({
             blob: file,
             toType: "image/jpeg",
             quality: 0.8
           });
           const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
           imageFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
         } catch (e) {
            console.warn("HEIC conversion failed, attempting raw upload", e);
         }
      }

      const base64 = await new Promise<string>((res, rej) => { 
        const r = new FileReader(); 
        r.onload = (ev) => res(ev.target?.result as string); 
        r.onerror = () => rej(new Error("File read failed"));
        r.readAsDataURL(imageFile); 
      });
      
      const compressed = await compressImage(base64);
      const ai = getAIService(profile.aiProvider);
      const data = await ai.extractReceiptData(compressed, 'image/jpeg');
      
      if (data.analysis_steps) setAiReasoning(data.analysis_steps);
      
      return data;
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || 'Failed to scan receipt');
      
      const msg = err.message.toLowerCase();
      if (msg.includes('auth') || msg.includes('key')) reportError('auth_error', err.message);
      else if (msg.includes('limit') || msg.includes('quota')) reportError('quota_error', err.message);
      else if (msg.includes('region')) reportError('region_restricted', err.message);
      else reportError('unhealthy', err.message);

      return null;
    } finally {
      setIsScanning(false);
    }
  }, [reportError]);

  const clearError = useCallback(() => setScanError(''), []);

  return { 
    isScanning, 
    scanError, 
    aiReasoning, 
    scanReceipt,
    clearError 
  };
}
