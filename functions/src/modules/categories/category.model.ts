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
  icon: string | { emoji: string; bgClass: string }; // <-- aquí
  inventoryVariant: CategoryInventoryVariant;
  isActive: boolean;
  order?: number;
}

export function isIconObject(
  icon: string | { emoji: string; bgClass: string }
): icon is { emoji: string; bgClass: string } {
  return typeof icon === "object" && icon !== null && "emoji" in icon && "bgClass" in icon;
}
export interface InventoryCategory extends InventoryCategoryBase {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
