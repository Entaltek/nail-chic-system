const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchCategories = async () => {
  const res = await fetch(`${BASE_URL}/categories`);

  if (!res.ok) {
    throw new Error("Error obteniendo categorías");
  }

  const { data } = await res.json();

  return data;
};

export const createCategory = async (category: any) => {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });

  if (!res.ok) throw new Error("Error creando categoría");

  const { data } = await res.json();
  return data; 
};