import { Request, Response } from "express";
import { serviceRecordService } from "./serviceRecord.service";
import * as admin from "firebase-admin";

const getOwnerId = async (req: Request): Promise<string> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Usuario no autenticado (ownerId no encontrado)");
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    throw new Error("Usuario no autenticado (token inválido)");
  }
};

export const ServiceRecordController = {
  async getAll(req: Request, res: Response) {
    try {
      const ownerId = await getOwnerId(req);
      
      // Permitir filtrado por cliente si viene en query
      if (req.query.clientId) {
        const records = await serviceRecordService.getByClient(req.query.clientId as string, ownerId);
        return res.json({
          status: 1,
          message: "Registros de servicio por cliente obtenidos",
          data: records,
        });
      }

      const records = await serviceRecordService.getAll(ownerId);
      return res.json({
        status: 1,
        message: "Registros de servicio obtenidos",
        data: records,
      });
    } catch (error: any) {
      return res.status(error.message.includes("autenticado") ? 401 : 500).json({
        status: 0,
        message: error.message || "Error al obtener registros de servicio",
        data: null,
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const ownerId = await getOwnerId(req);
      const record = await serviceRecordService.getById(req.params.id, ownerId);
      return res.json({
        status: 1,
        message: "Registro de servicio obtenido",
        data: record,
      });
    } catch (error: any) {
      const isForbidden = error.message.includes("acceso");
      const isNotFound = error.message.includes("no existe");
      const code = isForbidden ? 403 : isNotFound ? 404 : 500;
      return res.status(code).json({
        status: 0,
        message: error.message || "Error al obtener registro de servicio",
        data: null,
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const ownerId = await getOwnerId(req);
      const id = await serviceRecordService.create(req.body, ownerId);
      return res.status(201).json({
        status: 1,
        message: "Registro de servicio creado",
        data: { id },
      });
    } catch (error: any) {
      return res.status(400).json({
        status: 0,
        message: error.message || "Error al crear registro de servicio",
        data: null,
      });
    }
  },
};
