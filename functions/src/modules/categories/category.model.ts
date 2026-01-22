import { SuperCategoryType } from "./category.types";

export interface InventoryCategory {
  id: string;
  name: string;
  superCategory: SuperCategoryType;
  description: string;
  color: string;
  icon: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
