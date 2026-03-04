import { NextFunction, Request, Response } from "express";
import { ClientsService } from "./clients.service";

const service = new ClientsService();

export class ClientsController {

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await service.create(req.body);

      return res.status(201).json({
        success: true,
        data: client,
      });

    } catch (error) {
      next(error);
      return;
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await service.getAll();

      return res.json({
        success: true,
        data: clients,
      });

    } catch (error) {
      next(error);
      return;
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await service.getById(req.params.id);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      return res.json({
        success: true,
        data: client,
      });

    } catch (error) {
      next(error);
      return;
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedClient = await service.update(req.params.id, req.body);

      if (!updatedClient) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado para actualizar",
        });
      }

      return res.json({
        success: true,
        data: updatedClient,
      });

    } catch (error) {
      next(error);
      return;
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const success = await service.delete(req.params.id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado para eliminar",
        });
      }

      return res.json({
        success: true,
        message: "Cliente eliminado correctamente",
      });

    } catch (error) {
      next(error);
      return;
    }
  }
}
