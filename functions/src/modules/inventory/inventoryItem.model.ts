import * as admin from "firebase-admin";

export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  superCategory: string;
  purchaseCost: number;
  measurementType?: 'PIECES' | 'LIQUID' | 'CUSTOM';
  
  // PIECES
  stockPieces?: number;
  minStockPieces?: number;
  costPerPiece?: number;
  weeklyUsageRate?: number;
  daysUntilEmpty?: number;
  
  // LIQUID
  totalContent?: number;
  contentUnit?: 'ml' | 'g';
  estimatedUses?: number;
  currentStock?: number;
  minStock?: number;
  costPerUse?: number;
  
  // CUSTOM
  customNote?: string;
  
  // EQUIPO legacy
  purchaseDate?: string;
  usefulLifeMonths?: number;
  monthlyDepreciation?: number;
  
  // GRANEL legacy
  visualStatus?: 'lleno' | 'medio' | 'bajo';
  
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  deletedAt?: admin.firestore.Timestamp | null;
}
