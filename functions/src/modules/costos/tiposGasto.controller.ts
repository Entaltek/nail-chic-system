import { Request, Response } from 'express';
import { TiposGastoService } from './tiposGasto.service';

export const TiposGastoController = {
  async getTiposGasto(req: Request, res: Response): Promise<Response> {
    try {
      const list = await TiposGastoService.listTiposGasto();
      return res.status(200).json({ status: 1, message: 'ok', data: list });
    } catch (error: any) {
      return res.status(500).json({ status: 0, message: error.message, data: null });
    }
  },

  async createTipoGasto(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, color } = req.body;
      if (!nombre || !color) {
        return res.status(400).json({ status: 0, message: 'Faltan campos obligatorios', data: null });
      }
      const nuevo = await TiposGastoService.createTipoGasto({ nombre, color });
      return res.status(201).json({ status: 1, message: 'ok', data: nuevo });
    } catch (error: any) {
      return res.status(error.status || 500).json({ status: 0, message: error.message, data: null });
    }
  },

  async updateTipoGasto(req: Request, res: Response): Promise<Response> {
    try {
      const actualizado = await TiposGastoService.updateTipoGasto(req.params.id, req.body);
      return res.status(200).json({ status: 1, message: 'ok', data: actualizado });
    } catch (error: any) {
      return res.status(error.status || 500).json({ status: 0, message: error.message, data: null });
    }
  },

  async deleteTipoGasto(req: Request, res: Response): Promise<Response> {
    try {
      await TiposGastoService.deleteTipoGasto(req.params.id);
      return res.status(200).json({ status: 1, message: 'Eliminado correctamente', data: null });
    } catch (error: any) {
      return res.status(error.status || 500).json({ status: 0, message: error.message, data: null });
    }
  }
};
