import { db } from '../../config/firebase';
import { InventoryCategory } from './category.model';

const collection = db.collection('inventoryCategories');

export const CategoryRepository = {
  async findAll(): Promise<InventoryCategory[]> {
    const snap = await collection.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryCategory));
  },

  async create(data: Omit<InventoryCategory, 'id'>) {
    const ref = await collection.add(data);
    return ref.id;
  },

  async update(id: string, data: Partial<InventoryCategory>) {
    await collection.doc(id).update(data);
  },

  async remove(id: string) {
    await collection.doc(id).delete();
  },
};
