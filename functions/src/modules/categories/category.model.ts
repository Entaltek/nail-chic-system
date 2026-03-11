import type { SuperCategoryType, InventoryVariant, CategoryIcon } from "./category.types";

export interface InventoryCategory {
  id: string;
  name: string;
  superCategory: SuperCategoryType;
  description: string;

  icon: CategoryIcon;
  inventoryVariant: InventoryVariant;
  isActive: boolean;
  order: number;

  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}