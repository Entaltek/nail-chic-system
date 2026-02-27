import {SuperCategoryType} from "./category.types";
import {Timestamp} from "firebase-admin/firestore";

export type CategoryInventoryVariant =
  | "EXACT_PIECE"
  | "DROP_CALC"
  | "HIGH_VALUE"
  | "VISUAL_STATE"
  | "DEPRECIATION";

export interface InventoryCategoryBase {
  name: string;
  description?: string;
  superCategory: SuperCategoryType;
  icon: {
    emoji: string;
    bgClass: string;
  };
  inventoryVariant: CategoryInventoryVariant;
  isActive: boolean;
  order?: number;
}

export interface InventoryCategory extends InventoryCategoryBase {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
