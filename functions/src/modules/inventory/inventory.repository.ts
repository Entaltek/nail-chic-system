import { db } from "../../config/firebase";
import { InventoryItem } from "./inventoryItem.model";

const collection = db.collection("inventoryItems");

export class InventoryRepository {
  async create(item: InventoryItem) {
    const { id, ...data } = item as any;

    const docRef = await collection.add(data);

    return {
      id: docRef.id,
      ...data
    };
  }

  async getAll() {
    const snapshot = await collection.orderBy("name").get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<InventoryItem, "id">)
    }));
  }

  async getById(id: string) {
    const doc = await collection.doc(id).get();

    if (!doc.exists) return null;

    return {
      id: doc.id,
      ...(doc.data() as Omit<InventoryItem, "id">)
    };
  }

  async update(id: string, data: Partial<InventoryItem>) {
    await collection.doc(id).update({
      ...data,
      updatedAt: new Date()
    });
  }

  async delete(id: string) {
    await collection.doc(id).delete();
  }

  async getLowStock(): Promise<InventoryItem[]> {
    const snapshot = await collection.get();
    return snapshot.docs.map(doc => doc.data() as InventoryItem);
    }
}