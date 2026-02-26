import { Request, Response } from "express";
import { InventoryMovementService } from "./InventoryMovement.service";

const service = new InventoryMovementService();

export class InventoryMovementController {
  static async create(req: Request, res: Response) {
    try {
      const { itemId, type, quantity } = req.body;

      if (!itemId || !type || !quantity) {
        return res.status(400).json({
          error: "itemId, type y quantity son requeridos"
        });
      }

      const movement = await service.createMovement(req.body);

      return res.status(201).json(movement);

    } catch (error) {
      console.error("createMovement error:", error);
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const movements = await service.getAllMovements();
      return res.json(movements);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getByItem(req: Request, res: Response) {
    try {
      const itemId = req.params.itemId;
      const movements = await service.getMovementsByItem(itemId);
      return res.json(movements);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }
}
