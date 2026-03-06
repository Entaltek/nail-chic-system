import { Timestamp } from "firebase-admin/firestore";
import { SuperCategoryType } from "../categories/category.types";

export interface InventoryItemBase {
  name: string;
  categoryId: string;
  category: string; // se guarda como referencia rápida (lo llena backend)
  superCategory: SuperCategoryType;
  purchaseCost: number;
  stockPieces: number;
  minStockPieces: number;
  weeklyUsageRate: number;
}

export interface InventoryDerivedFields {
  costPerPiece: number;
  daysUntilEmpty: number | null;
}

export interface InventoryItem extends InventoryItemBase, InventoryDerivedFields {
  id: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateInventoryItemInput = Omit<
  InventoryItemBase,
  "category"
>;

export type UpdateInventoryItemInput = Partial<CreateInventoryItemInput>;
