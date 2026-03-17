import * as admin from "firebase-admin";
import { db } from "../../config/firebase";
import { InventoryItem } from "./inventoryItem.model";

const collection = db.collection("inventoryItems");

export class InventoryItemRepository {
  async getAll(): Promise<InventoryItem[]> {
    const snapshot = await collection.where("deletedAt", "==", null).get();
    
    // Fallback: Si no hay índice para ordenar combinando where + orderBy, ordenamos en RAM.
    const docs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InventoryItem));
    
    return docs.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getById(id: string): Promise<InventoryItem | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as InventoryItem;
  }

  async create(data: Omit<InventoryItem, "id">): Promise<InventoryItem> {
    const docRef = await collection.add(data);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as InventoryItem;
  }

  async update(id: string, data: Partial<InventoryItem>): Promise<void> {
    await collection.doc(id).update(data);
  }

  async delete(id: string): Promise<void> {
    await collection.doc(id).update({
      deletedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}
