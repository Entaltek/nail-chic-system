import {z} from "zod";
import {Timestamp} from "firebase-admin/firestore";

export const UnitType = z.enum([
  "PIEZA",
  "ML",
  "GR",
  "KIT",
  "PAQUETE",
]);

export const CurrencyType = z.enum([
  "MXN",
]);

const CostSchema = z.object({
  amount: z.number().positive(),
  currency: CurrencyType,
  per: z.string().min(1),
});

const StockSchema = z.object({
  value: z.number().int().nonnegative(),
  unit: UnitType,
});

export const InventoryItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),

  inventoryId: z.string().min(1),

  cost: CostSchema,
  stock: StockSchema,

  isActive: z.boolean().default(true),
});

export type InventoryItemInput = z.infer<typeof InventoryItemSchema>;

export type InventoryItemBase = InventoryItemInput;

export interface InventoryItem extends InventoryItemBase {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
