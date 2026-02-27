export type InventoryMovement = {
  id?: string;
  productId: string;
  productName: string;
  type: "IN" | "OUT";
  quantity: number;
  reason?: string;
  date: string;
};
