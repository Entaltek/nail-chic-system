import { getAuth } from "firebase/auth";
import { Diseno, DisenoListResponse } from "@/types/diseno.types";
import { authFetch } from "@/lib/apiClient";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL) ?? 'https://us-central1-entaltek-manicura.cloudfunctions.net/api';

const getAuthToken = async (): Promise<string> => {
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error("Usuario no autenticado");
  }
  return await user.getIdToken();
};

export const getDisenos = async (params?: { nivel?: string; tag?: string; cursor?: string }): Promise<DisenoListResponse> => {
  const urlParams = new URLSearchParams();
  if (params?.nivel) urlParams.append("nivel", params.nivel);
  if (params?.tag) urlParams.append("tag", params.tag);
  if (params?.cursor) urlParams.append("cursor", params.cursor);

  const query = urlParams.toString() ? `?${urlParams.toString()}` : "";
  const res = await authFetch(`${BASE_URL}/disenos${query}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Error al obtener diseños");
  }

  const json = await res.json();
  return json.data;
};

export const createDiseno = async (formData: FormData): Promise<Diseno> => {
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}/disenos`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      // No setear Content-Type, el navegador lo asignará automáticamente a multipart/form-data con el boundary correcto
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Error al crear diseño");
  }

  const json = await res.json();
  return json.data;
};

export const updateDiseno = async (id: string, formData: FormData): Promise<Diseno> => {
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}/disenos/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Error al actualizar diseño");
  }

  const json = await res.json();
  return json.data;
};

export const deleteDiseno = async (id: string): Promise<void> => {
  const res = await authFetch(`${BASE_URL}/disenos/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Error al eliminar diseño");
  }
};
