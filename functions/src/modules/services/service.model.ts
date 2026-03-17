import * as admin from "firebase-admin";

export interface ServiceRecipe {
  materialId: string;
  materialName: string;
  usageAmount: number;
  costPerUnit: number;
  totalCost: number;
}

export interface Service {
  id: string;
  name: string;
  basePrice: number;
  suggestedPrice: number;
  estimatedMinutes: number;
  materialCost: number;
  needsLength: boolean;
  recipe: ServiceRecipe[];
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}
