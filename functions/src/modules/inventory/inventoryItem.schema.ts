import { z } from "zod";

const superCategorySchema = z.enum(["PRODUCTS", "TOOLS", "SERVICES"]);

const inventoryItemBaseSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    categoryId: z.string().min(1, "La categoría es obligatoria"),
    superCategory: superCategorySchema,
    purchaseCost: z.number().min(0, "El costo no puede ser negativo"),
    stockPieces: z.number().int().min(0, "El stock no puede ser negativo"),
    minStockPieces: z.number().int().min(0, "El stock mínimo no puede ser negativo"),
    weeklyUsageRate: z.number().min(0, "El consumo semanal no puede ser negativo"),
  })
  .strict();

export const createInventoryItemSchema = inventoryItemBaseSchema.refine(
  (data) => data.minStockPieces <= data.stockPieces,
  {
    message: "El stock mínimo no puede ser mayor al stock actual",
    path: ["minStockPieces"],
  }
);

export const updateInventoryItemSchema = inventoryItemBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  })
  .refine(
    (data) =>
      data.minStockPieces === undefined ||
      data.stockPieces === undefined ||
      data.minStockPieces <= data.stockPieces,
    {
      message: "El stock mínimo no puede ser mayor al stock actual",
      path: ["minStockPieces"],
    }
  );