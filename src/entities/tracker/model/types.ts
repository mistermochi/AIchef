
import { Timestamp, FieldValue } from 'firebase/firestore';

export interface Product {
  id: string; // Derived from normalized name
  name: string;
  genericName?: string; // Canonical name for recipe matching (e.g. "Milk" for "Meiji 4.3 Milk")
  category: string;
  defaultUnit?: string;
  appId?: string;
  userId?: string;
}

export interface Purchase {
  id: string;
  productName: string;
  genericName?: string; // Canonical name for recipe matching
  category: string;
  date: Timestamp | Date;
  price: number;
  quantity: number; // Total quantity (singleQty * count)
  singleQty?: number; // The size of a single unit in a pack (e.g. 330 for a 6-pack)
  count?: number; // The multiplier (e.g. 6)
  unit: string;
  normalizedPrice: number;
  store: string;
  comment?: string;
  timestamp?: Timestamp | Date | FieldValue;
  appId?: string;
  userId?: string;
}
