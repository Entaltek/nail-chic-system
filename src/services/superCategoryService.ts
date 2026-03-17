import type { SuperCategory } from "@/stores/businessConfig";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SUPER_CATEGORIES_URL = `${BASE_URL}/super-categories`;

// Tipos requeridos por el backend
export type CategoryIcon = {
  emoji: string;
  bgClass: string;
};

type SuperCategoryDTO = {
  id: string;
  name: string;
  icon: CategoryIcon;
  color: string;
  createdAt?: any;
  updatedAt?: any;
};

type SuperCategoriesResponse =
  | SuperCategoryDTO[]
  | { data: SuperCategoryDTO[] }
  | { superCategories: SuperCategoryDTO[] }
  | { response: SuperCategoryDTO[] }
  | { status: number; response: SuperCategoryDTO[] }
  | { status: number; message: string; data: SuperCategoryDTO[] };

// Mapea del DTO (Backend) a la interfaz del Store (Zustand)
const normalize = (dto: SuperCategoryDTO): SuperCategory => ({
  id: dto.id,
  name: dto.name,
  description: "", // El backend no parece tener descripción en el schema del modelo actual (o podemos usar un default)
  color: dto.color ?? dto.icon?.bgClass ?? "bg-blue-500",
  emoji: dto.icon?.emoji ?? "📦",
});

function extractSuperCategories(json: SuperCategoriesResponse): SuperCategoryDTO[] {
  if (Array.isArray(json)) return json;

  const anyJson = json as any;
  if (Array.isArray(anyJson.superCategories)) return anyJson.superCategories;
  if (Array.isArray(anyJson.data)) return anyJson.data;
  if (Array.isArray(anyJson.response)) return anyJson.response;

  return [];
}

export const superCategoryService = {
  async getAll(): Promise<SuperCategory[]> {
    const res = await fetch(SUPER_CATEGORIES_URL);
    const json = (await res.json()) as SuperCategoriesResponse;

    if (!res.ok) {
      const msg = (json as any)?.message ?? `Error cargando Súper Categorías: ${res.status}`;
      throw new Error(String(msg));
    }

    const list = extractSuperCategories(json);

    if (!Array.isArray(list)) {
      console.error("Formato inesperado /super-categories:", json);
      return [];
    }

    return list.map(normalize);
  },

  async create(payload: Omit<SuperCategory, "id">) {
    // Transformar payload de la store al formato esperado por el backend (con el icon Object)
    const backendPayload = {
      name: payload.name,
      color: payload.color,
      icon: {
        emoji: payload.emoji,
        bgClass: payload.color,
      },
      // Backend ignorará el description si no lo maneja, o lo puede guardar
    };

    const res = await fetch(SUPER_CATEGORIES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendPayload),
    });
    
    const json = await res.json();
    if (!res.ok) throw new Error((json as any)?.message ?? `Error creando súper categoría: ${res.status}`);
    return json?.data as { id: string }; // Basado en el `return res.status(201).json({ status: 1, message: "...", data: { id } })`
  },

  async update(id: string, payload: Partial<SuperCategory>) {
    const backendPayload: any = { ...payload };
    if (payload.emoji || payload.color) {
      backendPayload.icon = {
        emoji: payload.emoji,
        bgClass: payload.color,
      };
    }

    const res = await fetch(`${SUPER_CATEGORIES_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendPayload),
    });
    
    const json = await res.json();
    if (!res.ok) throw new Error((json as any)?.message ?? `Error actualizando súper categoría: ${res.status}`);
  },

  async delete(id: string) {
    const res = await fetch(`${SUPER_CATEGORIES_URL}/${id}`, {
      method: "DELETE",
    });
    
    const json = await res.json();
    if (!res.ok) throw new Error((json as any)?.message ?? `Error eliminando súper categoría: ${res.status}`);
  }
};
