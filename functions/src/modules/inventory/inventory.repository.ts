import { db } from "../../config/firebase";
import { InventoryItem } from "./inventoryItem.model";

const collection = db.collection("inventoryItems");

export class InventoryRepository {
  async create(item: InventoryItem) {
    const docRef = collection.doc();

    await docRef.set({
      ...item,
      createdAt: new Date()
    });

    return {
      ...item
    };
  }

  async getAll() {
    const snapshot = await collection.orderBy("name").get();
    return snapshot.docs.map(doc => ({
      ...(doc.data() as Omit<InventoryItem, "docId">)
    }));
  }

  async getById(id: string) {
    let doc = await collection.doc(id).get();

    if (!doc.exists) {
      // fallback por id lógico
      const q = await collection.where("id", "==", id).limit(1).get();
      if (q.empty) return null;
      doc = q.docs[0];
    }

    return {
      docId: doc.id,
      ...(doc.data() as Omit<InventoryItem, "docId">)
    };
  }

  async update(id: string, data: Partial<InventoryItem>) {
    const doc = await this.getById(id);
    if (!doc) throw new Error("Item no encontrado");

    await collection.doc(doc.docId).update({
      ...data,
      updatedAt: new Date()
    });
  }

  async delete(id: string) {
    const doc = await this.getById(id);
    if (!doc) return;

    await collection.doc(doc.docId).delete();
  }

  async getLowStock(): Promise<InventoryItem[]> {
    const snapshot = await collection.get();

    return snapshot.docs.map(doc => ({
      docId: doc.id,
      ...(doc.data() as InventoryItem)
    }));
    }
}