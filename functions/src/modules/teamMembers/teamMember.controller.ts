import { Request, Response } from "express";
import { teamMemberService } from "./teamMember.service";
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

export const TeamMemberController = {
  async getAll(req: Request, res: Response) {
    try {
      const ownerId = await getOwnerId(req);
      const members = await teamMemberService.getAll(ownerId);
      return res.json({
        status: 1,
        message: "Equipo obtenido correctamente",
        data: members,
      });
    } catch (error: any) {
      return res.status(error.message.includes("autenticado") ? 401 : 500).json({
        status: 0,
        message: error.message || "Error al obtener equipo",
        data: null,
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const ownerId = await getOwnerId(req);
      const member = await teamMemberService.getById(req.params.id, ownerId);
      return res.json({
        status: 1,
        message: "Miembro del equipo obtenido",
        data: member,
      });
    } catch (error: any) {
      const isForbidden = error.message.includes("acceso");
      const isNotFound = error.message.includes("no existe");
      const code = isForbidden ? 403 : isNotFound ? 404 : 500;
      return res.status(code).json({
        status: 0,
        message: error.message || "Error al obtener miembro del equipo",
        data: null,
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const ownerId = await getOwnerId(req);
      const id = await teamMemberService.create(req.body, ownerId);
      return res.status(201).json({
        status: 1,
        message: "Miembro del equipo creado",
        data: { id },
      });
    } catch (error: any) {
      const isConflict = error.message.includes("Ya existe una dueña");
      return res.status(isConflict ? 422 : 400).json({
        status: 0,
        message: error.message || "Error al crear miembro del equipo",
        data: null,
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const ownerId = await getOwnerId(req);
      await teamMemberService.update(req.params.id, ownerId, req.body);
      return res.json({
        status: 1,
        message: "Miembro del equipo actualizado",
        data: null,
      });
    } catch (error: any) {
      const isForbidden = error.message.includes("acceso");
      const isNotFound = error.message.includes("no existe");
      const code = isForbidden ? 403 : isNotFound ? 404 : 400;
      return res.status(code).json({
        status: 0,
        message: error.message || "Error al actualizar miembro del equipo",
        data: null,
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const ownerId = await getOwnerId(req);
      await teamMemberService.softDelete(req.params.id, ownerId);
      return res.json({
        status: 1,
        message: "Miembro del equipo eliminado (soft delete)",
        data: null,
      });
    } catch (error: any) {
      const isForbidden = error.message.includes("acceso");
      const isNotFound = error.message.includes("no existe");
      const code = isForbidden ? 403 : isNotFound ? 404 : 500;
      return res.status(code).json({
        status: 0,
        message: error.message || "Error al eliminar miembro del equipo",
        data: null,
      });
    }
  },
};
