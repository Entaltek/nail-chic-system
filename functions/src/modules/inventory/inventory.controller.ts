import { Request, Response } from "express";
import { InventoryService } from "./inventory.service";

const service = new InventoryService();

export class InventoryController {
  async create(req: Request, res: Response) {
    try {
      const item = await service.createItem(req.body);
      res.status(201).json(item);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async getAll(req: Request, res: Response) {
    const items = await service.getItems();
    res.json(items);
  }

  async getOne(req: Request, res: Response) {
    try {
      const item = await service.getItem(req.params.id);
      res.json(item);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    await service.updateItem(req.params.id, req.body);
    res.json({ message: "Actualizado" });
  }

  async delete(req: Request, res: Response) {
    await service.deleteItem(req.params.id);
    res.json({ message: "Eliminado" });
  }

  async lowStock(req: Request, res: Response) {
    const items = await service.getLowStockItems();
    res.json(items);
  }
}