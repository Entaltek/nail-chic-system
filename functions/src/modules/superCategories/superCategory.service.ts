import * as admin from 'firebase-admin';
import { SuperCategoryRepository } from './superCategory.repository';
import type { SuperCategory } from './superCategory.model';

export const superCategoryService = {
  async getAll(): Promise<SuperCategory[]> {
    return SuperCategoryRepository.findAll();
  },

  async getById(id: string): Promise<SuperCategory | null> {
    return SuperCategoryRepository.findById(id);
  },

  async create(data: Partial<SuperCategory>) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('El nombre de la súper categoría es requerido');
    }
    if (!data.icon || !data.icon.bgClass) {
      throw new Error('El ícono es requerido y debe tener una clase de fondo (bgClass)');
    }

    const payload = {
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
    } as Omit<SuperCategory, 'id'>;

    return SuperCategoryRepository.create(payload);
  },

  async update(id: string, data: Partial<SuperCategory>) {
    const payload = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
    };

    return SuperCategoryRepository.update(id, payload);
  },

  async delete(id: string) {
    return SuperCategoryRepository.remove(id);
  },
};
