import { Request, Response } from "express";
import { InventoryItemService } from "./inventoryItem.service";

export class InventoryItemController {
  private service = new InventoryItemService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const items = await this.service.getAll();
      res.status(200).json({ status: "success", data: items });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.service.getById(id);
      res.status(200).json({ status: "success", data: item });
    } catch (error: any) {
      res.status(404).json({ status: "error", message: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json({ status: "success", message: "Producto creado.", data: item });
    } catch (error: any) {
      res.status(400).json({ status: "error", message: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.update(id, req.body);
      res.status(200).json({ status: "success", message: "Producto actualizado." });
    } catch (error: any) {
      res.status(400).json({ status: "error", message: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      res.status(200).json({ status: 1, message: "Producto eliminado", data: null });
    } catch (error: any) {
      res.status(400).json({ status: "error", message: error.message });
    }
  };
}
