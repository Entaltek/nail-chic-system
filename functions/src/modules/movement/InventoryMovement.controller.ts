import { Request, Response } from "express";
import { InventoryMovementService } from "./InventoryMovement.service";

const service = new InventoryMovementService();

export class InventoryMovementController {
  static async create(req: Request, res: Response) {
    try {
      const movement = await service.createMovement(req.body);
      res.status(201).json(movement);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const movements = await service.getAllMovements();
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getByItem(req: Request, res: Response) {
    try {
      const itemId = req.params.itemId;
      const movements = await service.getMovementsByItem(itemId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
