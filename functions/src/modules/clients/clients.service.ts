import { Client, ClientBase } from "./clients.model";
import { ClientsRepository } from "./clients.repository";

type UpdateClientData = Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>;

export const ClientsService = {
  async getAll(limit = 100) {
    return ClientsRepository.findAll(limit);
  },

  async getById(id: string) {
    if (!id) {
      throw new Error("Id requerido");
    }

    const client = await ClientsRepository.findById(id);
    if (!client) {
      throw new Error("Cliente no encontrado");
    }

    const stats = await ClientsRepository.calcularTipo(id);
    client.type = stats.tipo as any;
    client.appointmentsCount = stats.sesiones_total;
    (client as any).gasto_total = stats.gasto_total;
    (client as any).ultima_visita = stats.ultima_visita;
    (client as any).historial = await ClientsRepository.getHistorial(id);

    return client;
  },

  async create(data: ClientBase) {
    if (!data.firstName?.trim()) {
      throw new Error("El nombre es obligatorio");
    }

    if (!data.paternalSurname?.trim()) {
      throw new Error("El apellido paterno es obligatorio");
    }

    if (!data.phone?.trim()) {
      throw new Error("El teléfono es obligatorio");
    }

    const existing = await ClientsRepository.findByPhone(data.phone);
    if (existing) {
      throw new Error("El teléfono ya está registrado");
    }

    return ClientsRepository.create(data);
  },

  async update(id: string, data: UpdateClientData) {
    if (!id) {
      throw new Error("Id requerido");
    }

    const client = await ClientsRepository.findById(id);
    if (!client) {
      throw new Error("Cliente no encontrado");
    }

    if (data.phone) {
      const existing = await ClientsRepository.findByPhone(data.phone);
      if (existing && existing.id !== id) {
        throw new Error("El teléfono ya está registrado");
      }
    }

    return ClientsRepository.update(id, data);
  },

  async delete(id: string) {
    if (!id) {
      throw new Error("Id requerido");
    }

    const client = await ClientsRepository.findById(id);
    if (!client) {
      throw new Error("Cliente no encontrado");
    }

    if (client.appointmentsCount > 0 || client.servicesCount > 0) {
      throw new Error("No se puede eliminar: el cliente tiene historial de citas o servicios");
    }

    const deleted = await ClientsRepository.softDelete(id);
    if (!deleted) {
      throw new Error("Cliente no encontrado");
    }

    return deleted;
  },
};