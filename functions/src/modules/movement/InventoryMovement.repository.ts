import { db } from "../../config/firebase";
import { InventoryMovement } from "./InventoryMovement.model";

const collection = db.collection("inventory_movements");

export class InventoryMovementRepository {
  async create(data: InventoryMovement) {
    await collection.doc(data.id).set(data);
    return data;
  }

  async findAll() {
    const snapshot = await collection.get();
    return snapshot.docs.map(doc => doc.data());
  }

  async findByItem(itemId: string) {
    const snapshot = await collection.where("itemId", "==", itemId).get();
    return snapshot.docs.map(doc => doc.data());
  }
}
