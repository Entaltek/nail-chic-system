import { db } from '../../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { InventoryCategory, InventoryCategoryBase } from './category.model';

const collection = db.collection('inventoryCategories');

export const CategoryRepository = {

  async findAll(): Promise<InventoryCategory[]> {
    const snap = await collection.get();

    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    } as InventoryCategory));
  },

  async findById(id: string): Promise<InventoryCategory | null> {
    const doc = await collection.doc(id).get();

    if (!doc.exists) return null;

    return { id: doc.id, ...doc.data() } as InventoryCategory;
  },

  async create(data: InventoryCategoryBase): Promise<InventoryCategory> {
    const now = Timestamp.now();

    const ref = await collection.add({
      ...data,
      isActive: true,
      order: data.order ?? 0,
      createdAt: now,
      updatedAt: now,
    });

    const newDoc = await ref.get();

    return {
      id: newDoc.id,
      ...newDoc.data(),
    } as InventoryCategory;
  },

  async update(id: string, data: Partial<Omit<InventoryCategory, "id" | "createdAt" | "updatedAt">>) {
    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });

    return { id, ...data };
  },

  async remove(id: string): Promise<void> {
    await collection.doc(id).delete();
  },
};