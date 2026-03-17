import { db } from '../../config/firebase';
import { SuperCategory } from './superCategory.model';

const collection = db.collection('superCategories');

export const SuperCategoryRepository = {
  async findAll(): Promise<SuperCategory[]> {
    const snap = await collection.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SuperCategory));
  },

  async findById(id: string): Promise<SuperCategory | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as SuperCategory;
  },

  async create(data: Omit<SuperCategory, 'id'>): Promise<string> {
    const ref = await collection.add(data);
    return ref.id;
  },

  async update(id: string, data: Partial<SuperCategory>): Promise<void> {
    await collection.doc(id).update(data);
  },

  async remove(id: string): Promise<void> {
    await collection.doc(id).delete();
  },
};
