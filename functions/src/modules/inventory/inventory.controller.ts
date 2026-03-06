import {Request, Response} from "express";
import {InventoryService} from "./inventory.service";
import {ApiResponse} from "../../shared/types/api-response";

export const InventoryController = {

  async getAll(req: Request, res: Response) {
    try {
      const inventoryItems = await InventoryService.getAll();

      return res.status(200).json({
        status: 1,
        message: "Productos obtenidos correctamente",
        data: inventoryItems,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 0,
        message: error.message || "Error al obtener productos",
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const {id} = req.params;

      if (!id) {
        const response: ApiResponse<null> = {
          status: 0,
          message: "Id requerido",
        };
        return res.status(400).json(response);
      }

      const item = await InventoryService.getById(id);

      const response: ApiResponse<typeof item> = {
        status: 1,
        message: "Producto obtenido correctamente",
        data: item,
      };

      return res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        status: 0,
        message: error.message || "Error al obtener producto",
      };

      if (error.message === "Producto no encontrado") {
        return res.status(404).json(response);
      }

      return res.status(500).json(response);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const item = await InventoryService.create(req.body);

      const response: ApiResponse<typeof item> = {
        status: 1,
        message: "Producto creado correctamente",
        data: item,
      };

      return res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        status: 0,
        message: error.message || "Error al crear producto",
      };

      // errores de negocio (status: 2)
      if (error.status === 2) {
        return res.status(400).json(response);
      }

      return res.status(500).json(response);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const {id} = req.params;

      if (!id) {
        const response: ApiResponse<null> = {
          status: 0,
          message: "Id requerido",
        };
        return res.status(400).json(response);
      }

      const updatedItem = await InventoryService.update(id, req.body);

      const response: ApiResponse<typeof updatedItem> = {
        status: 1,
        message: "Producto actualizado correctamente",
        data: updatedItem,
      };

      return res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        status: 0,
        message: error.message || "Error al actualizar producto",
      };

      if (error.message === "Producto no encontrado") {
        return res.status(404).json(response);
      }

      if (error.status === 2) {
        return res.status(400).json(response);
      }

      return res.status(500).json(response);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const {id} = req.params;

      if (!id) {
        const response: ApiResponse<null> = {
          status: 0,
          message: "Id requerido",
        };
        return res.status(400).json(response);
      }

      await InventoryService.delete(id);

      const response: ApiResponse<null> = {
        status: 1,
        message: "Producto eliminado correctamente",
      };

      return res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        status: 0,
        message: error.message || "Error al eliminar producto",
      };

      if (error.message === "Producto no encontrado") {
        return res.status(404).json(response);
      }

      return res.status(500).json(response);
    }
  },
};
