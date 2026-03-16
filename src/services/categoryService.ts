import type { InventoryCategory, SuperCategoryType } from "@/stores/businessConfig";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CATEGORIES_URL = `${BASE_URL}/categories`;

type CategoryDTO = {
  id: string;
  name: string;
  superCategory: SuperCategoryType;
  description?: string;
  color?: string;
  icon?: string;
  createdAt?: any;
  updatedAt?: any;
};

type CategoriesResponse =
  | CategoryDTO[]
  | { data: CategoryDTO[] }
  | { categories: CategoryDTO[] }
  | { response: CategoryDTO[] }
  | { status: number; response: CategoryDTO[] };

const normalize = (dto: CategoryDTO): InventoryCategory => ({
  id: dto.id,
  name: dto.name,
  superCategory: dto.superCategory,
  description: dto.description ?? "",
  color: dto.color ?? "bg-blue-500",
  icon: dto.icon ?? "📦",
});

function extractCategories(json: CategoriesResponse): CategoryDTO[] {
  if (Array.isArray(json)) return json;

  // wrappers comunes
  const anyJson = json as any;
  if (Array.isArray(anyJson.categories)) return anyJson.categories;
  if (Array.isArray(anyJson.data)) return anyJson.data;
  if (Array.isArray(anyJson.response)) return anyJson.response;

  return [];
}

export const categoryService = {
  async getAll(): Promise<InventoryCategory[]> {
    const res = await fetch(CATEGORIES_URL);
    const json = (await res.json()) as CategoriesResponse;

    if (!res.ok) {
      const msg = (json as any)?.message ?? `Error cargando categorías: ${res.status}`;
      throw new Error(String(msg));
    }

    const list = extractCategories(json);

    // si viene vacío, te ayuda a detectar formato inesperado
    if (!Array.isArray(list)) {
      console.error("Formato inesperado /categories:", json);
      return [];
    }

    return list.map(normalize);
  },

  async create(payload: Omit<InventoryCategory, "id" | "createdAt" | "updatedAt">) {
    const res = await fetch(CATEGORIES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error((json as any)?.message ?? `Error creando categoría: ${res.status}`);
    return json as { id: string };
  },
};