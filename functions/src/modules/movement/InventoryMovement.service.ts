import { InventoryMovementRepository } from "./InventoryMovement.repository";
import { db } from "../../config/firebase";

export class InventoryMovementService {
  private repo = new InventoryMovementRepository();
  private itemsCollection = db.collection("inventoryItems");

  async createMovement(data: {
    itemId: string;
    type: "IN" | "OUT";
    quantity: number;
    reason?: string;
  }) {
    const itemRef = this.itemsCollection.doc(data.itemId);
    const itemSnap = await itemRef.get();

    if (!itemSnap.exists) {
      throw new Error("Inventory item not found");
    }

    const item = itemSnap.data() as any;

    // Detectar campo de stock dinámicamente
    let stockField: "stockPieces" | "currentStock" | null = null;

    if ("stockPieces" in item) stockField = "stockPieces";
    else if ("currentStock" in item) stockField = "currentStock";
    else throw new Error("This item does not handle stock movements");

    let currentStock = item[stockField];

    // Lógica de inventario
    let newStock = currentStock;

    if (data.type === "IN") {
      newStock += data.quantity;
    }

    if (data.type === "OUT") {
      if (currentStock < data.quantity) {
        throw new Error("Not enough stock");
      }
      newStock -= data.quantity;
    }

    await itemRef.update({ [stockField]: newStock });

    // 🚨 ALERTAS DE STOCK BAJO
    if (stockField === "stockPieces" && "minStockPieces" in item) {
      if (newStock <= item.minStockPieces) {
        console.log("⚠️ Stock bajo:", item.name);
      }
    }

    if (stockField === "currentStock" && "minStock" in item) {
      if (newStock <= item.minStock) {
        console.log("⚠️ Stock bajo:", item.name);
      }
    }

    // CREAR MOVIMIENTO
    const movement: any = {
      id: crypto.randomUUID(),
      itemId: data.itemId,
      type: data.type,
      quantity: data.quantity,
      createdAt: new Date(),
    };

    if (data.reason) {
      movement.reason = data.reason;
    }

    await this.repo.create(movement);

    return movement;
  }

  async getAllMovements() {
    return this.repo.findAll();
  }

  async getMovementsByItem(itemId: string) {
    return this.repo.findByItem(itemId);
  }
}
