import { db } from "../../config/firebase";
import { InventoryItem } from "./inventory.model";

const collection = db.collection("inventoryItems");

export class InventoryRepository {

  async create(item: Omit<InventoryItem, "id">) {
    const docRef = collection.doc();

    const newItem = {
      id: docRef.id,
      ...item
    };

    await docRef.set(newItem);

    return newItem;
  }

  async findAll(): Promise<InventoryItem[]> {
    const snapshot = await collection
      .where("isActive", "==", true)
      .orderBy("name")
      .get();

    return snapshot.docs.map(doc => doc.data() as InventoryItem);
  }

  async findById(id: string): Promise<InventoryItem | null> {
    const doc = await collection.doc(id).get();

    if (!doc.exists) return null;

    return doc.data() as InventoryItem;
  }

  async update(id: string, data: Partial<InventoryItem>) {
    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    await docRef.update({
      ...data,
      updatedAt: new Date()
    });

    const updated = await docRef.get();
    return updated.data() as InventoryItem;
  }

  async softDelete(id: string) {
    const docRef = collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    await docRef.update({
      isActive: false,
      updatedAt: new Date()
    });

    return true;
  }
}