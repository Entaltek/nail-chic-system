import { Request, Response } from "express";
import { ClientsService } from "./clients.service";
import { createClientSchema, updateClientSchema } from "./clients.schema";

export const ClientsController = {
  async getAll(_req: Request, res: Response) {
    try {
      const clients = await ClientsService.getAll();

      return res.status(200).json({
        status: "success",
        message: "Clientes obtenidos correctamente",
        data: clients,
        meta: null,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: "error",
        message: error.message || "Error al obtener clientes",
        data: null,
        meta: null,
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const client = await ClientsService.getById(req.params.id);

      return res.status(200).json({
        status: "success",
        message: "Cliente obtenido correctamente",
        data: client,
        meta: null,
      });
    } catch (error: any) {
      const isNotFound = error.message === "Cliente no encontrado";

      return res.status(isNotFound ? 404 : 500).json({
        status: "error",
        message: error.message || "Error al obtener cliente",
        data: null,
        meta: null,
      });
    }
  },

  async create(req: Request, res: Response) {
    const validation = createClientSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(422).json({
        status: "error",
        message: validation.error.issues[0].message,
        data: null,
        meta: null,
      });
    }

    try {
      const client = await ClientsService.create(validation.data);

      return res.status(201).json({
        status: "success",
        message: "Cliente creado correctamente",
        data: client,
        meta: null,
      });
    } catch (error: any) {
      const isDuplicate = error.message === "El teléfono ya está registrado";

      return res.status(isDuplicate ? 409 : 422).json({
        status: "error",
        message: error.message || "Error al crear cliente",
        data: null,
        meta: null,
      });
    }
  },

  async update(req: Request, res: Response) {
    const validation = updateClientSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(422).json({
        status: "error",
        message: validation.error.issues[0].message,
        data: null,
        meta: null,
      });
    }

    try {
      const client = await ClientsService.update(req.params.id, validation.data);

      return res.status(200).json({
        status: "success",
        message: "Cliente actualizado correctamente",
        data: client,
        meta: null,
      });
    } catch (error: any) {
      const isNotFound = error.message === "Cliente no encontrado";
      const isDuplicate = error.message === "El teléfono ya está registrado";

      return res.status(isNotFound ? 404 : isDuplicate ? 409 : 422).json({
        status: "error",
        message: error.message || "Error al actualizar cliente",
        data: null,
        meta: null,
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await ClientsService.delete(req.params.id);

      return res.status(200).json({
        status: "success",
        message: "Cliente eliminado correctamente",
        data: null,
        meta: null,
      });
    } catch (error: any) {
      const isNotFound = error.message === "Cliente no encontrado";
      const hasHistory = error.message.includes("historial");

      return res.status(isNotFound ? 404 : hasHistory ? 409 : 500).json({
        status: "error",
        message: error.message || "Error al eliminar cliente",
        data: null,
        meta: null,
      });
    }
  },
};