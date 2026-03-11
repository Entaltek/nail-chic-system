const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  if (!res.ok) throw new Error("Error creating movement");
  return res.json();
};
