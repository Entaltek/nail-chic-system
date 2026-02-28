import {z} from "zod";

export const MovementType = z.enum(["IN", "OUT"]);

export const InventoryMovementSchema = z.object({
  id: z.string(),

  itemId: z.string(), // referencia al inventoryItem

  type: MovementType,

  quantity: z.number().int().positive(),

  reason: z.string().optional(),

  createdAt: z.date(),
});

export type InventoryMovement = z.infer<typeof InventoryMovementSchema>;
