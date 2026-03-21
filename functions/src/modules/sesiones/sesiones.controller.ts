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
  }
};
