import {Request, Response} from "express";
import {CategoryService} from "./category.service";
import {ApiResponse} from "../../shared/types/api-response";

export const CategoryController = {

  async getAll(req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAll();

      const response: ApiResponse<typeof categories> = {
        status: 1,
        message: "Categorías obtenidas correctamente",
        data: categories,
      };

      return res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        status: 0,
        message: error.message || "Error al obtener categorías",
      };

      return res.status(500).json(response);
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

      const category = await CategoryService.getById(id);

      const response: ApiResponse<typeof category> = {
        status: 1,
        message: "Categoría obtenida correctamente",
        data: category,
      };

      return res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        status: 0,
        message: error.message || "Error al obtener categoría",
      };

      if (error.message === "Categoría no encontrada") {
        return res.status(404).json(response);
      }

      return res.status(500).json(response);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const category = await CategoryService.create(req.body);

      const response: ApiResponse<typeof category> = {
        status: 1,
        message: "Categoría creada correctamente",
        data: category,
      };

      return res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        status: 0,
        message: error.message || "Error al crear categoría",
      };

      return res.status(400).json(response);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const {id} = req.params;

      const updatedCategory = await CategoryService.update(id, req.body);

      const response: ApiResponse<typeof updatedCategory> = {
        status: 1,
        message: "Categoría actualizada correctamente",
        data: updatedCategory,
      };

      return res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        status: 0,
        message: error.message || "Error al actualizar categoría",
      };

      if (error.message === "Categoría no encontrada") {
        return res.status(404).json(response);
      }

      if (error.message === "Id requerido") {
        return res.status(400).json(response);
      }

      return res.status(500).json(response);
    }
  },
};
