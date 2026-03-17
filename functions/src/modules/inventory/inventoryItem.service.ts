import * as admin from "firebase-admin";
import { InventoryItemRepository } from "./inventoryItem.repository";
import { InventoryItem } from "./inventoryItem.model";

export class InventoryItemService {
  private repo = new InventoryItemRepository();

  async getAll() {
    return await this.repo.getAll();
  }

  async getById(id: string) {
    const item = await this.repo.getById(id);
    if (!item) {
      throw new Error("Producto no encontrado.");
    }
    return item;
  }

  async create(data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) {
    if (!data.name || !data.categoryId || data.purchaseCost === undefined) {
      throw new Error("Faltan campos requeridos: name, categoryId, purchaseCost.");
    }

    const itemToCreate: Omit<InventoryItem, "id"> = {
      ...data,
      measurementType: data.measurementType || "CUSTOM",
      createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      deletedAt: null,
    };

    return await this.repo.create(itemToCreate);
  }

  async update(id: string, data: Partial<InventoryItem>) {
    const dataToUpdate = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    };

    await this.repo.update(id, dataToUpdate);
  }

  async delete(id: string) {
    const item = await this.repo.getById(id);
    if (!item) {
      throw new Error("Producto no encontrado.");
    }
    await this.repo.delete(id);
  }
}
