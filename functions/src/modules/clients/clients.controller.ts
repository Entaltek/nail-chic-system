import { Request, Response } from "express";
import { ClientsService } from "./clients.service";
import { createClientSchema, updateClientSchema } from "./clients.schema";

function mapToEnglish(raw: any) {
  const result: any = {};
  if (raw.nombre !== undefined) result.firstName = raw.nombre;
  if (raw.apellido_paterno !== undefined) result.paternalSurname = raw.apellido_paterno;
  if (raw.apellido_materno !== undefined) result.maternalSurname = raw.apellido_materno;
  if (raw.telefono !== undefined) result.phone = raw.telefono;
  if (raw.correo !== undefined) result.email = raw.correo;
  if (raw.tipo !== undefined) result.type = raw.tipo;
  else result.type = "nuevo"; // Default to nuevo since we dropped it
  return result;
}

function mapCliente(raw: any) {
  return {
    id:               raw.id,
    nombre:           raw.firstName   ?? raw.name        ?? raw.nombre,
    apellido_paterno: raw.paternalSurname ?? raw.lastName    ?? raw.apellido_paterno,
    apellido_materno: raw.maternalSurname ?? raw.secondLastName ?? raw.apellido_materno ?? null,
    telefono:         raw.phone       ?? raw.telefono,
    correo:           raw.email       ?? raw.correo ?? null,
    tipo:             raw.type        ?? raw.tipo ?? 'nuevo',
    sesiones_total:   raw.appointmentsCount ?? raw.servicesCount ?? raw.sesiones_total ?? 0,
    gasto_total:      raw.gasto_total    ?? 0,
    ultima_visita:    raw.updatedAt ?? raw.ultima_visita  ?? null,
    // Add dummy history for now if it doesn't exist, to prevent breaking GET /:id details drawer
    historial_sesiones: raw.historial ?? [],
  };
}

export const ClientsController = {
  async getAll(req: Request, res: Response) {
    try {
      const clients = await ClientsService.getAll();
      
      const { tipo, search } = req.query as Record<string, string>;
      let filtered = clients.map(mapCliente);

      if (tipo) {
        filtered = filtered.filter((c: any) => c.tipo === tipo);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((c: any) => 
          c.nombre.toLowerCase().includes(q) || 
          c.apellido_paterno.toLowerCase().includes(q) || 
          (c.apellido_materno ?? "").toLowerCase().includes(q)
        );
      }

      return res.status(200).json({
        status: "success",
        message: "Clientes obtenidos correctamente",
        data: filtered,
        meta: { total: filtered.length, page: 1, per_page: 20 },
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
        data: mapCliente(client),
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
    const englishPayload = mapToEnglish(req.body);
    const validation = createClientSchema.safeParse(englishPayload);

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
        data: mapCliente(client),
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
    const englishPayload = mapToEnglish(req.body);
    const validation = updateClientSchema.safeParse(englishPayload);

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
        data: mapCliente(client),
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