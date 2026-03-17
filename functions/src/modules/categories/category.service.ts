import { CategoryRepository } from "./category.repository";
import type { InventoryCategory } from "./category.model";

export const categoryService = {
  async getAll(): Promise<InventoryCategory[]> {
    return CategoryRepository.findAll();
  },

  async create(category: Omit<InventoryCategory, "id">) {
    // regla de negocio ejemplo
    if (!category.name || !category.superCategory) {
      throw new Error("Categoría inválida");
    }

    if (!category.measurementType) {
      category.measurementType = "CUSTOM";
    }

    return CategoryRepository.create(category);
  },
};