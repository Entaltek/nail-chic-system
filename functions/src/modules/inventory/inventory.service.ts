import { InventoryRepository } from "./inventory.repository";
import { InventoryItem, InventoryItemInput } from "./inventory.model";

export const InventoryService = {
  async getAll() {
    const items = await InventoryRepository.findAll();
    return items.filter(i => i.isActive);
  },

  async getById(id: string) {
    const item = await InventoryRepository.findById(id);

    if (!item) {
      throw new Error("Producto no encontrado");
    }

    return item;
  },

  async create(data: InventoryItemInput) {

    if (!data.name?.trim()) {
      throw {
        status: 2,
        message: "El nombre es obligatorio"
      };
    }

    if (!data.inventoryId) {
      throw {
        status: 2,
        message: "El inventoryId es obligatorio"
      };
    }

    if (!data.cost?.amount) {
      throw {
        status: 2,
        message: "El costo es obligatorio"
      };
    }

    const items = await InventoryRepository.findAll();

    const exists = items.some(
      i =>
        i.name.toLowerCase() === data.name.toLowerCase() &&
        i.inventoryId === data.inventoryId
    );

    if (exists) {
      throw {
        status: 2,
        message: "Ya existe un producto con ese nombre en esta categoría"
      };
    }

    const now = new Date();

    return InventoryRepository.create({
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now
    });
  },

  async update(
    id: string,
    data: Partial<Omit<InventoryItem, "id" | "createdAt" | "updatedAt">>
  ) {

    if (!id) {
      throw new Error("Id requerido");
    }

    if (data.name !== undefined && !data.name.trim()) {
      throw new Error("El nombre no puede estar vacío");
    }

    const updated = await InventoryRepository.update(id, {
      ...data,
      updatedAt: new Date()
    });

    if (!updated) {
      throw new Error("Producto no encontrado");
    }

    return updated;
  },

  async delete(id: string) {
    if (!id) {
      throw new Error("Id requerido");
    }

    const updated = await InventoryRepository.update(id, {
      isActive: false,
      updatedAt: new Date()
    });

    if (!updated) {
      throw new Error("Producto no encontrado");
    }

    return updated;
  }
};