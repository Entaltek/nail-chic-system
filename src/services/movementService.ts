export const createMovement = async (data: {
  itemId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason?: string;
}) => {
  const res = await fetch(`${__API_URL__}/inventory-movements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error creating movement");
  return res.json();
};
