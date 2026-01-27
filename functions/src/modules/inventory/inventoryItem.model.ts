import { z } from "zod";

// 🔹 ENUMS útiles
export const UnitType = z.enum([
  "PIEZA",
  "ML",
  "GR",
  "KIT",
  "PAQUETE"
]);

export const StockStatus = z.enum([
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK"
]);

// 🔹 Esquema principal de validación
export const InventoryItemSchema = z.object({
  id: z.string().min(1),

  name: z.string().min(2),
  description: z.string().optional(),

  categoryId: z.string().min(1), // referencia a inventoryCategories

  brand: z.string().optional(),

  purchasePrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),

  stock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative(),

  unit: UnitType,

  barcode: z.string().optional(),
  imageUrl: z.string().url().optional(),

  isActive: z.boolean().default(true),

  createdAt: z.date(),
  updatedAt: z.date()
});

// 🔹 Tipo TypeScript automático
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
