import { CategoryRepository } from './category.repository';
import { InventoryCategory } from './category.model';

export const CategoryService = {
  async getAll() {
    return CategoryRepository.findAll();
  },

  async create(category: Omit<InventoryCategory, 'id'>) {
    // regla de negocio ejemplo
    if (!category.name || !category.superCategory) {
      throw new Error('Categoría inválida');
    }

    return CategoryRepository.create(category);
  },
};
