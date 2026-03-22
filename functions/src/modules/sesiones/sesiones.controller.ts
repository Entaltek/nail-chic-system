import { Request, Response } from 'express';
import { SesionesService } from './sesiones.service';

export const SesionesController = {
  iniciar: async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const sesion = await SesionesService.iniciarSesion(payload);
      
      res.status(201).json({
        status: 1,
        message: "Servicio iniciado",
        data: {
          id: sesion.id,
          servicio_nombre: sesion.servicio_nombre,
          precio_estimado: sesion.precio_estimado,
          tiempo_estimado_min: sesion.tiempo_estimado_min,
          inicio: sesion.inicio.toDate().toISOString(),
          estado: sesion.estado
        }
      });
    } catch (error: any) {
      console.error("[iniciarSesion] Error:", error);
      res.status(error.message === "Servicio no encontrado" ? 404 : 400).json({
        status: 0,
        message: error.message || "Error al iniciar servicio",
        data: null
      });
    }
  },

  finalizar: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const payload = req.body;
      const sesion = await SesionesService.finalizarSesion(id, payload);
      
      res.status(200).json({
        status: 1,
        message: "Servicio finalizado correctamente",
        data: {
          id: sesion.id,
          estado: sesion.estado,
          precio_cobrado: sesion.precio_cobrado,
          metodo_pago: sesion.metodo_pago,
          duracion_real_min: sesion.duracion_real_min
        }
      });
    } catch (error: any) {
      console.error("[finalizarSesion] Error:", error);
      res.status(error.message === "Sesión no encontrada" ? 404 : 400).json({
        status: 0,
        message: error.message || "Error al finalizar servicio",
        data: null
      });
    }
  }
};
