import {InventoryRepository} from "./inventory.repository";
import {InventoryItem, InventoryItemInput} from "./inventoryItem.model";

export const InventoryService = {
  async getAll() {
    const items = await InventoryRepository.findAll();
    return items.filter((i) => i.isActive);
  },

  async getById(id: string) {
    const item = await InventoryRepository.findById(id);

    if (!item || !item.isActive) {
      throw new Error("Producto no encontrado");
    }

    return item;
  },

  async create(data: InventoryItemInput) {
    if (!data.name?.trim()) {
      throw {
        status: 2,
        message: "El nombre es obligatorio",
      };
    }

    if (!data.inventoryId) {
      throw {
        status: 2,
        message: "La categoría es obligatoria",
      };
    }

    if (!data.cost || data.cost.amount <= 0) {
      throw {
        status: 2,
        message: "El costo debe ser mayor a 0",
      };
    }

    const items = await InventoryRepository.findAll();

    const exists = items.some(
      (i) =>
        i.isActive &&
        i.inventoryId === data.inventoryId &&
        i.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );

    if (exists) {
      throw {
        status: 2,
        message: "Ya existe un producto con ese nombre en esta categoría",
      };
    }

    return InventoryRepository.create({
      ...data,
      name: data.name.trim(),
      isActive: true,
    });
  },

  async update(
    id: string,
    data: Partial<Omit<InventoryItem, "id" | "createdAt" | "updatedAt">>
  ) {
    if (!id) {
      throw {
        status: 2,
        message: "Id requerido",
      };
    }

    if (data.name !== undefined && !data.name.trim()) {
      throw {
        status: 2,
        message: "El nombre no puede estar vacío",
      };
    }

    if (data.cost && data.cost.amount <= 0) {
      throw {
        status: 2,
        message: "El costo debe ser mayor a 0",
      };
    }

    const updated = await InventoryRepository.update(id, data);

    if (!updated) {
      throw new Error("Producto no encontrado");
    }

    return updated;
  },

  async delete(id: string) {
    if (!id) {
      throw {
        status: 2,
        message: "Id requerido",
      };
    }

    const updated = await InventoryRepository.update(id, {
      isActive: false,
    });

    if (!updated) {
      throw new Error("Producto no encontrado");
    }

    return updated;
  },
};
