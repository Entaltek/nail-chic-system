import { Request, Response } from 'express';
import { superCategoryService } from './superCategory.service';

export const SuperCategoryController = {
  async getAll(req: Request, res: Response) {
    try {
      const superCategories = await superCategoryService.getAll();
      return res.json({
        status: 1,
        message: 'Súper Categorías obtenidas correctamente',
        data: superCategories,
      });
    } catch (error: any) {
      return res.status(500).json({ status: 0, message: error.message, data: null });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const superCategory = await superCategoryService.getById(id);
      
      if (!superCategory) {
        return res.status(404).json({ status: 0, message: 'Súper Categoría no encontrada', data: null });
      }

      return res.json({
        status: 1,
        message: 'Súper Categoría obtenida correctamente',
        data: superCategory,
      });
    } catch (error: any) {
      return res.status(500).json({ status: 0, message: error.message, data: null });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const id = await superCategoryService.create(req.body);
      return res.status(201).json({
        status: 1,
        message: 'Súper Categoría creada correctamente',
        data: { id },
      });
    } catch (error: any) {
      return res.status(400).json({ status: 0, message: error.message, data: null });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await superCategoryService.update(id, req.body);
      return res.json({
        status: 1,
        message: 'Súper Categoría actualizada correctamente',
        data: { id },
      });
    } catch (error: any) {
      return res.status(400).json({ status: 0, message: error.message, data: null });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await superCategoryService.delete(id);
      return res.json({
        status: 1,
        message: 'Súper Categoría eliminada correctamente',
        data: { id },
      });
    } catch (error: any) {
      return res.status(400).json({ status: 0, message: error.message, data: null });
    }
  },
};
