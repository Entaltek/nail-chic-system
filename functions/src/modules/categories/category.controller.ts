import { Request, Response } from 'express';
import { CategoryService } from './category.service';

export const CategoryController = {
  async getAll(req: Request, res: Response) {
    const categories = await CategoryService.getAll();
    res.json(categories);
  },

  async create(req: Request, res: Response) {
    const id = await CategoryService.create(req.body);
    res.status(201).json({ id });
  },
};
