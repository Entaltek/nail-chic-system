import { ServiceDefinition } from "@/stores/businessConfig";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getServices = async () => {
  const res = await fetch(`${BASE_URL}/services`);

  if (!res.ok) {
    const text = await res.text();
    console.error("Respuesta backend:", text);
    throw new Error("Error fetching services");
  }

  const json = await res.json();
  return json.data ?? [];
};

export const createService = async (data: Omit<ServiceDefinition, 'id'>) => {
  const res = await fetch(`${BASE_URL}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Respuesta backend:", text);
    throw new Error("Error creating service");
  }

  const json = await res.json();
  return json.data;
};

export const updateServiceApi = async (id: string, data: Partial<ServiceDefinition>) => {
  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Respuesta backend:", text);
    throw new Error("Error updating service");
  }

  const json = await res.json();
  return json.data;
};

export const deleteServiceApi = async (id: string) => {
  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Respuesta backend:", text);
    throw new Error("Error deleting service");
  }

  const json = await res.json();
  return json.data;
};
