import { Request, Response } from 'express';
import { DisenoService } from './diseno.service';
import { parseMultipart } from '../../utils/parseMultipart';

export const DisenoController = {
  
  async list(req: Request, res: Response) {
    try {
      const { nivel, tag, cursor } = req.query;
      const data = await DisenoService.listDisenos({
        nivel: nivel as string | undefined,
        tag: tag as string | undefined,
        cursor: cursor as string | undefined
      });

      res.json({
        status: 1,
        message: 'ok',
        data
      });
    } catch (err: any) {
      const code = err.message === 'NOT_FOUND' ? 404 : 400;
      res.status(code).json({
        status: 0,
        message: err.message || 'Error al listar diseños',
        data: null
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { file, fields } = await parseMultipart(req);
      const multerLikeFile = file ? {
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size
      } : undefined;

      const diseno = await DisenoService.createDiseno(multerLikeFile as any, fields as any);
      
      res.status(201).json({
        status: 1,
        message: 'Diseño creado exitosamente',
        data: diseno
      });
    } catch (err: any) {
      res.status(400).json({
        status: 0,
        message: err.message || 'Error al crear diseño',
        data: null
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { file, fields } = await parseMultipart(req);
      const multerLikeFile = file ? {
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size
      } : undefined;

      const diseno = await DisenoService.updateDiseno(id, fields as any, multerLikeFile as any);
      
      res.json({
        status: 1,
        message: 'Diseño actualizado exitosamente',
        data: diseno
      });
    } catch (err: any) {
      const code = err.message === 'NOT_FOUND' ? 404 : 400;
      res.status(code).json({
        status: 0,
        message: err.message || 'Error al actualizar diseño',
        data: null
      });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await DisenoService.deleteDiseno(id);

      res.json({
        status: 1,
        message: 'Diseño eliminado',
        data: null
      });
    } catch (err: any) {
      const code = err.message === 'NOT_FOUND' ? 404 : 400;
      res.status(code).json({
        status: 0,
        message: err.message || 'Error al eliminar diseño',
        data: null
      });
    }
  }

};
