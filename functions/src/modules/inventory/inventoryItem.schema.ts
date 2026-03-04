import { z } from "zod";

export const createInventoryItemSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del producto es obligatorio"),

  categoryId: z
    .string()
    .min(1, "La categoría es obligatoria"),

  purchaseCost: z
    .number()
    .positive("El costo debe ser mayor a 0"),

  stockPieces: z
    .number()
    .min(0, "El stock no puede ser negativo"),

  minStockPieces: z
    .number()
    .min(0, "El stock mínimo no puede ser negativo"),

  weeklyUsageRate: z
    .number()
    .min(0, "El consumo semanal no puede ser negativo"),
}).refine(
  (data) => data.minStockPieces <= data.stockPieces,
  {
    message: "El stock mínimo no puede ser mayor al stock actual",
    path: ["minStockPieces"],
  }
);