import { Request, Response } from "express";
import { ServiceService } from "./service.service";

const service = new ServiceService();

export class ServiceController {
  async getAll(req: Request, res: Response) {
    try {
      const services = await service.getAll();
      res.json({
        status: 1,
        message: "Servicios obtenidos correctamente",
        data: services,
      });
    } catch (error: any) {
      console.error("Error en getAll services:", error);
      res.status(500).json({ status: 0, message: error.message || "Error al obtener servicios", data: null });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await service.getById(req.params.id);
      res.json({
        status: 1,
        message: "Servicio obtenido correctamente",
        data,
      });
    } catch (error: any) {
      console.error("Error en getById service:", error);
      res.status(500).json({ status: 0, message: error.message || "Error al obtener servicio", data: null });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await service.create(req.body);
      res.json({
        status: 1,
        message: "Servicio creado exitosamente",
        data,
      });
    } catch (error: any) {
      console.error("Error en create service:", error);
      res.status(500).json({ status: 0, message: error.message || "Error al crear servicio", data: null });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await service.update(id, req.body);
      res.json({
        status: 1,
        message: "Servicio actualizado correctamente",
        data: null,
      });
    } catch (error: any) {
      console.error("Error en update service:", error);
      res.status(500).json({ status: 0, message: error.message || "Error al actualizar servicio", data: null });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.json({
        status: 1,
        message: "Servicio eliminado",
        data: null,
      });
    } catch (error: any) {
      console.error("Error en delete service:", error);
      res.status(500).json({ status: 0, message: error.message || "Error al eliminar servicio", data: null });
    }
  }
}
