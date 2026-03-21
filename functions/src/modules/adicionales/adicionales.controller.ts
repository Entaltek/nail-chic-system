import { Request, Response } from 'express';
import { AdicionalesService } from './adicionales.service';

export const AdicionalesController = {
  async getAll(req: Request, res: Response) {
    try {
      const data = await AdicionalesService.getAll();
      res.json({
        status: 1,
        message: 'ok',
        data
      });
    } catch (error: any) {
      res.status(500).json({ status: 0, message: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body;
      const data = await AdicionalesService.create(payload);
      res.status(201).json({
        status: 1,
        message: 'ok',
        data
      });
    } catch (error: any) {
      res.status(400).json({ status: 0, message: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payload = req.body;
      const data = await AdicionalesService.update(id, payload);
      res.json({
        status: 1,
        message: 'ok',
        data
      });
    } catch (error: any) {
      res.status(400).json({ status: 0, message: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AdicionalesService.remove(id);
      res.json({
        status: 1,
        message: 'ok'
      });
    } catch (error: any) {
      res.status(400).json({ status: 0, message: error.message });
    }
  }
};
