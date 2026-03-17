import type { SuperCategoryType, InventoryVariant, CategoryIcon, MeasurementType } from "./category.types";

export interface InventoryCategory {
  id: string;
  name: string;
  superCategory: SuperCategoryType;
  measurementType?: MeasurementType;
  description: string;

  icon: CategoryIcon;
  inventoryVariant: InventoryVariant;
  isActive: boolean;
  order: number;

  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}