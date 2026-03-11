import { Request, Response } from "express";
import { categoryService } from "./category.service";

export const CategoryController = {
  async getAll(req: Request, res: Response) {
    const categories = await categoryService.getAll();
    return res.json({
      status: 1,
      message: "Categorías obtenidas correctamente",
      data: categories,
    });
  },

  async create(req: Request, res: Response) {
    const id = await categoryService.create(req.body);
    return res.status(201).json({
      status: 1,
      message: "Categoría creada correctamente",
      data: { id },
    });
  },
};