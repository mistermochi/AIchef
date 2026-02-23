
import { Product } from '../../../entities/tracker/model/types';

export interface LineItem {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  price: string;
  unit: string;
  singleQty: string;
  count: string;
  comment: string; 
}

export interface PriceEntryFormProps {
  products: Product[];
  initialData?: any; 
  mode: 'create' | 'edit';
  onSubmit: (data: any) => void;
  externalSubmitTrigger?: number;
  onValidationChange?: (isValid: boolean) => void;
  autoScanFile?: File;
}
