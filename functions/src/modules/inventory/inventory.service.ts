import { InventoryRepository } from "./inventory.repository";
import { InventoryItem } from "./inventoryItem.model";

export class InventoryService {
  private repo = new InventoryRepository();

  async createItem(item: InventoryItem) {
    return this.repo.create(item);
  }

  async getItems() {
    return this.repo.getAll();
  }

  async getItem(id: string) {
    const item = await this.repo.getById(id);
    if (!item) throw new Error("Producto no encontrado");
    return item;
  }

  async updateItem(id: string, data: Partial<InventoryItem>) {
    await this.repo.update(id, data);
  }

  async deleteItem(id: string) {
    await this.repo.delete(id);
  }

  async getLowStockItems() {
    const items = await this.repo.getAll();
    return items.filter(i => i.stock <= i.minStock);
  }
}
