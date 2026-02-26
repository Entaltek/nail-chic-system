import { CategoryRepository } from './category.repository';
import { InventoryCategory } from './category.model';

export const CategoryService = {
  async getAll() {
    return CategoryRepository.findAll();
  },

  async getById(id: string) {
    const category = await CategoryRepository.findById(id);

    if (!category) {
      throw new Error("Categoría no encontrada");
    }

    return category;
  },

  async create(data: InventoryCategory) {

    if (!data.name?.trim()) {
      throw {
        status: 2,
        message: 'El nombre es obligatorio'
      };
    }

    if (!data.superCategory) {
      throw {
        status: 2,
        message: 'La super categoría es obligatoria'
      };
    }

    if (!data.inventoryVariant) {
      throw {
        status: 2,
        message: 'El tipo de inventario es obligatorio'
      };
    }

    if (!data.icon?.emoji || !data.icon?.bgClass) {
      throw {
        status: 2,
        message: 'El icono es obligatorio'
      };
    }

    const categories = await CategoryRepository.findAll();
    const exists = categories.some(
      c => c.name.toLowerCase() === data.name.toLowerCase()
    );

    if (exists) {
      throw {
        status: 2,
        message: 'Ya existe una categoría con ese nombre'
      };
    }

    return CategoryRepository.create(data);
  },

  async update(id: string, data: Partial<Omit<InventoryCategory, "id" | "createdAt" | "updatedAt">>) {
    if (!id) {
      throw new Error("Id requerido");
    }

    if (data.name !== undefined && !data.name.trim()) {
      throw new Error("El nombre no puede estar vacío");
    }

    const updated = await CategoryRepository.update(id, data);

    if (!updated) {
      throw new Error("Categoría no encontrada");
    }

    return updated;
  }
};
