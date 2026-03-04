import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio"),

  description: z
    .string()
    .optional(),

  superCategory: z
    .string()
    .min(1, "La super categoría es obligatoria"),

  emoji: z
    .string()
    .min(1, "El emoji es obligatorio"),
    
  bgClass: z
    .string()
    .min(1, "La clase de fondo es obligatoria"),

  inventoryVariant: z
    .string()
    .min(1, "El tipo de inventario es obligatorio"),
});