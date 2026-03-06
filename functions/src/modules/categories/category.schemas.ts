import { z } from "zod";

const superCategorySchema = z.enum(["PRODUCTS", "TOOLS", "SERVICES"]);

const inventoryVariantSchema = z.enum([
  "EXACT_PIECE",
  "DROP_CALC",
  "HIGH_VALUE",
  "VISUAL_STATE",
  "DEPRECIATION",
]);

const iconSchema = z.object({
  emoji: z.string().min(1, "El emoji es obligatorio"),
  bgClass: z.string().min(1, "La clase de fondo es obligatoria"),
});

const categoryBaseSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  superCategory: superCategorySchema,
  inventoryVariant: inventoryVariantSchema,
  icon: iconSchema,
  order: z.number().int().optional(),
});

export const createCategorySchema = categoryBaseSchema;

export const updateCategorySchema = categoryBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });
