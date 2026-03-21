import { Request, Response } from 'express';
import { CostosService } from './costos.service';

export const CostosController = {

  // GET /api/costos/resumen -> (mounted as /costos/resumen)
  async getResumen(req: Request, res: Response) {
    try {
      const result = await CostosService.getResumen();
      res.json({ status: 1, message: 'ok', data: result });
    } catch (err: any) {
      res.status(400).json({ status: 0, message: err.message, data: null });
    }
  },

  async getMetaMensual(req: Request, res: Response) {
    try {
      const result = await CostosService.getMetaMensual();
      res.json({ status: 1, message: 'ok', data: result });
    } catch (err: any) {
      res.status(400).json({ status: 0, message: err.message, data: null });
    }
  },

  async updateMetaMensual(req: Request, res: Response) {
    try {
      const result = await CostosService.updateMetaMensual(req.body);
      res.json({ status: 1, message: 'Meta actualizada', data: result });
    } catch (err: any) {
      res.status(400).json({ status: 0, message: err.message, data: null });
    }
  },

  // --- Costos Fijos ---
  async getCostosFijos(req: Request, res: Response) {
    try {
      const result = await CostosService.getCostosFijosGrouped();
      res.json({ status: 1, message: 'ok', data: result.data, meta: result.meta });
    } catch (err: any) {
      res.status(400).json({ status: 0, message: err.message, data: null });
    }
  },

  async createCostoFijo(req: Request, res: Response) {
    try {
      const result = await CostosService.createCostoFijo(req.body);
      res.status(201).json({ status: 1, message: 'Costo fijo guardado', data: result });
    } catch (err: any) {
      res.status(400).json({ status: 0, message: err.message, data: null });
    }
  },

  async updateCostoFijo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await CostosService.updateCostoFijo(id, req.body);
      res.json({ status: 1, message: 'Costo fijo actualizado', data: result });
    } catch (err: any) {
      const code = err.message === 'NOT_FOUND' ? 404 : 400;
      res.status(code).json({ status: 0, message: err.message, data: null });
    }
  },

  async deleteCostoFijo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CostosService.deleteCostoFijo(id);
      res.json({ status: 1, message: 'Costo fijo eliminado', data: null });
    } catch (err: any) {
      const code = err.message === 'NOT_FOUND' ? 404 : 400;
      res.status(code).json({ status: 0, message: err.message, data: null });
    }
  },

  // --- Fondos Ahorro ---
  async getFondosAhorro(req: Request, res: Response) {
    try {
      const result = await CostosService.getFondosAhorro();
      res.json({ status: 1, message: 'ok', data: result.data, meta: result.meta });
    } catch (err: any) {
      res.status(400).json({ status: 0, message: err.message, data: null });
    }
  },

  async createFondoAhorro(req: Request, res: Response) {
    try {
      const result = await CostosService.createFondoAhorro(req.body);
      res.status(201).json({ status: 1, message: 'Fondo guardado', data: result });
    } catch (err: any) {
      const status = err.message.includes('Ya existe') || err.message.includes('no puede superar') ? 422 : 400;
      res.status(status).json({ status: 0, message: err.message, data: null });
    }
  },

  async updateFondoAhorro(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await CostosService.updateFondoAhorro(id, req.body);
      res.json({ status: 1, message: 'Fondo actualizado', data: result });
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        res.status(404).json({ status: 0, message: err.message, data: null });
      } else {
        const status = err.message.includes('Ya existe') || err.message.includes('no puede superar') ? 422 : 400;
        res.status(status).json({ status: 0, message: err.message, data: null });
      }
    }
  },

  async deleteFondoAhorro(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CostosService.deleteFondoAhorro(id);
      res.json({ status: 1, message: 'Fondo eliminado', data: null });
    } catch (err: any) {
      const code = err.message === 'NOT_FOUND' ? 404 : 400;
      res.status(code).json({ status: 0, message: err.message, data: null });
    }
  }

};
