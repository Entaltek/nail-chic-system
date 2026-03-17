import { InventoryItem } from "../stores/businessConfig";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getInventory = async () => {
  const res = await fetch(`${BASE_URL}/inventory-items`);

  if (!res.ok) {
    const text = await res.text();
    console.error("Respuesta backend:", text);
    throw new Error("Error fetching inventory");
  }

  const json = await res.json();
  return json.data ?? [];
};

export const createMovement = async (data: {
  itemId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason?: string;
}) => {
  const res = await fetch(`${BASE_URL}/inventory-movements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Respuesta backend:", text);
    throw new Error("Error creating movement");
  }

  return res.json();
};

export const createInventoryItem = async (data: Omit<InventoryItem, "id">) => {
  const res = await fetch(`${BASE_URL}/inventory-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Respuesta backend:", text);
    throw new Error("Error creating inventory item");
  }

  return res.json();
};

export const updateInventoryItemApi = async (id: string, data: Partial<InventoryItem>) => {
  const res = await fetch(`${BASE_URL}/inventory-items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Respuesta backend:", text);
    throw new Error("Error updating inventory item");
  }

  return res.json();
};

export const deleteInventoryItemApi = async (id: string) => {
  const res = await fetch(`${BASE_URL}/inventory-items/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Respuesta backend:", text);
    throw new Error("Error deleting inventory item");
  }

  return res.json();
};