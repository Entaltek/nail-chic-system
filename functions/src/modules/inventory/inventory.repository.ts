import { db } from "../../config/firebase";
import { InventoryItem } from "./inventoryItem.model";

const collection = db.collection("inventoryItems");

export class InventoryRepository {
  async create(item: InventoryItem) {
    await collection.doc(item.id).set(item);
    return item;
  }

  async getAll() {
    const snapshot = await collection.orderBy("name").get();
    return snapshot.docs.map(doc => doc.data() as InventoryItem);
  }

  async getById(id: string) {
    const doc = await collection.doc(id).get();
    return doc.exists ? (doc.data() as InventoryItem) : null;
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